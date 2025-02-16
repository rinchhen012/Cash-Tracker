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
- **Database**: Supabase
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
   Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

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
