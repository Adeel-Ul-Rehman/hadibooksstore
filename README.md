# 📚 Hadi Books Store — Full-Stack E-Commerce Platform

A production-ready, full-stack e-commerce web application for book selling and inventory management. Built with a modern decoupled architecture featuring a customer-facing storefront, an administrative management dashboard, and a serverless-ready Node.js REST API.

---

## 🌟 Architecture Overview

The repository is structured as a clean monorepo containing three core components:

```
books/
├── client/          # Customer Storefront (React 18 + Vite)
├── admin/           # Administrative Management Panel (React 18 + Vite)
├── server/          # REST API & Database Layer (Express + Prisma + PostgreSQL)
├── .gitignore       # Root Git exclusion rules
├── README.md        # Main repository documentation
└── VERCEL_DEPLOYMENT_GUIDE.md  # Detailed step-by-step Vercel guide
```

| Service | Technology | Role | Deployment Target |
| :--- | :--- | :--- | :--- |
| **Storefront (`client`)** | React 18, Vite, React Router 6, TailwindCSS | Customer browsing, cart, checkout, reviews, wishlist, auth | Vercel (Vite Preset) |
| **Admin Panel (`admin`)** | React 18, Vite, React Router 6, TailwindCSS | Product management, order fulfillment, sales stats, banner controls | Vercel (Vite Preset) |
| **Backend API (`server`)** | Node.js, Express, Prisma ORM, Neon PostgreSQL | Authentication, business logic, file uploads, emails, database access | Vercel (Serverless Functions) |

---

## ✨ Features

### 🛍️ Customer Storefront (`client`)
- **Product Discovery**: Browse collections, real-time search, category filtering, bestseller badges, and sorting.
- **Cart & Wishlist**: Persistent cart and wishlist with local storage synchronization and guest-to-user state preservation.
- **Dual Checkout System**:
  - **Registered Checkout**: User profile-based checkout with auto-filled shipping details.
  - **Guest Checkout**: Fast checkout for guests without requiring prior registration.
- **Payment Verification**: Manual payment proof image uploads with Cloudinary cloud storage.
- **Authentication**: Email/Password authentication with 6-digit OTP verification, password reset, and Google OAuth 2.0 integration.
- **Customer Account**: Order history tracking, address book management, profile picture updates.
- **Interactive Reviews**: Verified customer ratings (1–5 stars) and review submissions.

### 🛡️ Admin Management Dashboard (`admin`)
- **Product Catalog Management**: Add, update, and remove books with multi-category tagging and image uploads.
- **Inventory & Availability**: Instant stock availability and bestseller toggles.
- **Order Fulfillment**: Real-time order tracking, guest & user order lifecycle updates (Pending, Processing, Shipped, Delivered).
- **Payment Auditing**: Inspect customer-uploaded payment proofs before confirming orders.
- **Hero Banner Management**: Configure storefront hero carousels and promotional graphics.
- **Admin Security**: Dedicated admin login, session management, and self-service password recovery with OTP.

### 🔐 Backend API & Security Hardening (`server`)
- **Database Layer**: Prisma ORM backed by Neon Serverless PostgreSQL with auto-generated client.
- **Authentication**: JWT token verification supporting both `httpOnly` secure cookies and `Authorization: Bearer <token>` headers.
- **Brute-Force Protection**: Multi-tier rate limiting via `express-rate-limit` on login, registration, OTP issuance, and OTP verification endpoints.
- **Role-Based Access Control**: Strict database-verified admin privilege middleware preventing privilege escalation or IDOR vulnerabilities.
- **Zero Credential Exposure**: Fully sanitized log pipelines (no plain-text OTPs or password hashes in logs) and parameterized Prisma queries.
- **Cloud Integrations**: Cloudinary for optimized media management; Resend API for responsive HTML transactional emails.

---

## 🛠️ Tech Stack

- **Frontend & Admin**: React 18, Vite 5, TailwindCSS 3, Axios, React Router 6, React Toastify, Lucide / Custom SVG Icons.
- **Backend**: Node.js, Express 4, Prisma ORM 5, PostgreSQL (Neon), JWT (`jsonwebtoken`), Passport.js (Google OAuth 2.0).
- **Media & Storage**: Cloudinary SDK, Multer disk storage (with serverless OS temp fallback).
- **Communications**: Resend API for transactional email notifications.
- **Security**: Helmet, Express Rate Limit, Bcryptjs, Validator, CORS origin whitelisting.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm
- A free [Neon PostgreSQL](https://neon.tech) database (or local PostgreSQL)
- A free [Cloudinary](https://cloudinary.com) account (for image hosting)
- A free [Resend](https://resend.com) account (for email delivery)

### 1. Clone the Repository
```bash
git clone https://github.com/Adeel-Ul-Rehman/hadibooksstore.git
cd hadibooksstore
```

### 2. Configure Environment Variables

Create `.env` files in each sub-directory using the provided `.env.example` templates:

#### `server/.env`
```env
DATABASE_URL="postgresql://username:password@ep-your-database-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your_strong_jwt_secret_minimum_32_characters"
NODE_ENV="development"
SESSION_SECRET="your_random_session_secret_32_characters"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
RESEND_API_KEY="re_your_resend_api_key"
SENDER_EMAIL="Hadi Books Store <onboarding@resend.dev>"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
FRONTEND_URL="http://localhost:5173"
ADMIN_URL="http://localhost:5174"
```

#### `client/.env`
```env
VITE_API_URL="http://localhost:4000"
```

#### `admin/.env`
```env
VITE_BACKEND_URL="http://localhost:4000"
```

---

### 3. Install Dependencies & Run

#### Run the Backend (`server`)
```bash
cd server
npm install
npx prisma generate
npm run dev
# Server starts on http://localhost:4000
```

#### Run the Customer Storefront (`client`)
```bash
cd ../client
npm install
npm run dev
# Storefront starts on http://localhost:5173
```

#### Run the Admin Panel (`admin`)
```bash
cd ../admin
npm install
npm run dev
# Admin starts on http://localhost:5174
```

---

## 🌐 Deploying to Vercel (Step-by-Step)

You can deploy the entire platform to Vercel for free using default `*.vercel.app` domains without needing a custom domain.

Because this is a decoupled monorepo, you will import this single GitHub repository **three times** in your Vercel Dashboard to create three independent projects:

### Step 1: Deploy Backend API (`server`)
1. In [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New..."** → **"Project"**.
2. Select `hadibooksstore` repository.
3. Configure project settings:
   - **Project Name**: `hadi-books-backend` (or your choice)
   - **Framework Preset**: **Other**
   - **Root Directory**: `server`
4. In **Environment Variables**, add:
   - `DATABASE_URL` = *(Your Neon database connection string)*
   - `JWT_SECRET` = *(Your 32+ character JWT secret)*
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = *(Your session secret)*
   - `CLOUDINARY_CLOUD_NAME` = *(Your Cloudinary name)*
   - `CLOUDINARY_API_KEY` = *(Your Cloudinary API key)*
   - `CLOUDINARY_API_SECRET` = *(Your Cloudinary API secret)*
   - `RESEND_API_KEY` = *(Your Resend API key)*
   - `SENDER_EMAIL` = `Hadi Books Store <onboarding@resend.dev>`
   - `GOOGLE_CLIENT_ID` = *(Optional: Google OAuth Client ID)*
   - `GOOGLE_CLIENT_SECRET` = *(Optional: Google OAuth Client Secret)*
   > **Note**: Do **NOT** set `COOKIE_DOMAIN` on Vercel deployments.
5. Click **"Deploy"**. Copy the assigned URL (e.g., `https://hadi-books-backend.vercel.app`).
   - Verify health at: `https://hadi-books-backend.vercel.app/api/health`

---

### Step 2: Deploy Customer Storefront (`client`)
1. Click **"Add New..."** → **"Project"** in Vercel.
2. Select the same `hadibooksstore` repository.
3. Configure project settings:
   - **Project Name**: `hadi-books-store`
   - **Framework Preset**: **Vite**
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://hadi-books-backend.vercel.app` *(Your Step 1 Backend URL)*
5. Click **"Deploy"**. Copy your storefront URL (e.g., `https://hadi-books-store.vercel.app`).

---

### Step 3: Deploy Admin Panel (`admin`)
1. Click **"Add New..."** → **"Project"** in Vercel.
2. Select the same `hadibooksstore` repository.
3. Configure project settings:
   - **Project Name**: `hadi-books-admin`
   - **Framework Preset**: **Vite**
   - **Root Directory**: `admin`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_BACKEND_URL` = `https://hadi-books-backend.vercel.app` *(Your Step 1 Backend URL)*
5. Click **"Deploy"**. Copy your admin panel URL (e.g., `https://hadi-books-admin.vercel.app`).

---

### Step 4: Link Frontend & Admin URLs to Backend
Once your frontend and admin URLs are generated:
1. Open your **Backend Project** (`hadi-books-backend`) in Vercel.
2. Go to **Settings** → **Environment Variables** and add:
   - `FRONTEND_URL` = `https://hadi-books-store.vercel.app`
   - `ADMIN_URL` = `https://hadi-books-admin.vercel.app`
   - `GOOGLE_CALLBACK_URL` = `https://hadi-books-backend.vercel.app/api/auth/google/callback`
3. Go to the **Deployments** tab and click **Redeploy** on the latest deployment for these settings to take effect.

> For complete details, troubleshooting tips, and Google OAuth credential setup, consult the [Vercel Deployment Guide](VERCEL_DEPLOYMENT_GUIDE.md).

---

## 🔒 Security Policy & Safeguards

- **Zero Tracked Secrets**: Real environment variables, secrets, and private credentials are excluded via `.gitignore`.
- **Authorization Enforcement**: Every admin action is validated against database records with strict integer typing and JWT signature checks.
- **Safe Error Propagation**: Internal database error details and stack traces are suppressed in production HTTP responses.
- **Brute-Force Throttling**: Strict IP rate limiting guards authentication routes against credential stuffing and OTP enumeration attacks.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
