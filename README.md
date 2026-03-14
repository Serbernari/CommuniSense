# CommuniSense 🛡️

**CommuniSense** is a one-click community-adaptive moderation and safety layer for Gemini-powered systems. It analyzes community norms from URLs or files to generate a tailored Moderation Constitution, protecting specialized communities without stifling their authentic culture.

---

## 🚀 One-Click Startup (Windows)

The simplest way to launch both the **Backend** and **Frontend** simultaneously:

1.  Open the project folder.
2.  Double-click **`start.bat`**.
3.  Two terminal windows will open: 
    *   **Window 1**: Sets up the Python environment and starts the **FastAPI Backend** (Port 8000).
    *   **Window 2**: Installs packages and starts the **Next.js Frontend** (Port 3000).

---

## 🛠️ Manual Setup

### 1. Backend Setup & Startup
Ensure you have the backend running first so the frontend can communicate with it.

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Unix/macOS:
source venv/bin/activate

pip install -r requirements.txt
playwright install chromium

# Launch the Backend
uvicorn main:app --reload
```

### 2. Frontend Setup & Startup
```bash
# In the root directory (hackathonn/)
npm install
npm run dev
```

---

## 📖 How to Use

1.  **Ingestion**: Paste a URL (e.g., a forum or rules page) or upload a file (TXT, PDF, CSV, JSON).
2.  **Community Profile**: CommuniSense infers behavioral norms, tone, and sensitive zones.
3.  **Moderation Constitution**: View the adaptive guidelines generated specifically for that community.
4.  **Testing Playground**: Test messages against the constitution to see how the system differentiates between "Slurs" and "Contextual Vocabulary".
5.  **Contextual Compare**: Compare how the same message is handled across different community types (e.g., Cooking Forum vs. Corporate Default).

---

## 💡 Key Scenarios

- **Cultural Nuance**: The system correctly identifies traditional terms (like the British dish "faggots") as safe in a cooking context while blocking them as slurs in a corporate environment.
- **Contextual Safety**: Uses a two-axis moderation system (Intrinsic Risk vs. Community Reception Risk).

---

## 🏆 Built With

- **Backend**: FastAPI, Google Gemini, Playwright, BeautifulSoup
- **Frontend**: Next.js, Lucide Icons, Vanilla CSS (Glassmorphism)
