# PrimeJar — Deployment Guide

## 🚀 Deploy to Vercel

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - PrimeJar platform"
git remote add origin https://github.com/YOUR_USERNAME/primejar.git
git push -u origin main
```

### Step 2 — Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)

### Step 3 — Set Environment Variables
Add these in Vercel → Project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyCxymXQsGiD8o7R0eY_tWKKXJ7HPv82Nis` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `primejar-be836.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `primejar-be836` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `primejar-be836.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `458674171716` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:458674171716:web:e09dd946fc75e0e1a87111` |

### Step 4 — Deploy Firestore Rules
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

## 🔐 Admin Access
Admin panel: `/admin`  
Admin email: `admin@primejar.in`  

To create an admin account, sign up with `admin@primejar.in` and then manually set `role: "admin"` in the Firestore `users` collection for that user's document.

## 📁 Key Collections (Firestore)
| Collection | Purpose |
|---|---|
| `users` | All user profiles with roles |
| `workers` | Worker-specific profiles |
| `organizers` | Organizer company data |
| `jobs` | Job/event postings |
| `applications` | Job applications |
| `notifications` | In-app notifications |
| `groups` | Community groups + posts |
| `activity` | Admin activity feed logs |

## 🔥 Firebase Console Setup
1. Enable **Email/Password** authentication in Firebase Auth
2. Create Firestore database in **production** mode  
3. Deploy the security rules: `firebase deploy --only firestore:rules`
4. Add your Vercel deployment URL to **Authorized Domains** in Firebase Auth settings

## 💻 Local Development
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

## Environment Variables (.env.local)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```
