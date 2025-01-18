# Bilet Buldum 🎫

<p align="center">
<img src="https://i.imgur.com/jwf80oZ.png" alt="Biletbuldum Logo" width="150"/>
</p>

<p align="center">
Your smart ticket finder companion - Never miss a ticket again!
</p>

## 📱 About

Bilet Buldum is a comprehensive ticket finding solution that helps users secure tickets for their desired events. When tickets become
available, the system automatically notifies users through push notifications and email.

## 🏗️ Project Structure

The project consists of two main components:

### Mobile Application (React Native + Expo)

- Located in `/mobile`
- Cross-platform mobile app built with React Native and Expo
- Features:
  - User authentication
  - Ticket search and tracking
  - Push notifications
  - Multi-language support (Turkish and English)
  - Google Ads integration
  - Beautiful UI with NativeWind (TailwindCSS)

### Backend API (Node.js)

- Located in `/new-api`
- RESTful API built with Node.js
- Features:
  - User management
  - Ticket tracking system
  - Automated notifications
  - Cron jobs for periodic checks

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for mobile development)

### Mobile App Setup

```bash
cd mobile
npm install
npm run dev        # Start development server
npm run ios        # Run on iOS
npm run android    # Run on Android
```

### API Setup

```bash
cd new-api
npm install
npm run dev        # Start development server
```

## 🛠️ Tech Stack

### Mobile App

- React Native with Expo
- TypeScript
- NativeWind (TailwindCSS)
- Expo Router
- i18next for internationalization
- SWR for data fetching
- Zustand for state management
- React Native Google Mobile Ads

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- RESTful API architecture
- Cron jobs for automated tasks

## 📱 Mobile App Features

- User authentication and profile management
- Real-time ticket search
- Push notifications for ticket availability
- Multi-language support (TR/EN)
- Dark/Light theme support
- Privacy Policy and Terms of Service
- Google Ads integration
- Responsive and modern UI

## 🔒 Environment Variables

### Mobile App

Create a `.env` file in the mobile directory with:

```
API_URL=your_api_url
GOOGLE_ADS_ID=your_google_ads_id
```

### Backend

Create a `.env` file in the new-api directory with:

```
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

Please contact the project maintainers for contribution guidelines.

## 📞 Support

For support, please email [contact@biletbuldum.com](mailto:contact@biletbuldum.com)
