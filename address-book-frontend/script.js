/* global pinyinPro */

// 注意：这里改为本地地址，因为你的 Python 后端是在本地运行的
const API_BASE_URL = 'http://127.0.0.1:5000/api';
const CONTACTS_PER_PAGE = 8;
let allContacts = [];
let currentPage = 1;
let selectedContact = null;
let showFavoritesOnly = false;

// --- 1. 获取与渲染 ---

async function fetchDataAndRender() {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts`);
    if (!response.ok) throw new Error("API Error");
    allContacts = await response.json();
    updateSearchPlaceholder();
    currentPage = 1;
    renderPage();
  } catch (error) {
    console.error('获取联系人失败:', error);
    document.getElementById('contacts-list').innerHTML =
      '<article style="color: coral;">无法连接后端服务器，请确认 app.py 已运行。</article>';
  }
}

function renderPage() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();

  // 过滤逻辑更新：同时考虑搜索词 + 收藏状态
  const filteredContacts = allContacts.filter(contact => {
    // 1. 搜索匹配
    const nameMatch = contact.name.toLowerCase().includes(searchTerm);
    const detailsMatch = contact.details && contact.details.some(d => d.value.toLowerCase().includes(searchTerm));
    const isMatch = nameMatch || detailsMatch;

    // 2. 收藏匹配 (如果 showFavoritesOnly 为 true，则必须是 is_favorite=1)
    if (showFavoritesOnly && !contact.is_favorite) {
      return false;
    }

    return isMatch;
  });

  // 排序逻辑保持不变...
  filteredContacts.sort((a, b) => {
    // ... (保持原有的排序代码)
    if (a.is_favorite !== b.is_favorite) {
      return b.is_favorite - a.is_favorite;
    }
    return pinyinPro.pinyin(a.name, { toneType: 'none' }).localeCompare(pinyinPro.pinyin(b.name, { toneType: 'none' }));
  });

  // 分页渲染保持不变...
  const startIndex = (currentPage - 1) * CONTACTS_PER_PAGE;
  // ... (后面代码不用动)
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + CONTACTS_PER_PAGE);

  renderGroupedContacts(groupContacts(paginatedContacts));
  updatePaginationControls(filteredContacts.length);
}

// --- 新增：更新搜索框占位符 ---
function updateSearchPlaceholder() {
  const count = allContacts.length;
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.placeholder = `在 ${count} 位联系人中搜索...`;
  }
}

// 分组逻辑 (按首字母)
function groupContacts(contacts) {
  const groups = {};
  contacts.forEach(contact => {
    let firstLetter = pinyinPro.pinyin(contact.name, { pattern: 'first', toneType: 'none' }).toUpperCase();
    if (!/^[A-Z]$/.test(firstLetter)) firstLetter = '#';
    if (!groups[firstLetter]) groups[firstLetter] = [];
    groups[firstLetter].push(contact);
  });
  return groups;
}

// 渲染列表
function renderGroupedContacts(groupedContacts) {
  const listDiv = document.getElementById('contacts-list');
  listDiv.innerHTML = '';

  const groupKeys = Object.keys(groupedContacts).sort();
  if (groupKeys.length === 0) {
    listDiv.innerHTML = '<p style="text-align:center; color:#666;">暂无联系人</p>';
    return;
  }

  groupKeys.forEach(key => {
    // 组标题
    const header = document.createElement('div');
    header.className = 'list-group-header';
    header.textContent = key;
    listDiv.appendChild(header);

    // 联系人行
    groupedContacts[key].forEach(contact => {
      const item = document.createElement('div');
      item.className = 'contact-item';

      // 星星图标样式 (实心/空心)
      const starClass = contact.is_favorite ? 'star-btn active' : 'star-btn';
      const starFill = contact.is_favorite ? 'currentColor' : 'none';

      item.innerHTML = `
        <div class="contact-info" onclick="openDetail(${contact.id})">
          <strong>${contact.name}</strong>
          <small style="color: #888; margin-left: 0.5rem;">${contact.phone || '无电话'}</small>
        </div>
        <button class="icon-btn ${starClass}" onclick="toggleFavorite(event, ${contact.id}, ${contact.is_favorite})">
          <svg fill="${starFill}"><use href="#icon-star"></use></svg>
        </button>
      `;
      listDiv.appendChild(item);
    });
  });
}

function updatePaginationControls(totalItems) {
  const totalPages = Math.ceil(totalItems / CONTACTS_PER_PAGE) || 1;
  document.getElementById('page-info').textContent = `第 ${currentPage} / ${totalPages} 页`;
  document.getElementById('prev-page').disabled = currentPage === 1;
  document.getElementById('next-page').disabled = currentPage >= totalPages;
}

// --- 2. 交互功能 ---

// 切换收藏状态
async function toggleFavorite(event, id, currentStatus) {
  event.stopPropagation(); // 阻止触发点击详情
  const newStatus = currentStatus ? 0 : 1;

  try {
    await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_favorite: newStatus })
    });
    fetchDataAndRender(); // 重新加载以更新排序
  } catch (err) {
    alert('操作失败');
  }
}

// 导出 Excel
function exportContacts() {
  window.location.href = `${API_BASE_URL}/export`;
}

// 导入 Excel
document.getElementById('import-file-input').addEventListener('change', async function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE_URL}/import`, { method: 'POST', body: formData });
    if (res.ok) {
      alert('导入成功！');
      fetchDataAndRender();
    } else {
      const data = await res.json();
      alert('导入失败: ' + (data.error || '未知错误'));
    }
  } catch (err) {
    alert('网络错误');
  }
  e.target.value = ''; // 重置 Input
});

// --- 3. 动态表单辅助函数 ---

// 在指定容器中添加一行输入框
function addDetailRow(containerId, type = 'Phone', value = '') {
  const container = document.getElementById(containerId);
  const row = document.createElement('div');
  row.className = 'detail-row';
  row.innerHTML = `
    <select class="detail-type">
      <option value="Phone" ${type==='Phone'?'selected':''}>电话</option>
      <option value="Email" ${type==='Email'?'selected':''}>邮箱</option>
      <option value="Address" ${type==='Address'?'selected':''}>地址</option>
      <option value="WeChat" ${type==='WeChat'?'selected':''}>微信</option>
    </select>
    <input type="text" class="detail-value" value="${value}" placeholder="输入内容" required>
    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">删除</button>
  `;
  container.appendChild(row);
}

// 从容器中收集数据
function getDetailsFromForm(containerId) {
  const rows = document.querySelectorAll(`#${containerId} .detail-row`);
  const details = [];
  rows.forEach(row => {
    const type = row.querySelector('.detail-type').value;
    const value = row.querySelector('.detail-value').value;
    if (value.trim()) {
      details.push({ type, value });
    }
  });
  return details;
}

// --- 4. 模态框逻辑 ---

const addModal = document.getElementById('add-modal');
const editModal = document.getElementById('edit-modal');
const detailModal = document.getElementById('detail-modal');

// 打开添加框
function showAddModal() {
  document.getElementById('add-contact-form').reset();
  document.getElementById('add-details-container').innerHTML = '';
  addDetailRow('add-details-container', 'Phone'); // 默认加一行电话
  addModal.showModal();
}
function hideAddModal() { addModal.close(); }

// 打开详情框
function openDetail(id) {
  selectedContact = allContacts.find(c => c.id === id);
  if (!selectedContact) return;

  document.getElementById('detail-name').textContent = selectedContact.name;
  const contentDiv = document.getElementById('detail-content');
  contentDiv.innerHTML = '';

  // 渲染所有详情
  if (selectedContact.details && selectedContact.details.length > 0) {
    selectedContact.details.forEach(d => {
      contentDiv.innerHTML += `<p><strong>${d.method_type}:</strong> ${d.value}</p>`;
    });
  } else {
    contentDiv.innerHTML = '<p>暂无详细信息</p>';
  }

  detailModal.showModal();
}
function hideDetailModal() { detailModal.close(); }

// 打开修改框
document.getElementById('detail-edit-btn').addEventListener('click', () => {
  hideDetailModal();
  document.getElementById('edit-id').value = selectedContact.id;
  document.getElementById('edit-name').value = selectedContact.name;

  const container = document.getElementById('edit-details-container');
  container.innerHTML = '';

  // 填充现有数据
  if (selectedContact.details) {
    selectedContact.details.forEach(d => {
      addDetailRow('edit-details-container', d.method_type, d.value);
    });
  }
  if (container.children.length === 0) {
    addDetailRow('edit-details-container'); // 如果空的，加一行默认
  }

  editModal.showModal();
});
function hideEditForm() { editModal.close(); }

// 删除逻辑
document.getElementById('detail-delete-btn').addEventListener('click', async () => {
  if (confirm(`确定删除 ${selectedContact.name} 吗？`)) {
    await fetch(`${API_BASE_URL}/contacts/${selectedContact.id}`, { method: 'DELETE' });
    hideDetailModal();
    fetchDataAndRender();
  }
});

// --- 5. 表单提交 ---

// 添加提交
document.getElementById('add-contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('add-name').value;
  const details = getDetailsFromForm('add-details-container');

  const res = await fetch(`${API_BASE_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, details })
  });

  if (res.ok) {
    hideAddModal();
    fetchDataAndRender();
  } else {
    alert('添加失败');
  }
});

// 修改提交
document.getElementById('edit-contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const name = document.getElementById('edit-name').value;
  const details = getDetailsFromForm('edit-details-container');

  const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, details }) // is_favorite 保持不变，PUT 会部分更新吗？后端逻辑是覆盖更新。
    // 注意：我的后端代码逻辑中 PUT 如果不传 is_favorite 就不更新它，所以这里只传 name 和 details 是安全的。
  });

  if (res.ok) {
    hideEditForm();
    fetchDataAndRender();
  } else {
    alert('修改失败');
  }
});

// 初始化
document.addEventListener('DOMContentLoaded', fetchDataAndRender);

// 搜索监听
document.getElementById('search-input').addEventListener('input', () => {
  currentPage = 1;
  renderPage();
});
// 翻页监听
document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) { currentPage--; renderPage(); }
});
document.getElementById('next-page').addEventListener('click', () => {
  const totalPages = Math.ceil(allContacts.length / CONTACTS_PER_PAGE);
  if (currentPage < totalPages) { currentPage++; renderPage(); }
});

document.getElementById('toggle-fav-btn').addEventListener('click', function() {
  showFavoritesOnly = !showFavoritesOnly; // 切换状态
  currentPage = 1; // 重置到第一页

  // 切换按钮样式（激活时变成实心，非激活是轮廓）
  if (showFavoritesOnly) {
    this.classList.remove('outline'); // 变实心
    this.style.backgroundColor = '#f6ad55';
    this.style.borderColor = '#f6ad55';
    this.style.color = '#fff';
  } else {
    this.classList.add('outline'); // 变回轮廓
    this.style.backgroundColor = '';
    this.style.borderColor = '';
    this.style.color = '';
  }

  renderPage(); // 重新渲染列表
});

