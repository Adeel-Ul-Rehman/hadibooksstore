# Vercel Complete Deployment Guide: Backend, Client, and Admin

This guide outlines how to deploy your e-commerce bookstore (**Server + Client Frontend + Admin Panel**) to **Vercel.com** using free `*.vercel.app` domains without requiring a custom domain.

---

## Architecture Overview

On Vercel, this repository contains three distinct projects that can be deployed from the same GitHub repository:

| Project | Subdirectory | Framework | Vercel Domain Example |
| :--- | :--- | :--- | :--- |
| **Backend API** | `server` | Other (Node.js Serverless) | `https://hadi-books-backend.vercel.app` |
| **Store Frontend** | `client` | Vite | `https://hadi-books-store.vercel.app` |
| **Admin Panel** | `admin` | Vite | `https://hadi-books-admin.vercel.app` |

---

## Step 1: Deploy the Backend API (`server`)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** → **"Project"**.
2. Select your GitHub repository (`books`).
3. In **Project Settings**:
   - **Project Name**: e.g., `hadi-books-backend` (or any name you like)
   - **Framework Preset**: **Other**
   - **Root Directory**: Click "Edit" and choose **`server`**
4. Expand **Environment Variables** and add the following:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_zVyi56puvdPD@ep-dark-sound-a1ll9jfs-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | Neon PostgreSQL connection string |
| `JWT_SECRET` | `7f8d9a2b4c6e1f3a5b7d9e2f4a6c8e0d1f` | JWT token signature secret |
| `NODE_ENV` | `production` | Production environment flag |
| `SESSION_SECRET` | `7f8d9a2b4c6e1f3a5b7d9e2f4a6c8e0d1f3a5b7d9e2f4a6c8e0d1f3a5b7d9e` | OAuth session secret |
| `CLOUDINARY_CLOUD_NAME` | `dzxeahjul` | Cloudinary name |
| `CLOUDINARY_API_KEY` | `257916951987959` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `x0XTozkdGJt1HdDSdaY32DkgLUQ` | Cloudinary secret |
| `RESEND_API_KEY` | `your_resend_api_key_here` | Resend API key for emails (from your local server/.env) |
| `SENDER_EMAIL` | `Hadi Books Store <onboarding@resend.dev>` | Email sender address |
| `GOOGLE_CLIENT_ID` | `your_google_client_id_here` | Google OAuth Client ID (from your local server/.env) |
| `GOOGLE_CLIENT_SECRET` | `your_google_client_secret_here` | Google OAuth Secret (from your local server/.env) |

> [!IMPORTANT]
> **Do NOT add `COOKIE_DOMAIN`** on Vercel (`*.vercel.app` is on the Public Suffix List and browsers reject cookies with a `.vercel.app` domain attribute).

5. Click **"Deploy"**.
6. Note the deployed URL (e.g., `https://hadi-books-backend.vercel.app`).
   - Test it by opening: `https://hadi-books-backend.vercel.app/api/health`

---

## Step 2: Deploy the Customer Frontend (`client`)

1. In the Vercel Dashboard, click **"Add New..."** → **"Project"**.
2. Select the same GitHub repository.
3. In **Project Settings**:
   - **Project Name**: e.g., `hadi-books-store`
   - **Framework Preset**: **Vite**
   - **Root Directory**: Click "Edit" and choose **`client`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables**:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://hadi-books-backend.vercel.app` *(use your actual backend URL from Step 1)* |

5. Click **"Deploy"**.
6. Note the deployed URL (e.g., `https://hadi-books-store.vercel.app`).

---

## Step 3: Deploy the Admin Panel (`admin`)

1. In the Vercel Dashboard, click **"Add New..."** → **"Project"**.
2. Select the same GitHub repository.
3. In **Project Settings**:
   - **Project Name**: e.g., `hadi-books-admin`
   - **Framework Preset**: **Vite**
   - **Root Directory**: Click "Edit" and choose **`admin`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables**:

| Key | Value |
| :--- | :--- |
| `VITE_BACKEND_URL` | `https://hadi-books-backend.vercel.app` *(use your actual backend URL from Step 1)* |

5. Click **"Deploy"**.
6. Note the deployed URL (e.g., `https://hadi-books-admin.vercel.app`).

---

## Step 4: Link Frontend & Admin URLs back to Backend

Now that your frontend and admin URLs are generated:

1. Go back to your **Backend Project** (`hadi-books-backend`) in Vercel:
   - Go to **Settings** → **Environment Variables**
   - Add:
     - `FRONTEND_URL` = `https://hadi-books-store.vercel.app` *(your frontend URL)*
     - `ADMIN_URL` = `https://hadi-books-admin.vercel.app` *(your admin URL)*
     - `GOOGLE_CALLBACK_URL` = `https://hadi-books-backend.vercel.app/api/auth/google/callback`
2. Go to the **Deployments** tab and click **Redeploy** so the new variables take effect.

---

## Step 5: (Optional) Google OAuth Configuration

Because the old domain expired, update your Google Cloud Console credentials:

1. Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Select your OAuth 2.0 Client ID.
3. In **Authorized JavaScript Origins**, add:
   - `https://hadi-books-store.vercel.app`
   - `https://hadi-books-backend.vercel.app`
4. In **Authorized Redirect URIs**, add:
   - `https://hadi-books-backend.vercel.app/api/auth/google/callback`
5. Click **Save**.
