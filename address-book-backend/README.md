# Extreme Programming Project - Contacts API (Backend)

This is the backend service for the **Extreme Programming** collaborative assignment. 
It is a robust RESTful API built with **Flask**, featuring a relational database design and advanced data processing capabilities for Excel integration.

### 🔗 Project Resources

| Resource | Link |
| :--- | :--- |
| **Live API (Render)** | [https://eight32302225-backend.onrender.com/](https://eight32302225-backend.onrender.com/) |
| **Frontend App (Vercel)** | [https://832302225-concacts-frontend.vercel.app/](https://832302225-concacts-frontend.vercel.app/) |
| **Frontend Repository** | [GitHub - Frontend](https://github.com/AcerXshot/832302225_concacts_frontend) |

---

### ✨ Key Features

* **🗄️ Relational Database Design:** Unlike simple flat-file storage, this project implements a **One-to-Many (1:N)** relationship using SQLite.
  * `contacts` table: Stores basic info (Name) and status (`is_favorite`).
  * `contact_details` table: Stores unlimited contact methods (Phone, Email, Address, WeChat, etc.) linked to a contact.
  
* **📊 Excel Integration (Pandas):** * **Export:** Generates dynamic Excel files on-the-fly, flattening the relational data into a user-friendly spreadsheet format using `pandas` and `openpyxl`.
  * **Import:** Parses uploaded Excel files to bulk-create contacts and automatically categorize contact details.

* **⭐ Advanced State Management:**
  * Supports toggling `is_favorite` status for "Favorites Only" filtering on the frontend.
  * Handles complex nested JSON payloads for creating/updating contacts with multiple details in a single transaction.

* **⚡ Production Ready:**
  * **CORS Enabled:** Configured to securely communicate with the Vercel frontend.
  * **Auto-Migration:** Automatically initializes the database schema (`CREATE TABLE IF NOT EXISTS`) upon cold start on the server.

---

### 🛠 Tech Stack

* **Core:** Python 3.13+
* **Framework:** Flask (REST API)
* **Data Processing:** **Pandas**, **OpenPyXL** (For Excel Import/Export logic)
* **Database:** SQLite3 (Relational Data Persistence)
* **Server:** Gunicorn (WSGI HTTP Server for production)

---

### 📡 API Endpoints Documentation

#### 1. Contact Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/contacts` | Get all contacts (includes nested `details` array). |
| `GET` | `/api/contacts?q={query}` | Search contacts by name or detail values. |
| `POST` | `/api/contacts` | Create a new contact with multiple details. |
| `PUT` | `/api/contacts/<id>` | Update name, favorites status, or replace details. |
| `DELETE` | `/api/contacts/<id>` | Delete a contact (Cascading delete for details). |

#### 2. Data Integration
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/export` | **Download** database as `.xlsx` file. |
| `POST` | `/api/import` | **Upload** `.xlsx` file to bulk insert contacts. |

---

### 📦 Payload Examples

**Create/Update Contact (JSON):**
```json
{
  "name": "Li Hua",
  "is_favorite": 1,
  "details": [
    { "type": "Phone", "value": "13800138000" },
    { "type": "Email", "value": "lihua@example.com" },
    { "type": "Address", "value": "Fuzhou University" }
  ]
}
```

---
### 🚀 How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/AcerXshot/832302225_concacts_backend.git](https://github.com/AcerXshot/832302225_concacts_backend.git)
    ```

2.  **Install dependencies:**
    *Make sure you have `pandas` and `openpyxl` installed for the Excel features.*
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the application:**
    ```bash
    python app.py
    ```
    *The server will start at `http://127.0.0.1:5000`.*

4.  **Database:**
    * The `database.db` file will be automatically created in the root directory upon the first run.



