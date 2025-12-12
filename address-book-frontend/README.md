# Extreme Programming Project - Contacts App

This is the frontend interface for the collaborative software engineering assignment: **Extreme Programming**.
It is a full-stack address book application featuring advanced data management, Excel integration, and a responsive user interface.

### 🔗 Project Resources

| Resource | Link |
| :--- | :--- |
| **Live App (Frontend)** | [Visit on Vercel](https://832302225-concacts-frontend.vercel.app/) |
| **Live API (Backend)** | [Deployed on Render](https://eight32302225-backend.onrender.com/) |
| **Backend Repository** | [GitHub - Backend](https://github.com/AcerXshot/832302225_concacts_backend) |

---

### ✨ Key Features

#### 1. Core Contact Management (CRUD) & Dynamic Details
* **Dynamic Contact Methods:** Unlike traditional address books, users can add **unlimited** contact details (Phone, Email, Address, WeChat, etc.) for a single person using a dynamic form interface.
* **List-Detail View:** A clean list view with a modal popup for viewing detailed information.

#### 2. Advanced Features (XP Requirements)
* **🌟 Bookmark / Favorites:** * Users can mark contacts as "Favorites" by clicking the star icon.
  * **Priority Sorting:** Favorite contacts are automatically pinned to the top of the list.
  * **"Favorites Only" Filter:** A dedicated toggle button next to the search bar to view only bookmarked contacts.
* **📊 Excel Import & Export:** * **Export:** One-click download of all contacts and their details into a formatted `.xlsx` file.
  * **Import:** Support for bulk uploading contacts via Excel files (powered by `pandas` on the backend).

#### 3. User Experience & UI
* **Smart Search:** Real-time filtering by name or specific contact details (e.g., searching a phone number).
* **Dynamic Placeholder:** The search bar indicates exactly how many contacts are currently in the database.
* **Pinyin Sorting:** Integrated `pinyin-pro` to correctly sort Chinese names alphabetically.
* **Responsive Dark Mode:** Built with **Pico.css** for a sleek, mobile-friendly dark theme.
* **Pagination:** Efficient client-side pagination with a compact, minimalist control bar.

---

### 🛠 Tech Stack

* **Frontend:**
  * **HTML5:** Semantic structure (Optimized for Vercel/Webpack strict validation).
  * **CSS:** **Pico.css** (Classless/Minimalist framework).
  * **JavaScript (ES6+):** Vanilla JS for DOM manipulation, `fetch` API for backend communication.
  * **Library:** `pinyin-pro` (For Chinese character sorting).

* **Backend (Associated):**
  * **Flask:** Python web framework.
  * **SQLite:** Relational database (using 1:N relationship for contacts and details).
  * **Pandas & OpenPyXL:** For robust Excel data processing.

---

### 🚀 How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/AcerXshot/832302225_concacts_frontend.git](https://github.com/AcerXshot/832302225_concacts_frontend.git)
    ```

2.  **Configure API Endpoint:**
  * Open `script.js`.
  * Set the `API_BASE_URL` to your backend address:
    * For local backend: `http://127.0.0.1:5000/api`
    * For live backend: `https://eight32302225-backend.onrender.com/api`

3.  **Run:**
  * Simply open `contacts.html` in any modern web browser (Edge, Chrome, Firefox).
  * *Optional:* Use `Live Server` in VS Code for a better development experience.

