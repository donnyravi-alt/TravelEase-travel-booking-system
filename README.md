# ✈️ TravelEase – Travel Booking System

TravelEase is a full-stack web-based travel booking application designed to simplify the process of searching for travel options, viewing travel information, managing bookings, and handling user authentication.

The application follows a client-server architecture where the React frontend communicates with a Node.js/Express backend through REST APIs. The backend manages application logic, authentication, and communication with the MySQL database.

---

## 📌 Table of Contents

* [Project Overview](#project-overview)
* [Objectives](#objectives)
* [Key Features](#key-features)
* [System Architecture](#system-architecture)
* [Software Requirements Specification](#software-requirements-specification)
* [Functional Requirements](#functional-requirements)
* [Non-Functional Requirements](#non-functional-requirements)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Database Configuration](#database-configuration)
* [Environment Variables](#environment-variables)
* [Running the Application](#running-the-application)
* [Application Workflow](#application-workflow)
* [Authentication and Security](#authentication-and-security)
* [Testing](#testing)
* [Troubleshooting](#troubleshooting)
* [Future Enhancements](#future-enhancements)
* [Team Contribution](#team-contribution)
* [Conclusion](#conclusion)

---

# 📖 Project Overview

TravelEase is a web-based travel booking system that provides users with a convenient platform to interact with travel-related services through a centralized application.

The system consists of two major parts:

* **Frontend:** React-based user interface
* **Backend:** Node.js and Express.js REST API server

The backend communicates with a **MySQL database** to store and retrieve application data.

The frontend is configured to communicate with the backend through:

```text
http://localhost:5000
```

---

# 🎯 Objectives

The main objectives of TravelEase are:

1. To provide a simple and user-friendly travel booking interface.
2. To allow users to interact with travel and booking information digitally.
3. To provide user authentication and secure access.
4. To store application data in a structured MySQL database.
5. To provide communication between frontend and backend using REST APIs.
6. To reduce manual handling of travel booking information.
7. To provide a centralized platform for managing travel-related operations.

---

# ⭐ Key Features

* User registration and login
* User authentication using JWT
* Password hashing using bcrypt
* Travel-related information management
* Booking functionality
* REST API-based communication
* MySQL database integration
* Responsive frontend interface
* Navigation using React Router
* Data visualization using Chart.js
* Backend API support
* Cross-Origin Resource Sharing (CORS)

---

# 🏗️ System Architecture

TravelEase follows a three-layer client-server architecture:

```text
                ┌──────────────────────┐
                │       USER           │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   React Frontend     │
                │  HTML/CSS/JavaScript │
                └──────────┬───────────┘
                           │
                     REST API Requests
                           │
                           ▼
                ┌──────────────────────┐
                │ Node.js + Express.js │
                │      Backend         │
                └──────────┬───────────┘
                           │
                    SQL Queries
                           │
                           ▼
                ┌──────────────────────┐
                │   MySQL Database     │
                └──────────────────────┘
```

### Data Flow

```text
User
 ↓
React Frontend
 ↓
Express REST API
 ↓
Node.js Backend
 ↓
MySQL Database
 ↓
Backend Response
 ↓
React Frontend
 ↓
User
```

---

# 📋 Software Requirements Specification

## 1. Introduction

### 1.1 Purpose

The purpose of this system is to provide an online travel booking platform that allows users to interact with travel services and manage booking-related activities digitally.

### 1.2 Scope

The system covers:

* User registration
* User login
* Authentication
* Travel information
* Booking operations
* Database management
* Backend API communication
* User interface and navigation

### 1.3 Intended Users

The primary users of the system are:

* Customers/Travelers
* System administrators or authorized users

---

# ⚙️ Functional Requirements

## FR1 – User Registration

The system shall allow new users to create an account by providing the required registration details.

## FR2 – User Login

The system shall allow registered users to log in using their credentials.

## FR3 – Authentication

The system shall authenticate users and provide a JWT token after successful authentication.

## FR4 – Travel Information

The system shall allow users to access relevant travel information through the application.

## FR5 – Booking

The system shall allow users to provide the required information and perform travel booking operations.

## FR6 – Database Operations

The system shall store and retrieve application information from the MySQL database.

## FR7 – API Communication

The frontend shall communicate with the backend through REST APIs.

## FR8 – Navigation

The application shall provide navigation between different pages using React Router.

---

# 🔒 Non-Functional Requirements

### Performance

The system should respond to user requests within a reasonable time.

### Security

User passwords should not be stored as plain text. Authentication and password hashing mechanisms are implemented using JWT and bcrypt.

### Usability

The interface should be simple and easy to navigate.

### Reliability

The system should handle valid user requests and database operations consistently.

### Maintainability

The project is divided into separate frontend and backend components to make development and maintenance easier.

### Scalability

The client-server architecture allows additional modules and features to be added in the future.

---

# 🛠️ Technology Stack

## Frontend

| Technology       | Purpose                            |
| ---------------- | ---------------------------------- |
| React.js         | Building the user interface        |
| JavaScript       | Application logic and interactions |
| Bootstrap        | UI styling and responsive design   |
| React Router     | Page navigation                    |
| Chart.js         | Data visualization                 |
| React Chart.js 2 | Integration of Chart.js with React |

The current frontend dependencies include React 18, Bootstrap 5.3, React Router 6, Chart.js and React Chart.js 2.

## Backend

| Technology | Purpose                                    |
| ---------- | ------------------------------------------ |
| Node.js    | Runtime environment for backend JavaScript |
| Express.js | Backend framework and REST API             |
| mysql2     | Communication between Node.js and MySQL    |
| JWT        | User authentication                        |
| bcryptjs   | Password hashing                           |
| CORS       | Cross-origin communication                 |
| dotenv     | Environment configuration                  |

These backend dependencies are present in the project's current `server/package.json`.

## Development Tools

* Visual Studio Code
* Git
* GitHub
* MySQL
* Postman
* Web Browser

---

# 📁 Project Structure

```text
TravelEase-travel-booking-system/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

The repository is organized into separate `client` and `server` directories.

---

# 💻 Prerequisites

Before running TravelEase, install the following software:

### 1. Node.js

Install Node.js from the official website.

Check installation:

```bash
node --version
npm --version
```

### 2. MySQL

Install MySQL Server and MySQL Workbench if required.

Check that the MySQL server is running before starting the backend.

### 3. Git

Git is recommended for cloning the repository.

Check installation:

```bash
git --version
```

### 4. Code Editor

Visual Studio Code is recommended for development.

### 5. Web Browser

A modern browser such as Chrome, Edge or Firefox is recommended.

---

# 📥 Installation

## Step 1 – Clone the Repository

```bash
git clone https://github.com/donnyravi-alt/TravelEase-travel-booking-system.git
```

Move into the project directory:

```bash
cd TravelEase-travel-booking-system
```

---

# 📦 Step 2 – Install Backend Dependencies

Open a terminal and run:

```bash
cd server
npm install
```

This installs the backend dependencies specified in `server/package.json`.

---

# 📦 Step 3 – Install Frontend Dependencies

Open another terminal:

```bash
cd client
npm install
```

This installs the React frontend dependencies.

---

# 🗄️ Database Configuration

TravelEase uses **MySQL** as its relational database.

Before starting the backend:

1. Install MySQL.
2. Start the MySQL server.
3. Create the required database.
4. Create/configure the required tables.
5. Configure the database credentials in the backend environment configuration.

Example:

```sql
CREATE DATABASE travelease;
```

> Use the database name, username, password and other values expected by the backend configuration in your project. Do not commit actual passwords or secret keys to GitHub.

---

# 🔐 Environment Variables

Create an environment configuration file in the backend if required by the project.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=travelease
JWT_SECRET=your_secret_key
```

### Important

Do not upload real database passwords, JWT secrets or other sensitive credentials to GitHub.

Add environment files to `.gitignore`:

```text
.env
```

---

# ▶️ Running the Application

TravelEase consists of two applications:

* React frontend
* Node.js/Express backend

Both should be running at the same time.

---

## Step 1 – Start Backend

Open Terminal 1:

```bash
cd server
npm install
npm start
```

The backend runs using:

```bash
node server.js
```

The project's backend `package.json` defines `npm start` as `node server.js`.

The backend is expected to run on:

```text
http://localhost:5000
```

---

## Step 2 – Start Frontend

Open Terminal 2:

```bash
cd client
npm install
npm start
```

The React development server is started using:

```text
react-scripts start
```

The current frontend configuration also uses:

```text
http://localhost:5000
```

as its backend proxy.

The frontend can normally be accessed through:

```text
http://localhost:3000
```

---

# 🔄 Application Workflow

The basic workflow is:

```text
1. User opens TravelEase
          ↓
2. React loads the frontend
          ↓
3. User registers/logs in
          ↓
4. Frontend sends request to backend API
          ↓
5. Node.js + Express processes request
          ↓
6. Backend communicates with MySQL
          ↓
7. Database returns required information
          ↓
8. Backend sends response
          ↓
9. React displays the result
          ↓
10. User performs travel/booking operations
```

---

# 🔐 Authentication and Security

TravelEase uses several mechanisms for handling authentication and application security.

### JWT Authentication

JSON Web Tokens are used for authentication.

General flow:

```text
Login
 ↓
Credentials sent to backend
 ↓
Credentials verified
 ↓
JWT generated
 ↓
Token used for authenticated requests
```

### Password Hashing

Passwords are handled using `bcryptjs` rather than being stored directly as plain-text passwords.

### Environment Configuration

`dotenv` is included in the backend to support environment-based configuration.

### CORS

The backend uses CORS to manage cross-origin communication between the frontend and backend.

---

# 🧪 Testing

The application can be tested at multiple levels.

## Frontend Testing

Check:

* Page navigation
* Form validation
* User interface
* Booking flow
* Login and registration
* Display of backend data

## Backend Testing

Use Postman to test REST APIs.

Example workflow:

```text
Postman
   ↓
Send API Request
   ↓
Express Server
   ↓
Backend Logic
   ↓
MySQL
   ↓
API Response
```

Check:

* HTTP status codes
* Response data
* Authentication
* Invalid input handling
* Database operations

---

# 🐛 Troubleshooting

## Problem: `npm` command not found

Install Node.js and restart the terminal.

Check:

```bash
node --version
npm --version
```

---

## Problem: Backend does not start

Check:

```bash
cd server
npm install
npm start
```

Also check whether port `5000` is already being used.

---

## Problem: Frontend cannot communicate with backend

Make sure both servers are running:

```text
Frontend → localhost:3000
Backend  → localhost:5000
```

Also verify the frontend proxy configuration.

---

## Problem: Database connection error

Check:

* MySQL server is running.
* Database exists.
* Database username is correct.
* Database password is correct.
* Database name is correct.
* Environment configuration is correct.

---

## Problem: Login/registration is not working

Check:

1. Backend server is running.
2. MySQL server is running.
3. Required database tables exist.
4. API endpoint is accessible.
5. Authentication configuration is correct.

---

# 🚀 Future Enhancements

Possible future improvements include:

* Online payment gateway integration
* Email/SMS booking confirmation
* Real-time travel availability
* Advanced search and filtering
* User profile management
* Booking cancellation and refund management
* Admin dashboard
* Travel recommendations
* Cloud deployment
* Mobile application
* Improved security and validation

---

# 👥 Team Contribution

The project can be divided among five team members as follows:

### Member 1 – Frontend Development

* React UI development
* Page design
* Navigation
* User interface components

### Member 2 – Booking Module

* Booking interface
* Booking workflow
* Frontend-backend integration for booking operations

### Member 3 – Backend Development

* Node.js server
* Express.js APIs
* Server-side logic
* API integration

### Member 4 – Database & Authentication

* MySQL database integration
* User data management
* JWT authentication
* Password hashing using bcrypt

### Member 5 – Testing & Integration

* API testing
* Frontend-backend integration
* Bug fixing
* Documentation
* Git/GitHub project management

---

# 📌 Key Concept

The key concept of TravelEase is to provide a centralized web-based travel booking system.

The application connects the user interface, backend services and database:

```text
Frontend
React.js
    ↓
REST APIs
    ↓
Node.js + Express.js
    ↓
MySQL
```

This architecture separates the presentation layer, application logic and data layer, making the system easier to maintain and extend.

---

# 📄 SRS Summary

| Requirement       | Description                                         |
| ----------------- | --------------------------------------------------- |
| User Registration | Allows users to create an account                   |
| User Login        | Authenticates registered users                      |
| Authentication    | Uses JWT-based authentication                       |
| Password Security | Uses bcrypt password hashing                        |
| Travel Management | Handles travel-related information                  |
| Booking           | Supports travel booking operations                  |
| Database          | Stores application data in MySQL                    |
| API               | Provides communication between frontend and backend |
| UI                | Provides a React-based interface                    |
| Navigation        | Uses React Router                                   |
| Visualization     | Uses Chart.js where applicable                      |

---

# 📜 License

This project was developed as an academic project for educational purposes.

---

# 👨‍💻 Project Repository

**GitHub:**
https://github.com/donnyravi-alt/TravelEase-travel-booking-system

---

# 🙌 Conclusion

TravelEase demonstrates the development of a full-stack travel booking application using modern web technologies. The separation of frontend, backend and database components provides a structured approach to developing, testing and maintaining the application.

The project demonstrates concepts including:

* Full-stack web development
* REST APIs
* Client-server architecture
* Database management
* Authentication
* Password security
* Frontend routing
* API testing
* Version control
* Team-based development
