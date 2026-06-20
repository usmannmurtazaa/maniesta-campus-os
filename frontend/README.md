<p align="center">
  <img src="./public/favicon.png" alt="Maniesta Campus OS Logo" width="120" />
</p>

# Maniesta Campus OS

[![Project](https://img.shields.io/badge/Maniesta_Campus_OS-v0.2.0-blue?style=flat-square)](https://maniestacampus.netlify.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&style=flat-square)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange?logo=firebase&style=flat-square)](https://firebase.google.com)
[![Netlify](https://img.shields.io/badge/Netlify-deployed-success?logo=netlify&style=flat-square)](https://maniestacampus.netlify.app)
[![License](https://img.shields.io/badge/license-ISC-blue.svg?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-brightgreen.svg?style=flat-square)](#)

A modern, scalable **Student Management SaaS** for educational institutions.  
Manage students, courses, attendance and marks across multiple campuses with real‑time dashboards, role‑based access and Firebase security.

---

## 📋 Overview

Maniesta Campus OS is a production‑grade, multi‑tenant platform that replaces spreadsheets and legacy software.  
It runs entirely on **Firebase** (Auth, Firestore, Storage) with a **React** frontend deployed on **Netlify**.

- **Multi‑tenancy** – Complete data isolation per institute (orgId).  
- **Role‑based access** – Admin, teacher and student roles with fine‑grained Firestore rules.  
- **Real‑time attendance** – Mark attendance live and view instant reports.  
- **Smart marksheets** – Automatic grade calculation and pass/fail status.  
- **Interactive dashboard** – Charts and key metrics for each organisation.  
- **Firebase security** – Enterprise‑grade rules prevent cross‑tenant data leaks.  

---

## ✨ Features

- 🔐 **Firebase Authentication** – Email/Password + Google Sign‑In  
- 🏫 **Organisation management** – Create or join an institute  
- 👥 **User roles** – Admin, Teacher, Student  
- 📚 **Student records** – Enroll, edit, paginate  
- 📖 **Course management** – Full CRUD with enrollment counts  
- 📅 **Attendance tracking** – Daily per‑course with batch save  
- 📊 **Marks & grades** – Exam types, auto‑computed percentages and grades  
- 📈 **Dashboard** – Stats cards, attendance trend chart, course distribution pie  
- 🔍 **Audit logs** – Track important actions (admin only)  
- 📬 **In‑app notifications** (planned)  
- 📱 **Fully responsive** – Works on mobile, tablet and desktop  

---

## 🧰 Tech Stack

| Category          | Technology                                    |
|-------------------|-----------------------------------------------|
| Frontend          | React 18, React Router 6, Tailwind CSS        |
| State / Context   | React Context API (AuthContext, OrgContext)    |
| Backend           | Firebase (Auth, Firestore, Storage)           |
| Charts            | Recharts                                      |
| Animations        | Framer Motion                                 |
| Notifications     | React Hot Toast                               |
| Icons             | React Icons                                   |
| Utilities         | date‑fns, clsx                                |
| Deployment        | Netlify                                       |

---

## 🏛️ Architecture Overview

```
┌────────────────────────────┐
│     React SPA (Netlify)    │
│  - Auth pages              │
│  - Org‑scoped portal       │
│  - Admin console           │
└───────────┬────────────────┘
            │ HTTPS
┌───────────▼────────────────┐
│       Firebase Cloud       │
│  - Authentication          │
│  - Firestore Database      │
│  - Storage (optional)      │
│  - Security Rules          │
└────────────────────────────┘
```

All data is scoped by `orgId` and guarded by Firestore Security Rules that read the user’s profile.  
No backend server – the client communicates directly with Firebase.

---

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/        # Reusable UI (Header, Sidebar, Footer, Guards)
│   ├── contexts/          # AuthContext, OrgContext
│   ├── hooks/             # Custom hooks (useDashboardData, etc.)
│   ├── layouts/           # OrgLayout (shell for institute pages)
│   ├── pages/             # All routes (Dashboard, Students, Courses, …)
│   ├── services/          # Firebase init and service functions
│   ├── utils/             # Helpers (validation, formatting)
│   ├── App.js             # Routing & providers
│   └── index.js           # Entry point
├── tailwind.config.js     # Design system (colors, typography, shadows)
├── netlify.toml           # SPA redirects & build config
└── .env                   # Local environment variables (never committed)
```

---

## 🔥 Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** → Email/Password and Google.
3. Create a **Cloud Firestore** database (start in test mode, then apply security rules).
4. In **Project settings** → **General** → **Your apps**, register a Web app and copy the Firebase config.
5. Replace the values in your `.env` file with the config values.

**Security Rules & Indexes**

- Copy the contents of `firestore.rules` into the Firebase Console → Firestore → Rules tab and publish.
- Create the required composite indexes by following the links that appear in your browser console, or by using the Firebase CLI:
  ```bash
  npx firebase deploy --only firestore:indexes
  ```
  The necessary indexes are automatically suggested when a query fails.

---

## ⚙️ Installation

```bash
git clone https://github.com/usmannmurtazaa/maniesta-campus-os.git
cd frontend
npm install
```

(Optional) Seed demo data using the **backend** seed script:

```bash
cd backend
npm install
# Set up a service account key and a .env file (see seed script instructions)
npm run seed
```

---

## 🚀 Running Locally

```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

**Log in** with a user created in Firebase Authentication (or the admin account if you ran the seed script).  
If you don’t have an organisation yet, you’ll be redirected to `/org-setup` where you can create one.

---

## 🌐 Deployment (Netlify)

1. Connect your Git repository to Netlify.
2. Netlify auto‑detects the build command (`npm run build`) and publish folder (`build`).
3. Set the `REACT_APP_FIREBASE_*` environment variables in **Site settings → Environment**.
4. Deploy.

The included `netlify.toml` already handles SPA redirects and caching for static assets.

---

## 📌 Future Roadmap

- [ ] Email notifications (password reset, announcements)
- [ ] Invite‑based organisation joining
- [ ] Student / parent portal with grade history
- [ ] File uploads for marksheets / documents
- [ ] Subscription plans & billing integration
- [ ] Enhanced analytics with exportable reports

---

## 🤝 Contributing

We welcome contributions!  
Please open an issue first to discuss what you’d like to change, or submit a pull request directly.

This project follows standard open‑source practices. Make sure your code is clean, tested, and documented.

---

## 📄 License

ISC – Maniesta Campus Team

---

## 👤 Author

<div align="center">
  <img src="https://avatars.githubusercontent.com/u/usmannmurtazaa?v=4" width="80" style="border-radius:50%"/>
  <h3 style="margin:0.5rem 0 0">Usman Murtaza</h3>
  <p style="margin:0; color:#6b7280">Full‑Stack Developer & SaaS Architect</p>
  <a href="https://usmanmurtaza.netlify.app" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Portfolio-Visit-blue?style=for-the-badge&logo=netlify" alt="Portfolio"/>
  </a>
  <br/>
  <a href="mailto:usmanmurtaza2004@gmail.com" style="font-size:0.9rem">usmanmurtaza2004@gmail.com</a>
</div>
