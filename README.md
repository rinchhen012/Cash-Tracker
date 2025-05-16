# Cash Tracker

A modern, mobile-first web application designed to help delivery drivers manage cash transactions efficiently.

![App Icon](public/icon.svg)

## Features

- **Driver Selection**: Quick access for up to 6 drivers
- **Real-time Cash Calculation**: Instantly calculate cash amounts
- **Bilingual Support**: Interface in English and Nepali
- **Transaction History**: View and filter past transactions
- **Offline Support**: Works without internet connection
- **Dark Theme**: Easy on the eyes, especially at night
- **PWA Ready**: Install as a native app on mobile devices

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **UI Components**: Mantine UI
- **Styling**: CSS Modules
- **Database**: Firebase (Firestore)
- **State Management**: React Hooks
- **Routing**: React Router
- **Date Handling**: Day.js
- **Icons**: Tabler Icons
- **Build Tool**: Vite
- **PWA Support**: Vite PWA Plugin

## Getting Started

1. Clone the repository

```bash
git clone [repository-url]
cd cash-tracker
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env.local` file (or `.env`) in the root directory with your Firebase project configuration. This file should be ignored by Git (ensure it's in your `.gitignore`).

```env
VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
VITE_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASurement_ID" # Optional, for Firebase Analytics
```

Note: These variables are used for local development. For deployments (e.g., to Vercel), set these same environment variables in your hosting provider's settings.

This application uses a client-generated `userId` (stored in localStorage via `appUserId` key) to partition data for different users/browsers since it does not have a formal sign-in system.

4. Start the development server

```bash
npm run dev
```

5. Build for production

```bash
npm run build
```

## Features in Detail

### Calculator Page

- Input fields for Order Total and Amount Received
- Real-time cash calculation
- Color-coded display for positive/negative amounts
- Bilingual labels (English/Nepali)

### History Page

- View all transactions
- Filter by driver or date
- Display total transactions and amounts
- Offline mode support
- Detailed transaction cards with timestamps

### Home Page

- Quick driver selection (1-6)
- Current date display
- Easy navigation to History
- Clean, modern interface

## Mobile Optimization

- Touch-optimized interface
- Disabled zoom for better UX
- Full-screen mode as PWA
- Responsive design for all screen sizes
- Large, easily tappable buttons

## Performance

- Optimized bundle size
- Lazy loading of routes
- Service worker for offline support
- Efficient state management
- Fast initial load time

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
