# MCP Firebase Web Push Demo

A full-stack demo project built with React, Vite, and Express. This project is a base website for future Firebase Cloud Messaging (FCM) Web Push Notification and Salesforce Marketing Cloud Personalization (MCP) integration.

## Project Structure

mcp-firebase-demo/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── BlogCard.jsx
│   │   │   ├── NotificationCenter.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   └── Home.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── App.css
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── routes/
│   │   └── notificationRoutes.js
│   ├── controllers/
│   │   └── notificationController.js
│   ├── server.js
│   └── package.json
│
└── README.md

## Installation Steps

### Step 1: Install Node.js

Install Node.js from the official website: https://nodejs.org/

### Step 2: Open VS Code

Open Visual Studio Code.

### Step 3: Open Terminal

Open the integrated terminal in VS Code.

### Step 4: Create Project Folders

If you do not already have the project folder, create it using the file explorer or a terminal.

### Step 5: Frontend Setup

```bash
cd mcp-firebase-demo
npm create vite@latest client -- --template react
cd client
npm install
npm install axios react-router-dom
```

### Step 6: Backend Setup

```bash
cd ../server
npm init -y
npm install express cors dotenv
npm install nodemon --save-dev
```

### Step 7: Run Frontend

```bash
cd ../client
npm run dev
```

### Step 8: Run Backend

```bash
cd ../server
npm run dev
```

### Step 9: Open Browser

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## VS Code Setup Instructions

1. Open VS Code.
2. Open the project root folder: `mcp-firebase-demo`.
3. Open two terminals in VS Code.
4. In terminal 1, run the frontend: `cd client && npm run dev`.
5. In terminal 2, run the backend: `cd server && npm run dev`.
6. Verify both applications are running by visiting the URLs above.

## Deployment and Environment Variables

This app now initializes Firebase push notifications automatically in the background when the website loads.

- In development, the frontend uses `http://localhost:5000` for the backend by default.
- In production, the frontend uses the deployed backend URL `https://mcp-firebase-demo-2.onrender.com`.
- If you deploy the frontend and backend separately, set `VITE_API_BASE_URL` in the frontend deployment to your backend URL.
- If no production URL is configured, the app will call `/api/*` on the same origin.

Example `client/.env.example`:

```env
VITE_API_BASE_URL=https://mcp-firebase-demo-2.onrender.com
```

The notification flow now works like this:

1. Website loads
2. Service worker registers
3. Notification permission is requested automatically if needed
4. Firebase FCM token is generated automatically when permission is granted
5. The token is saved to the backend automatically
6. Only the `Send Test Notification` button remains for manual delivery testing

## Notes

- This project uses React functional components and hooks.
- The backend is a simple Express server with placeholder routes.
- Firebase and MCP integration will be added later.
