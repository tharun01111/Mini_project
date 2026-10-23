# 🎓 Unified Symposium Management Platform

A full-stack web platform designed to streamline and automate college symposiums, hackathons, and academic conferences. It handles the entire event lifecycle: symposium publishing, event registration, QR ticketing, live camera-based attendance verification, and tamper-proof digital certificates.

---

## ⚡ Tech Stack

- **Frontend**: React 18, Vite, Vanilla CSS, Lucide Icons, HTML5-QRCode
- **Backend**: Node.js, Express.js (ES Modules), JWT Authentication, bcryptjs
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Containerization**: Docker & Docker Compose

---

## 📁 Project Structure

```text
symposium-platform/
├── client/                 # React frontend application
│   ├── src/                # Pages, components, contexts, styles
│   ├── index.html
│   ├── vite.config.js      # Configured on port 3000 (proxies /api to 5000)
│   └── package.json
├── server/                 # Express backend API
│   ├── prisma/             # Schema definitions and seed scripts
│   ├── src/                # Controllers, routes, middleware
│   ├── tests/              # API test suite
│   ├── .env.example        # Environment variable template
│   └── package.json
└── docker-compose.yml      # Multi-container orchestration (PostgreSQL, Server, Client)
```

---

## 📋 Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- [PostgreSQL](https://www.postgresql.org/) database (or Docker)

---

## 🛠️ Installation & Setup

### 1. Set Up the Backend Server

1. Open your terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   - On Windows (PowerShell):
     ```powershell
     Copy-Item .env.example .env
     ```
   - On Linux/macOS:
     ```bash
     cp .env.example .env
     ```

4. Configure your `.env` variables with your PostgreSQL credentials:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database_name>?schema=public"
   DIRECT_URL="postgresql://<username>:<password>@localhost:5432/<database_name>?schema=public"
   JWT_SECRET="your_jwt_secret_key"
   CLIENT_URL="http://localhost:3000"
   ```

5. Initialize the database schema and generate the Prisma Client:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. Seed the database with sample symposiums, events, and test accounts:
   ```bash
   npm run prisma:seed
   ```

---

### 2. Set Up the Frontend Client

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

---

## 🚀 Running the Application

### Option A: Local Development (Recommended)

1. **Start the Backend Server** (runs on port 5000):
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend Web App** (runs on port 3000):
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and visit: **[http://localhost:3000](http://localhost:3000)**

---

### Option B: Run via Docker Compose

To run the entire stack (PostgreSQL, backend API, and frontend) inside Docker containers:

```bash
docker-compose up --build
```

- **Frontend Web App**: [http://localhost](http://localhost) (Port 80)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

To stop the containers:
```bash
docker-compose down
```

---

## 📄 How to Run Specific Files & Scripts

### 1. Run the Main Backend Server File
To start the backend server entry file directly with Node:
```bash
cd server
node src/app.js
```
*Or with automatic file reload on changes (Node 18+):*
```bash
node --watch src/app.js
```

### 2. Run Database Seeding
To run the database seed script to populate test data:
```bash
cd server
node prisma/seed.js
```
*(Alternative script shortcut: `npm run prisma:seed`)*

### 3. Open Prisma Studio (Database GUI)
To view and edit database tables in an interactive browser interface:
```bash
cd server
npx prisma studio
```
Opens automatically at: **[http://localhost:5555](http://localhost:5555)**

### 4. Run Automated Tests
To run the automated API test file:
```bash
cd server
npm test
```
*Or run the test file directly with Node's native test runner:*
```bash
node --test tests/api.test.js
```

### 5. Build Frontend for Production
To test the production build of the frontend:
```bash
cd client
npm run build
npm run preview
```

---

## 🔑 Default Login Credentials

The seed script (`node prisma/seed.js`) automatically provisions test accounts for each role:

| Role | Email | Password | Access / Purpose |
|---|---|---|---|
| **Administrator** | `admin@symposium.edu` | `Admin@123` | Platform oversight, approving symposiums & organizers |
| **Organizer** | `organizer@symposium.edu` | `Organizer@123` | Managing events, QR attendance scanner, issuing certificates |
| **Participant** | `participant@symposium.edu` | `Participant@123` | Browsing symposiums, registering, downloading QR tickets & certificates |

---

## 🔗 Useful Endpoints

- **Frontend App**: `http://localhost:3000`
- **Backend API Base**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`
- **Public Certificate Verification**: `http://localhost:3000/verify-certificate/:certificateCode`
