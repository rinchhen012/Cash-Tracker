# Change Tracker

A Progressive Web App (PWA) for tracking cash change calculations for delivery drivers.

## Features

- Driver selection (1-5)
- Calculate change for cash on delivery
- Transaction history with filtering
- Daily reset with historical data preservation
- PWA support for offline access
- Responsive design

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a Firebase project and enable Firestore
4. Copy `.env.example` to `.env` and fill in your Firebase configuration values
5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

1. Create a Vercel account if you don't have one
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Login to Vercel:
   ```bash
   vercel login
   ```
4. Deploy the app:
   ```bash
   vercel
   ```
5. Add your environment variables in the Vercel dashboard

## Technologies Used

- React
- TypeScript
- Vite
- Mantine UI
- Firebase/Firestore
- PWA
- Vercel
