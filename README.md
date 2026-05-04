LocaBusin - Local Business Booking System
LocaBusin is a full-stack web application designed to connect local customers with businesses. It features a robust booking management system with real-time capacity tracking, user role-based dashboards, and a review system.

🚀 Features
Dual User Roles: Separate interfaces for Customers (to browse and book) and Business Owners (to manage listings and appointments).

Smart Capacity Logic: Prevents overbooking by calculating real-time availability based on the SUM of quantities for specific dates.

Booking Management: Owners can Confirm or Cancel bookings to manage their schedule and dynamically free up capacity.

Review System: Customers can leave 1-5 star ratings and comments on business profiles.

Dynamic Image Gallery: Support for multiple business images with a functional preview gallery and banner switching.

🧠 Capacity Validation Logic:  The system ensures business integrity through a multi-step check:

Aggregation: It calculates the SUM(quantity) of all existing bookings that are NOT 'Cancelled' for a specific date.

Comparison: It adds the new requested quantity to that sum.

Prevention: If the total exceeds the business's total_capacity, the backend returns a 400 Bad Request error, preventing the database entry.

🛠️ Tech Stack
Frontend: HTML5, CSS3 (Bootstrap 5), JavaScript (Vanilla ES6).

Backend: Node.js, Express.js.

Database: MySQL.

Authentication: JSON Web Tokens (JWT) with secure password hashing (Bcrypt).

Middleware: Custom Auth middleware for role-based access control (RBAC).

📁 Database Schema
The system uses three core tables:

Users: Stores credentials and roles (owner vs customer).

Businesses: Stores business details, contact info, and total capacity limits.

Bookings: Tracks business IDs, user IDs, group quantities, and statuses (Pending, Confirmed, Cancelled).

📂 Project Structure

Plaintext
├── backend/
│   ├── routes/          # API Route definitions (bookings, users, businesses)
│   ├── middleware/      # JWT Authentication & Authorization
│   └── server.js        # Entry point
├── frontend/
│   ├── js/app.js        # Main frontend logic & API calls
│   ├── index.html       # Homepage
│   ├── owner-dashboard.html
│   └── business-details.html
└── .env.example         # Template for environment variables


⚙️ Installation & Setup

📋 Prerequisites
Node.js (v14 or higher)
MySQL Server
A modern web browser

1. Clone the Repository
2. 
Bash
git clone https://github.com/yourusername/locabusin.git
cd locabusin
3. Install Dependencies
Bash
npm install
4. Database Configuration
Create a MySQL database named locabusin_db.

Import the provided database.sql file or manually create tables based on the schema provided above.

4. Environment Variables
Create a .env file in the root directory and add your credentials:
Code snippet
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=locabusin_db
JWT_SECRET=your_super_secret_key

5. Run the Server
Bash
# Start the production server
npm start
# Or start with nodemon for development
npm run dev
