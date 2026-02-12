# 🎓 CampusFix – Smart Campus Issue Reporting System

CampusFix is a smart web-based complaint management system designed for college campuses.  
It allows students to report issues and enables administrators to manage and resolve them efficiently.

---

## 🚀 Features

- 🔐 JWT-based Authentication
- 📝 Report Campus Issues
- 🤖 AI-based Sentiment & Category Detection
- 📊 Admin Dashboard
- 🔎 Duplicate Issue Detection
- 📁 Supabase PostgreSQL Database
- 🌐 REST API using Flask

---

## 🛠 Tech Stack

### Backend
- Python
- Flask
- Flask-JWT-Extended
- Supabase (PostgreSQL)
- AI Analyzer (Custom ML Logic)

### Frontend
- React.js / HTML / CSS

---

## 📂 Project Structure

CampusFix/
│── backend/
│ ├── routes/
│ ├── models/
│ ├── ai/
│ └── app.py
│
│── frontend/
│
│── assets/
│
│── README.md

For Testing Student Username-password
E-mail-nilaf94439@dwakm.com
Password-Dhruv2511
---

## ⚙️ Installation Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_ORG/CampusFix.git
cd CampusFix
2️⃣ Backend Setup
cd backend
pip install -r requirements.txt
python app.py
3️⃣ Setup Environment Variables
Create .env file:

SUPABASE_URL=your_url
SUPABASE_KEY=your_key
JWT_SECRET_KEY=your_secret
🗄 Database Tables
Users Table
Column	Type
id	UUID
name	Text
email	Text
password	Text
role	Text
Issues Table
Column	Type
id	UUID
title	Text
description	Text
category	Text
sentiment	Text
status	Text
user_id	UUID
📸 Screenshots
🏠 Homepage

🔐 Login Page

📊 Admin Dashboard

📝 Report Issue

🔒 Security
Passwords hashed before storing

JWT Authentication

Role-based access control

👨‍💻 Team
Dhruv Patil

Megh Bari

Sarangi Kini

Institution:
VIDYAVARDHINI'S BHAUSAHEB VARTAK POLYTECHNIC

📌 Future Enhancements
📱 Mobile App Integration

📊 Advanced Analytics Dashboard

🔔 Real-time Notifications

📍 Location-based Issue Tagging

🤖 Improved AI Model Accuracy

📜 License
This project is developed for educational purposes.


### Step 2:
Push README.md

### Step 3:
Commit message should be clean:
