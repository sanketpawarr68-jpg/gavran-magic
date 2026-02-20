
# 🚀 How to Deploy Gavran Magic Website to Netlify

You can easily deploy the **Frontend (React)** to Netlify for free.
However, since this is a full-stack app, the **Backend (Flask/Python)** must also be accessible online (not just localhost).

---

## 🟢 Option 1: Quick Demo (Keep Backend on Localhost)
Use this if you just want to show the website to someone **right now** while your computer is running.

1.  **Install & Run ngrok** (if not already running):
    *   Command: `ngrok http 5000`
    *   Copy the HTTPS URL (e.g., `https://api-xyz.ngrok-free.app`).

2.  **Update Frontend Config**:
    *   Open `frontend-react/src/config.js`.
    *   Paste your ngrok URL: `export const API_BASE_URL = 'https://api-xyz.ngrok-free.app';`
    *   Save the file.

3.  **Build the Frontend**:
    *   Open terminal in `frontend-react` folder.
    *   Run: `npm run build`
    *   This creates a `dist` folder.

4.  **Deploy to Netlify**:
    *   Go to [Netlify Drop](https://app.netlify.com/drop).
    *   Drag and drop the `frontend-react/dist` folder onto the page.
    *   **Done!** Netlify will give you a public URL (e.g., `https://gavran-magic.netlify.app`).

---

## 🔵 Option 2: Permanent Deployment (24/7 Live)
Use this if you want the website to work even when your computer is off.

### Step 1: Deploy Backend (Render.com - Free)
1.  Push your code to **GitHub**.
2.  Sign up for [Render.com](https://render.com/).
3.  Create a new **Web Service**.
4.  Connect your GitHub repo.
5.  Settings:
    *   **Root Directory**: `backend`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn app:app` (Make sure `gunicorn` is in `requirements.txt`)
6.  Deploy! Copy your new Backend URL (e.g., `https://gavran-backend.onrender.com`).

### Step 2: Update Frontend & Deploy to Netlify
1.  Update `frontend-react/src/config.js` with your **Render Backend URL**.
2.  Push changes to GitHub.
3.  Log in to [Netlify](https://www.netlify.com/).
4.  Click **"Add new site"** -> **"Import an existing project"**.
5.  Connect GitHub and select your repository.
6.  Settings:
    *   **Base directory**: `frontend-react`
    *   **Build command**: `npm run build`
    *   **Publish directory**: `frontend-react/dist`
7.  Click **Deploy**.

---

### ✅ Important Check
**Make sure `frontend-react/public/_redirects` exists!**
(I have already created this file for you. It ensures page refreshes work correctly on Netlify.)
