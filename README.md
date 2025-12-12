# Extreme Programming Project: Full-Stack Contacts App

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%2B%20Pico.css-blue)
![Backend](https://img.shields.io/badge/Backend-Flask%20%2B%20SQLite-green)

This project is a collaborative software engineering assignment for the **Extreme Programming** course. It implements a robust, full-stack address book application featuring a Frontend-Backend Separated Architecture, advanced data management, and cloud deployment.

---

## 🔗 Live Demo & Resources

| Resource | Link |
| :--- | :--- |
| **🚀 Live Frontend** | **[Click to Visit (Vercel)](https://832302225-concacts-frontend.vercel.app/)** |
| **🛠️ Live API** | **[Backend Status (Render)](https://eight32302225-backend.onrender.com/)** |
| **📂 GitHub Repo** | [View Source Code](https://github.com/AcerXshot/EE308FZ_HuangZhirui--and-ChengYiming_Extreme-Programming) |

---

## ✨ Key Features

### 1. Core Contact Management
* **Dynamic Contact Methods (1:N):** Users are not limited to a single phone number. You can dynamically add unlimited details (Phone, Email, Address, WeChat, etc.) for a single contact.
* **CRUD Operations:** Create, Read, Update, and Delete contacts with real-time feedback.

### 2. Advanced XP Requirements
* **🌟 Favorites & Filtering:**
    * Mark important contacts as "Favorites" (Bookmarked).
    * **Priority Sorting:** Favorites always appear at the top of the list.
    * **Quick Filter:** A dedicated toggle button to view *only* bookmarked contacts.
* **📊 Excel Integration:**
    * **Export:** One-click download of the entire database into a formatted `.xlsx` file. The system automatically flattens relational data (e.g., multiple phones joined by `;`) into a readable spreadsheet.
    * **Import:** Bulk upload contacts via Excel. The backend automatically parses the file, handles 1:N relationships, and updates existing records.

### 3. User Experience
* **Smart Search:** Real-time search by name or specific details (e.g., searching for a phone number).
* **Pinyin Sorting:** Integrated `pinyin-pro` to correctly sort Chinese names alphabetically.
* **Responsive UI:** Built with **Pico.css** for a minimalist, dark-mode-enabled interface that works on mobile and desktop.

---

## 🛠️ Tech Stack & Architecture

The project adopts a **Frontend-Backend Separated Architecture**:

### Frontend (`/frontend`)
* **Core:** HTML5, Vanilla JavaScript (ES6+).
* **Styling:** Pico.css (Semantic HTML framework).
* **Logic:** DOM manipulation for dynamic forms, `fetch` API for backend communication.
* **Deployment:** Vercel (Automatic CD from GitHub).

### Backend (`/backend`)
* **Core:** Python 3.x, Flask.
* **Database:** SQLite (Relational model with Foreign Keys).
* **Data Processing:** Pandas, OpenPyXL (For Excel logic).
* **Deployment:** Render (Dockerized environment).
* **Features:** Automatic DB initialization on cold start, CORS support.

---

## 🚀 How to Run Locally

To run the entire project on your local machine, follow these steps:

### 1. Clone the Repository
```bash
git clone [https://github.com/AcerXshot/EE308FZ_HuangZhirui--and-ChengYiming_Extreme-Programming.git](https://github.com/AcerXshot/EE308FZ_HuangZhirui--and-ChengYiming_Extreme-Programming.git)
cd EE308FZ_HuangZhirui--and-ChengYiming_Extreme-Programming
```

### 2. Setup Backend
Open a terminal in the root folder:
```bash
cd backend

# Install dependencies (Flask, Pandas, OpenPyXL, etc.)
pip install -r requirements.txt

# Run the server
python app.py
```
The backend will start at http://127.0.0.1:5000. The database.db will be created automatically.

### 3. Setup Frontend
* **1**.Navigate to the frontend folder.

* **2**.Open script.js.

* **3**. Ensure the API URL points to your local backend:
```JavaScript
// Uncomment this line for local development
const API_BASE_URL = 'http://127.0.0.1:5000/api';
```
* **4**. Open `contacts.html` in your browser (or use Live Server in VS Code).

---

## 👥 Team Members

| ID | Name | Role |
| :--- | :--- | :--- |
| **832302225** | **Huang Zhirui** | Backend Dev, Database Design, Render Deployment, Git Master |
| **832302227** | **Cheng Yiming** | Frontend Dev, UI/UX Design, Vercel Deployment, Interaction Logic |

## 📄 License

This project is for educational purposes under the Extreme Programming course curriculum.
