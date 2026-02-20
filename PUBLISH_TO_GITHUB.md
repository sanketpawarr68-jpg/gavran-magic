
# 🦑 How to Publish Your Project to GitHub

To share your project or deploy it online, you first need to push your code to GitHub.

---

### Step 1: Create a New Repository on GitHub
1.  Go to your GitHub profile (https://github.com).
2.  Click the **+** icon in the top-right corner -> **New repository**.
3.  Name it: `gavran-magic`
4.  Make it **Public**.
5.  Do **NOT** initialize with README, .gitignore, or License (we already have code).
6.  Click **Create repository**.
7.  Copy the HTTPS URL: `https://github.com/sanketpawarr68-jpg/gavran-magic.git`

---

### Step 2: Push Your Code (Run these in Terminal)
Make sure you are in the project root folder: `d:\Projects\Gavran Magic Website\gavran-magic`

Open a terminal and run these commands one by one:

```bash
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. Commit your changes
git commit -m "Initial commit for Gavran Magic website"

# 4. Rename main branch
git branch -M main

# 5. Link to your GitHub repository
git remote add origin https://github.com/sanketpawarr68-jpg/gavran-magic.git

# 6. Push code to GitHub
git push -u origin main
```

---

### Step 3: Get a Live Demo URL (Deployment)
Just pushing to GitHub stores your code, but it doesn't make the website "live" automatically.

To get a link you can send to your friend (like `https://gavran-magic.netlify.app`), follow the **Deployment Guide**:
👉 Open the file: **`DEPLOY_TO_NETLIFY.md`** inside this project.

*   **Quick Demo**: Use `ngrok` (explained in that file) if you want a link *right now* without setting up servers.
*   **Permanent Link**: Follow the "Option 2" steps in that file to deploy to Netlify & Render using your new GitHub repo.
