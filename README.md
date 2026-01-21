# Study Planner

A full-stack mobile application designed to help students organize their study schedules, track progress.
## 🚀 Features

- **Interactive Study Sessions**: Built-in timer and session tracking to keep you focused.
- **Progress Tracking**: Visual analytics and mastery levels for each topic.
- **Cross-Platform**: Built with React Native & Expo for iOS and Android.

## 🛠 Tech Stack

### Client (Mobile App)
- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Language**: TypeScript / JavaScript
- **Navigation**: Expo Router (File-based routing)
- **Styling**: React Native StyleSheet
- **Key Libraries**: `axios`, `react-native-reanimated`, `expo-secure-store`

### Server (Backend)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **AI Integration**: OpenAI API
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs

## 📂 Project Structure

```
/home/ishita/studyPlanner
├── client/          # Frontend React Native (Expo) application
│   ├── app/         # Expo Router screens and layouts
│   ├── components/  # Reusable UI components
│   └── ...
└── server/          # Backend Node.js Express API
    ├── controllers/ # Request logic
    ├── models/      # Mongoose database schemas
    ├── routes/      # API endpoints
    └── index.js     # Server entry point
```

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) installed and running locally (or a connection string)
- [Expo Go](https://expo.dev/go) app on your physical device or an Android/iOS emulator

### 1. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add your variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/studyPlanner
   JWT_SECRET=your_jwt_secret_key
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`.

### 2. Client Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update API Base URL (if necessary):
   Ensure your frontend API calls are pointing to your local server IP address (not `localhost` if testing on a physical device).
4. Start the app:
   ```bash
   npx expo start
   ```
5. Scan the QR code with your phone (using Expo Go) or press `a` for Android Emulator / `i` for iOS Simulator.
