# TravelEase – Travel Booking System

TravelEase is a web-based travel booking application developed as a full-stack project. It provides a simple interface for users to explore travel options and manage their bookings.

The project is divided into two parts:

* `client` – React frontend
* `server` – Node.js and Express backend

The backend uses **MySQL** for storing application data.

---

## Technologies Used

### Frontend

* React.js
* JavaScript
* Bootstrap
* React Router
* Chart.js

### Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication
* bcryptjs

### Database

* MySQL

### Tools

* Visual Studio Code
* Git & GitHub
* Postman
* MySQL Workbench

---

# Prerequisites

Before running TravelEase, make sure the following software is installed on your system.

### 1. Node.js and npm

Node.js is required to run the backend and install the project dependencies.

Download and install Node.js from:

https://nodejs.org/

After installation, open Command Prompt/Terminal and check:

```bash
node -v
npm -v
```

If both commands show a version number, Node.js is installed correctly.

---

### 2. MySQL

TravelEase uses **MySQL** as its database.

Install:

* MySQL Server
* MySQL Workbench (recommended)

Make sure the MySQL server is running before starting the application.

You can check the MySQL connection through MySQL Workbench.

---

### 3. Git

Git is recommended for downloading the project from GitHub.

Check whether Git is installed:

```bash
git --version
```

If it is not installed, download it from:

https://git-scm.com/

---

### 4. Code Editor

We recommend **Visual Studio Code** for opening and working with the project.

---

### 5. Web Browser

Use a modern browser such as:

* Google Chrome
* Microsoft Edge
* Mozilla Firefox

---

# How to Download the Project

Clone the repository using:

```bash
git clone https://github.com/donnyravi-alt/TravelEase-travel-booking-system.git
```

Then enter the project folder:

```bash
cd TravelEase-travel-booking-system
```

---

# Project Setup

The frontend and backend have separate dependencies, so they need to be installed separately.

## Step 1 – Install Backend Dependencies

Open a terminal in the project folder and run:

```bash
cd server
npm install
```

This installs all the packages required by the backend.

---

## Step 2 – Install Frontend Dependencies

Open another terminal and run:

```bash
cd client
npm install
```

This installs the packages required by the React frontend.

---

# Database Setup

TravelEase uses MySQL.

Before running the backend:

1. Start MySQL Server.
2. Open MySQL Workbench.
3. Create the database required by the project.
4. Make sure the database connection details used by the backend are correct.

The backend uses `mysql2` to connect Node.js with MySQL.

> Make sure your MySQL username, password and database name match the configuration used by the project.

---

# Environment Configuration

If the project requires environment variables, create a `.env` file inside the `server` folder.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=your_secret_key
```

Replace the example values with your own MySQL details.

**Do not upload your actual `.env` file or passwords to GitHub.**

---

# How to Run the Application

The application has **two parts that need to run at the same time**:

1. Backend server
2. React frontend

You need **two terminals**.

---

## Terminal 1 – Start the Backend

Open the first terminal:

```bash
cd TravelEase-travel-booking-system
cd server
```

Then run:

```bash
npm start
```

The backend starts using Node.js.

The server runs on:

```text
http://localhost:5000
```

Keep this terminal running.

---

## Terminal 2 – Start the Frontend

Open a **new terminal**.

Go to the project folder:

```bash
cd TravelEase-travel-booking-system
cd client
```

Run:

```bash
npm start
```

The React application will start and open in your browser.

Usually it will be available at:

```text
http://localhost:3000
```

If it does not open automatically, open the above address manually in your browser.

---

# Quick Run Guide

After everything is installed, you only need these commands:

### Terminal 1

```bash
cd server
npm start
```

### Terminal 2

```bash
cd client
npm start
```

Then open:

```text
http://localhost:3000
```

That's it.

---

# Application Flow

The basic flow of the application is:

```text
User
  ↓
React Frontend
  ↓
REST API
  ↓
Node.js + Express
  ↓
MySQL Database
  ↓
Response
  ↓
React Frontend
```

The frontend sends requests to the backend. The backend processes the request and communicates with MySQL when database information is required.

---

# Main Features

* User registration and login
* User authentication
* Travel information
* Booking functionality
* MySQL database
* REST API communication
* Responsive user interface
* Navigation between application pages
* Authentication using JWT
* Password hashing using bcryptjs

---

# SRS – Short Overview

## 1. Purpose

The main purpose of TravelEase is to provide a simple online platform for travel-related booking operations.

## 2. Users

The system is mainly intended for users who want to search for travel options and make bookings through the application.

## 3. Functional Requirements

The application should allow users to:

* Register an account
* Login securely
* View travel information
* Make bookings
* Access their booking-related information

## 4. Non-Functional Requirements

The application should be:

* Easy to use
* Secure
* Reliable
* Responsive
* Easy to maintain

## 5. System Requirements

### Software

* Node.js
* npm
* MySQL
* Git
* VS Code
* Web browser

### Hardware

A normal computer capable of running Node.js, MySQL and a modern web browser is sufficient.

---

# Troubleshooting

### `npm` is not recognized

Make sure Node.js is installed correctly and restart the terminal.

Check:

```bash
node -v
npm -v
```

### Backend is not starting

Try:

```bash
cd server
npm install
npm start
```

Also make sure MySQL is running.

### Frontend is not starting

Try:

```bash
cd client
npm install
npm start
```

### Database connection error

Check:

* MySQL Server is running
* Database name is correct
* MySQL username is correct
* MySQL password is correct
* Database configuration is correct

### Frontend cannot connect to backend

Make sure both terminals are running:

```text
Frontend → http://localhost:3000
Backend  → http://localhost:5000
```

---

# Team

TravelEase was developed as a team project. The work was divided across frontend development, booking functionality, backend development, database/authentication, testing and documentation.

---

# Repository

GitHub:

https://github.com/donnyravi-alt/TravelEase-travel-booking-system

---

## Note

This project was developed as part of an academic project to demonstrate full-stack web development, database integration, REST APIs and authentication.
