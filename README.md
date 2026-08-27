# 🌿 Uva Explorer — Sri Lanka Highlands Travel & Tourism Platform

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Hosted-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)

---

## 📌 Project Overview
**Uva Explorer** is a modern, high-performance web application designed for travelers exploring the scenic highlands of **Uva Province, Sri Lanka** (including Ella, Haputale, Bandarawela, Badulla, Diyatalawa, and Welimada). 

The platform features an ultra-premium **Dribbble-inspired UI/UX** (Shot 27010990 aesthetic), providing real-time tourist destination discovery, interactive maps, day trip planning, local bus transport schedules, nearby facilities (hotels, hospitals, fuel stations, restaurants), and authentic user-submitted reviews & ratings.

---

## ✨ Key Features
- **🎨 Luxury Dribbble UI/UX Design**: Built with a curated Emerald Navy (`#0F291E`), Mint Teal (`#159A9C`), and Gold Accent (`#F4B942`) color palette, custom glassmorphism, Google Fonts (`Outfit` & `Plus Jakarta Sans`), rounded pill cards (`rounded-[32px]`), and smooth micro-animations.
- **⭐ Genuine Web App Reviews & Ratings**: Place ratings and review counts strictly reflect user reviews submitted inside this web application (MongoDB + local storage aggregation).
- **🗺️ Interactive Map & Navigation**: Leaflet.js map with OSRM (Open Source Routing Machine) day trip planning.
- **🌤️ Live Weather Advisory**: Weather updates for Ella, Haputale, and mountain passes.
- **🚌 Transport & Bus Schedules**: Intercity luxury express coach schedules and local bus routes.
- **🏥 Nearby Facilities Directory**: Instant filtering for hotels, hospitals, 24/7 fuel stations, cafes, and emergency contacts.
- **🛡️ Protected Admin Portal**: Secure system administration for managing places, reviews, user logs, and merchant promotion ads.

---

## 🛠️ Technology Stack & Architecture

### **Frontend (`client/`)**
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **Mapping & Routing**: Leaflet.js + OpenStreetMap + OSRM
- **State & Storage**: React Context + IndexedDB / LocalStorage

### **Backend (`server/`)**
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Security**: CORS, Environment-based secrets

### **Deployment (`root`)**
- **Platform**: Vercel (Monorepo Serverless Function Architecture)

---

## 📂 Project Directory Structure

```text
uva-explorer/
├── vercel.json                 # Vercel Monorepo deployment routes & serverless function config
├── package.json                # Root package configuration for build scripts
├── README.md                   # Project documentation & tutorial
├── client/                     # Vite + React 19 Frontend Application
│   ├── public/                 # Static images, icons, and place assets
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, Modals, Map, Carousels
│   │   ├── context/            # ThemeContext (Light/Dark mode)
│   │   ├── data/               # Static place definitions & fallback data
│   │   ├── pages/              # Home, Explore, PlaceDetails, Planner, Weather, Saved, Facilities, Admin
│   │   ├── services/           # API endpoints & bus schedule services
│   │   ├── utils/              # Review store & routing utilities
│   │   ├── App.jsx             # React router & global layouts
│   │   ├── index.css           # Design tokens, Google fonts & Tailwind CSS v4
│   │   └── main.jsx            # Vite entry point
│   ├── vite.config.js          # Vite build options
│   └── package.json            # Client dependencies
└── server/                     # Node.js + Express Backend API
    ├── config/                 # DB connection configuration
    ├── models/                 # Mongoose schemas (Place, Review, Admin, Facility, Ad, UserLog)
    ├── routes/                 # Express API routes (/api/places, /api/admin, /api/buses, etc.)
    ├── seed.js                 # Database seed script for initial 10 destinations
    ├── server.js               # Main Express app & Vercel serverless handler
    └── package.json            # Server dependencies
```

---

## 🔑 Environment Variables Reference

Create a `.env` file inside the `server/` folder for local development, and configure them in Vercel under **Project Settings ➔ Environment Variables**:

| Variable Name | Description | Example / Value |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Atlas Connection String | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/uva_explorer` |
| `PORT` | Local Express Server Port | `5000` |
| `VITE_API_URL` | Frontend API Base Endpoint (Client) | `https://your-project.vercel.app` (or leave empty for same-origin relative `/api`) |

---

## 🚀 Step-by-Step Tutorial: Uploading to GitHub & Hosting on Vercel

Follow these exact steps to host your **Uva Explorer** application on GitHub and Vercel for free.

---

### Step 1: Upload Your Project to GitHub

1. **Open Terminal / PowerShell** in the project root directory (`d:\uva-explorer`).
2. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   ```
3. **Stage and Commit all Files**:
   ```bash
   git add .
   git commit -m "Initial commit: Uva Explorer web app with Dribbble travel UI and Vercel support"
   ```
4. **Create a New Repository on GitHub**:
   - Go to [github.com/new](https://github.com/new).
   - Enter repository name: `uva-explorer`.
   - Keep visibility as **Public** (or **Private**).
   - Click **Create repository** (do NOT initialize with README).
5. **Link and Push your Code to GitHub**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/uva-explorer.git
   git push -u origin main
   ```

---

### Step 2: Deploy to Vercel (1-Click Monorepo Method)

1. **Log into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with your GitHub account.

2. **Import Repository**:
   - Click **"Add New..."** ➔ **"Project"**.
   - Select `uva-explorer` from your GitHub repository list.

3. **Configure Project Settings**:
   - **Framework Preset**: Choose **Vite** (or leave as **Other** — `vercel.json` automatically configures both client & server builds).
   - **Root Directory**: `./` (leave default).

4. **Add Environment Variable**:
   - Expand the **Environment Variables** section.
   - Add **`MONGO_URI`** = `mongodb+srv://your_username:your_password@cluster.mongodb.net/uva_explorer?retryWrites=true&w=majority`

5. **Deploy**:
   - Click **"Deploy"**.
   - Vercel will automatically build the React Vite static assets and bundle the Express server routes into Serverless Functions (`/api/*`).

6. **Seed Initial Database (Optional)**:
   - Run `node server/seed.js` locally with your production `MONGO_URI` to populate the initial 10 destinations in Uva Province.

---

## 💻 Local Development Setup

To run the application locally on your computer:

1. **Install Dependencies**:
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

2. **Start the Express Backend Server**:
   ```bash
   cd server
   node server.js
   ```
   *Runs on `http://localhost:5000`*

3. **Start the Vite Frontend Development Server**:
   ```bash
   cd client
   npm run dev
   ```
   *Runs on `http://localhost:5173`*

4. **Build Production Bundle**:
   ```bash
   cd client
   npm run build
   ```

---

## 📄 License
This project is developed for Uva Explorer Tourism & Travel Services, Sri Lanka. Distributed under the MIT License.
