# LocaBusin - Local Business Booking System

LocaBusin is a full-stack web application designed to connect local customers with businesses. It features a robust booking management system with real-time capacity tracking, user role-based dashboards, and a review system.

---

## 🚀 Features

### 👥 Dual User Roles
Separate interfaces for:
- **Customers** → Browse and book businesses
- **Business Owners** → Manage listings and appointments

### 🧠 Smart Capacity Logic
Prevents overbooking by calculating real-time availability using the **SUM of booking quantities** for specific dates.

### 📅 Booking Management
Business owners can:
- Confirm bookings
- Cancel bookings
- Dynamically free up capacity

### ⭐ Review System
Customers can:
- Leave ratings (1–5 stars)
- Add comments on business profiles

### 🖼️ Dynamic Image Gallery
- Multiple business images
- Preview gallery
- Banner image switching

---

# 🧠 Capacity Validation Logic

The system ensures booking integrity through a multi-step validation process:

### 1️⃣ Aggregation
Calculates the `SUM(quantity)` of all bookings that are **NOT Cancelled** for a selected date.

### 2️⃣ Comparison
Adds the newly requested quantity to the existing total.

### 3️⃣ Prevention
If the total exceeds the business `total_capacity`, the backend returns:

```http
400 Bad Request
```

This prevents overbooking and invalid database entries.

---

# 🛠️ Tech Stack

## Frontend
- HTML5
- CSS3
- Bootstrap 5
- Vanilla JavaScript (ES6)

## Backend
- Node.js
- Express.js

## Database
- MySQL

## Authentication
- JSON Web Tokens (JWT)
- Bcrypt Password Hashing

## Middleware
- Custom Authentication Middleware
- Role-Based Access Control (RBAC)

---

# 📁 Database Schema

The system uses three core tables:

## Users
Stores:
- User credentials
- Roles (`owner` / `customer`)

## Businesses
Stores:
- Business details
- Contact information
- Total capacity limits

## Bookings
Tracks:
- Business IDs
- User IDs
- Group quantities
- Booking statuses:
  - Pending
  - Confirmed
  - Cancelled

---

# 📂 Project Structure

```plaintext
├── backend/
│   ├── routes/              # API Route definitions
│   ├── middleware/          # JWT Authentication & Authorization
│   └── server.js            # Backend entry point
│
├── frontend/
│   ├── js/app.js            # Frontend logic & API calls
│   └──css/style.css         # Website Styling
│   ├── index.html           # Homepage
│   ├── owner-dashboard.html
│   └── business-detail.html
│   └── business-list.html
│   └── login.html
│   └── admin.html       
│   └── register.html        
│   └── dashboard.html      
└── .env.example             # Environment variables template
```

---

# ⚙️ Installation & Setup

## 📋 Prerequisites

Make sure you have installed:

- Node.js (v14 or higher)
- MySQL Server
- A modern web browser

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/locabusin.git
cd locabusin
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Database Configuration

Create a MySQL database named:

```sql
locabusin_db
```

Then:
- Import the `database.sql` file
- OR manually create tables using the schema

---

## 4️⃣ Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=locabusin_db
JWT_SECRET=your_super_secret_key
```

---

## 5️⃣ Run the Server

### Production

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

---

# ✅ Future Improvements

- Online payments integration
- Google Maps integration
- Real-time notifications
- Advanced analytics dashboard
- Business search filters

---

# 👨‍💻 Author

Developed by **Obaid Ashraf And His Team Members**

---
