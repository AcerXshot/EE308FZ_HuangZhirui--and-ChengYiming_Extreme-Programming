import sqlite3
import pandas as pd
import os
from io import BytesIO
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_FILE = 'database.db'


# --- 数据库管理 ---

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """初始化数据库，创建支持多联系方式和收藏功能的表结构"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 开启外键支持
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. 主表：存储基础信息和收藏状态
      # [cite: 17, 18, 19] 对应收藏功能 (is_favorite)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            is_favorite INTEGER DEFAULT 0  -- 0:未收藏, 1:已收藏
        );
    """)

    # 2. 详情表：存储多种联系方式 (一对多关系)
      # [cite: 20, 21, 22] 对应多联系方式功能
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contact_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            method_type TEXT NOT NULL, -- 例如: 'Phone', 'Email', 'Address', 'Social'
            value TEXT NOT NULL,
            FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE
        );
    """)

    conn.commit()
    conn.close()
    print("数据库初始化完成。")


# --- 辅助函数：格式化联系人数据 ---
def format_contact(contact_row, details_rows):
    """
    将数据库查询结果转换为前端友好的 JSON 格式。
    """
    details = [dict(row) for row in details_rows]

    # 提取主要信息用于列表显示 (兼容旧前端)
    primary_phone = next((d['value'] for d in details if d['method_type'] == 'Phone'), '')
    primary_email = next((d['value'] for d in details if d['method_type'] == 'Email'), '')

    return {
        'id': contact_row['id'],
        'name': contact_row['name'],
        'is_favorite': contact_row['is_favorite'],  # 新增字段
        'phone': primary_phone,  # 兼容字段
        'email': primary_email,  # 兼容字段
        'details': details  # 完整详情数据
    }


# --- API 接口 ---

@app.route('/')
def index():
    return "Backend server is running. Access the API at /api/contacts"


# 1. 获取所有联系人 (支持搜索)
@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    query = request.args.get('q', '')
    conn = get_db_connection()
    cursor = conn.cursor()

    # 获取所有主表数据
    if query:
        search_term = f"%{query}%"
        # 这是一个简化搜索，实际生产中可能需要关联查询
        cursor.execute('SELECT * FROM contacts WHERE name LIKE ? ORDER BY is_favorite DESC, name ASC', (search_term,))
    else:
          # [cite: 18] 收藏的联系人排在前面 (ORDER BY is_favorite DESC)
        cursor.execute('SELECT * FROM contacts ORDER BY is_favorite DESC, name ASC')

    contacts_rows = cursor.fetchall()

    results = []
    for contact in contacts_rows:
        # 为每个联系人获取详情
        cursor.execute('SELECT * FROM contact_details WHERE contact_id = ?', (contact['id'],))
        details_rows = cursor.fetchall()
        results.append(format_contact(contact, details_rows))

    conn.close()
    return jsonify(results)


# 2. 添加联系人
@app.route('/api/contacts', methods=['POST'])
def add_contact():
    data = request.get_json()
    name = data.get('name')
    # 兼容前端发来的简单格式 {name, phone, email}
    # 也支持未来发来的复杂格式 {name, details: [...]}
    phone = data.get('phone')
    email = data.get('email')

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 插入主表
        cursor.execute('INSERT INTO contacts (name, is_favorite) VALUES (?, 0)', (name,))
        new_id = cursor.lastrowid

        # 插入详情表
        if phone:
            cursor.execute('INSERT INTO contact_details (contact_id, method_type, value) VALUES (?, ?, ?)',
                           (new_id, 'Phone', phone))
        if email:
            cursor.execute('INSERT INTO contact_details (contact_id, method_type, value) VALUES (?, ?, ?)',
                           (new_id, 'Email', email))

        # 如果前端传来了更多 details (未来扩展)
        if 'details' in data and isinstance(data['details'], list):
            for item in data['details']:
                cursor.execute('INSERT INTO contact_details (contact_id, method_type, value) VALUES (?, ?, ?)',
                               (new_id, item['type'], item['value']))

        conn.commit()

        # 返回完整对象
        cursor.execute('SELECT * FROM contact_details WHERE contact_id = ?', (new_id,))
        details_rows = cursor.fetchall()
        contact_row = {'id': new_id, 'name': name, 'is_favorite': 0}

        return jsonify(format_contact(contact_row, details_rows)), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# 3. 修改联系人 (支持修改收藏状态)
@app.route('/api/contacts/<int:id>', methods=['PUT'])
def update_contact(id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. 更新主表 (Name 和 Favorite)
        if 'name' in data:
            cursor.execute('UPDATE contacts SET name = ? WHERE id = ?', (data['name'], id))

          # [cite: 17, 18] 处理收藏状态更新
        if 'is_favorite' in data:
            cursor.execute('UPDATE contacts SET is_favorite = ? WHERE id = ?', (data['is_favorite'], id))

        # 2. 更新详情 (简单策略：删除旧的，插入新的)
        # 只有当请求中包含 phone/email 或 details 字段时才执行全量更新
        if 'phone' in data or 'email' in data or 'details' in data:
            cursor.execute('DELETE FROM contact_details WHERE contact_id = ?', (id,))

            # 重新插入 Phone
            if data.get('phone'):
                cursor.execute('INSERT INTO contact_details (contact_id, method_type, value) VALUES (?, ?, ?)',
                               (id, 'Phone', data.get('phone')))
            # 重新插入 Email
            if data.get('email'):
                cursor.execute('INSERT INTO contact_details (contact_id, method_type, value) VALUES (?, ?, ?)',
                               (id, 'Email', data.get('email')))
            # 处理其他详情
            if 'details' in data and isinstance(data['details'], list):
                for item in data['details']:
                    cursor.execute('INSERT INTO contact_details (contact_id, method_type, value) VALUES (?, ?, ?)',
                                   (id, item['type'], item['value']))

        conn.commit()

        # 重新获取数据返回
        cursor.execute('SELECT * FROM contacts WHERE id = ?', (id,))
        contact_row = cursor.fetchone()
        cursor.execute('SELECT * FROM contact_details WHERE contact_id = ?', (id,))
        details_rows = cursor.fetchall()

        if not contact_row:
            return jsonify({'error': 'Not found'}), 404

        return jsonify(format_contact(contact_row, details_rows))

    except Exception as e:
        conn.rollback()
        print(e)
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# 4. 删除联系人
@app.route('/api/contacts/<int:id>', methods=['DELETE'])
def delete_contact(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    # 由于设置了 ON DELETE CASCADE，删除主表记录会自动删除详情表记录
    cursor.execute('DELETE FROM contacts WHERE id = ?', (id,))
    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({'error': '联系人未找到'}), 404
    return jsonify({'message': '删除成功'})


# [cite_start]--- Excel 导入导出功能 [cite: 23, 24, 25, 26, 27] ---

# 导出 Excel
@app.route('/api/export', methods=['GET'])
def export_excel():
    conn = get_db_connection()

    # 获取所有数据
    contacts_df = pd.read_sql_query("SELECT * FROM contacts", conn)
    details_df = pd.read_sql_query("SELECT * FROM contact_details", conn)
    conn.close()

    if contacts_df.empty:
        return jsonify({'message': 'No data to export'}), 400

    # 数据处理：将详情表转为宽表格式 (Pivot)
    # 目标格式: Name | Phone | Email | Address | Is_Favorite
    export_data = []

    for _, contact in contacts_df.iterrows():
        row = {
            'Name': contact['name'],
            'Is Favorite': 'Yes' if contact['is_favorite'] else 'No'
        }

        # 查找该联系人的所有详情
        my_details = details_df[details_df['contact_id'] == contact['id']]

        # 将详情合并到行中。如果有多个电话，用分号连接 (符合"一行一条记录"的要求)
        for method in ['Phone', 'Email', 'Address', 'WeChat']:
            values = my_details[my_details['method_type'] == method]['value'].tolist()
            row[method] = "; ".join(values) if values else ""

        export_data.append(row)

    df = pd.DataFrame(export_data)

    # 写入内存中的 Excel 文件
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Contacts')
    output.seek(0)

    return send_file(
        output,
        download_name="contacts_export.xlsx",
        as_attachment=True,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )


# 导入 Excel
@app.route('/api/import', methods=['POST'])
def import_excel():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # 读取 Excel
        df = pd.read_excel(file)

        # 简单的列名映射检查
        required_cols = ['Name']
        if not all(col in df.columns for col in required_cols):
            return jsonify({'error': 'Excel format incorrect. Must have "Name" column.'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        count = 0
        for _, row in df.iterrows():
            name = row['Name']
            if pd.isna(name): continue  # 跳过空行

            # 插入联系人
            cursor.execute('INSERT INTO contacts (name, is_favorite) VALUES (?, 0)', (name,))
            new_id = cursor.lastrowid
            count += 1

            # 尝试读取常见的列并插入详情表
            # 映射关系: Excel列名 -> 数据库 method_type
            column_mapping = {
                'Phone': 'Phone',
                'Email': 'Email',
                'Address': 'Address',
                'WeChat': 'WeChat'
            }

            for excel_col, db_type in column_mapping.items():
                if excel_col in df.columns and not pd.isna(row[excel_col]):
                    val = str(row[excel_col]).strip()
                    if val:
                        # 如果有分号，说明有多个值
                        for v in val.split(';'):
                            if v.strip():
                                cursor.execute(
                                    'INSERT INTO contact_details (contact_id, method_type, value) VALUES (?, ?, ?)',
                                    (new_id, db_type, v.strip())
                                )

        conn.commit()
        conn.close()
        return jsonify({'message': f'Successfully imported {count} contacts'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- 主程序入口 ---

try:
    init_database()
    print('Database initialized')
except Exception as e:
    print(e)

if __name__ == '__main__':

    app.run(debug=True, port=5000)