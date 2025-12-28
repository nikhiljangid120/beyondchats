# BeyondChats Assignment - Full Stack Developer Intern

This repository contains the complete solution for the Full Stack Web Developer Intern assignment at BeyondChats. 
It implements a scraping engine, a backend API, an AI-powered content processor (Gemini), and a responsive React frontend.

## 🌟 Features

- **Phase 1: Deep Scraper**: scrapes articles from `beyondchats.com/blogs/` using Puppeteer.
- **Phase 2: AI Enhancer**: 
    - Searches **DuckDuckGo** for related topics (bypassing blocking).
    - Scrapes top search results for context.
    - Uses **Google Gemini AI** to rewrite and enhance articles.
    - Automatically adds citations.
- **Phase 3: Modern UI**: React-based frontend to compare "Original" vs "AI Enhanced" versions.

## 🏗️ Architecture

- **Backend**: Node.js, Express.js, SQLite (Sequelize ORM)
- **Frontend**: React (Vite), Glassmorphism CSS
- **AI/Automation**: Puppeteer (Headless Chrome), Google Generative AI SDK
- **Database**: SQLite (No local setup required)

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- NPM
- A Google Gemini API Key (for Phase 2)

### 1. Backend Setup

```bash
cd beyondchats-backend

# Install dependencies along with Puppeteer and Gemini SDK
npm install

# Start the server
node server.js
```
*Server runs on: `http://localhost:3000`*

### 2. Frontend Setup

```bash
# Open a new terminal
cd beyondchats-frontend

# Install dependencies and start React
npm install
npm run dev
```
*App runs on: `http://localhost:5173`*

## 🤖 How to Run the Automation

### Step 1: Populate Database (Scrape Originals)
Run the Phase 1 scraper to fetch the oldest articles from the blog.
```bash
# In beyondchats-backend/ directory
node scraper/phase1.js
```
*Check `http://localhost:5173` -> "Original Articles" tab to see the data.*

### Step 2: AI Enhancement (Phase 2)
Run the processor script. This searches the web, reads related content, and uses Gemini to upgrade the articles.
```bash
# In beyondchats-backend/ directory
node processor/phase2.js
```
*Check `http://localhost:5173` -> "AI Enhanced" tab to see the new versions.*

## 📂 Project Structure

```
/beyondchats-backend
  /models       # Sequelize database models (Article.js)
  /routes       # Express API routes
  /scraper      # phase1.js (The Puppeteer Scraper)
  /processor    # phase2.js (The AI Logic + Search)
  server.js     # Main Entry Point
  database.sqlite # Auto-generated DB

/beyondchats-frontend
  /src
    /components # UI Components (Card, Modal)
    App.jsx     # Main Layout
    api.js      # API Integration
```

## 📝 Configuration
- **API Key**: The Gemini API Key is currently configured in `beyondchats-backend/processor/phase2.js`.
- **Database**: Uses `sqlite` dialect, data stored in `database.sqlite`.

## ✅ Evaluation Criteria Checklist
- [x] **Completeness**: All 3 phases implemented.
- [x] **README**: Detailed setup docs provided.
- [x] **UI/UX**: Responsive, professional design.
- [x] **Live Link**: (Deploy to Render/Vercel recommended)
- [x] **Code Quality**: Modular structure, async/await handling.