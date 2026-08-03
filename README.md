# 🛡️ Insurance Management Platform

Welcome to the **Insurance Management Platform**, a comprehensive web-based application designed to digitize and simplify the management of insurance operations. It enables insurance companies, agents, and customers to manage policies, claims, premium payments, and related documents from a centralized and secure system.

This project is built using a modern full-stack architecture with **React (Vite)** on the frontend and **Express/Node.js** on the backend, using **Prisma ORM** with **PostgreSQL** as the core database.

---

## 🏗️ Architecture & Tech Stack

The application is structured as a monorepo with separate frontend and backend directories:

### 💻 Frontend
- **Framework**: [React 19](https://react.dev/) (built with [Vite](https://vite.dev/))
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Entrypoint**: [App.jsx](file:///d:/PROGRAMMING/REACT_JS/Insurance-Management-Platform/frontend/src/App.jsx)
- **Dependencies**: Detailed in [frontend/package.json](file:///d:/PROGRAMMING/REACT_JS/Insurance-Management-Platform/frontend/package.json)

### ⚙️ Backend
- **Runtime & Framework**: Node.js & Express.js
- **Database ORM**: [Prisma ORM](https://www.prisma.io/)
- **Database**: PostgreSQL (managed using `@prisma/client`)
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs`
- **Validation**: [Zod](https://zod.dev/)
- **Caching**: Redis (`ioredis`) & `node-cache`
- **File Uploads**: Multer (configured for document handling)
- **Database Schema**: [schema.prisma](file:///d:/PROGRAMMING/REACT_JS/Insurance-Management-Platform/backend/prisma/schema.prisma)
- **Dependencies**: Detailed in [backend/package.json](file:///d:/PROGRAMMING/REACT_JS/Insurance-Management-Platform/backend/package.json)

---

## 🌟 Key Features

### 🧑‍💼 User Roles & Permissions
1. **Administrator**
   - Manage employees and agents.
   - Access global reports and business metrics.
   - Manage global system settings.
2. **Insurance Agent**
   - Register customers.
   - Create and issue insurance policies.
   - Verify uploaded customer documents.
   - Review, approve, or reject claim requests.
3. **Customer**
   - Manage personal profile & settings.
   - View active policies and download documents.
   - Submit new claims and track their approval progress.
   - Pay premiums and view payment history.

### 📦 Key Modules
- **Customer Management**: Profile updates, registration, search, and history tracking.
- **Policy Management**: Creating, renewing, and cancelling policy templates and customer policies.
- **Claim Management**: Submission of claims with document attachment, verification status flow (Pending, Under Review, Approved, Rejected).
- **Premium Tracking**: Tracking due dates, collecting premium payments, and marking payment status.
- **Document Management**: Secure upload and storage of identity documents, policy papers, and claim proofs.
- **Reports Dashboard**: High-level visualizations of claims, policies, monthly collections, and growth.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **PostgreSQL**
- **Redis Server** (optional, used for caching)

---

### 📂 Directory Structure

```text
Insurance-Management-Platform/
├── backend/            # Express.js Server
│   ├── prisma/         # Prisma Schemas & Seeds
│   └── src/            # Backend Source Code (Controllers, Routes, Middlewares)
├── frontend/           # React + Vite Client
│   ├── public/         # Static Assets
│   └── src/            # Frontend Components & Pages
└── README.md           # Documentation
```

---

### ⚙️ Backend Setup & Run

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` directory based on the following keys:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/insurance_db"
   JWT_SECRET="your_jwt_secret_key"
   REDIS_URL="redis://localhost:6379"
   # Add any SMTP configurations for email notifications
   ```

4. **Synchronize & Generate Database Schema**:
   Run the Prisma commands to map models and sync the PostgreSQL database:
   ```bash
   npm run db:sync
   ```

5. **Seed Initial Data**:
   To pre-populate the database with test users, agents, and policies:
   ```bash
   npm run db:seed
   ```

6. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The backend will be running on `http://localhost:5000` (or your configured port).

---

### 💻 Frontend Setup & Run

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Ensure Axios is pointing to the correct API base URL.

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The frontend app will be accessible at `http://localhost:5173`.

---

## 🛠️ Prisma Development Commands

In the `backend` directory, you can run the following Prisma convenience scripts:
- **Prisma Studio**: `npm run db:studio` (launches database GUI)
- **Reset Database**: `npm run db:reset` (wipes data and generates a clean schema)
- **Sync Database**: `npm run db:sync` (runs `prisma db push` and generates client)

---

## 📄 License

This project is licensed under the ISC License. See [backend/package.json](file:///d:/PROGRAMMING/REACT_JS/Insurance-Management-Platform/backend/package.json) for author and licensing details.
