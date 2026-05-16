# FD Manager

A premium, mobile-first Fixed Deposit (FD) management dashboard built with React, Tailwind CSS, and Firebase.

## Features
- **Secure Google Authentication**: Multi-tenant isolation for your financial data.
- **Portfolio Overview**: Real-time metrics and maturity alerts.
- **Inventory Management**: Easy CRUD operations for Banks and FDs.
- **Principal-Only Renewals**: Specialized wizard for rolling over deposits.
- **PWA Support**: Installable on your home screen.
- **Dark Mode**: Premium dark theme support.

## Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Configure Firebase**:
   - Create a `.env` file based on `.env.example`.
   - Add your Firebase project credentials.
4. **Run locally**: `npm run dev`

## Deployment
This project is configured for deployment to **GitHub Pages**. Every push to the `main` branch will trigger an automated build and deploy via GitHub Actions.

## Tech Stack
- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase Firestore, Firebase Auth
- **State Management**: TanStack Query (React Query)
- **Deployment**: GitHub Pages
