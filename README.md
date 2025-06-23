# Azure Avatar Demo Application

A simple React + Express application demonstrating Azure Avatar text-to-speech capabilities with visual avatar representation.

## Prerequisites

- Node.js (v18+)
- npm
- Azure Speech Services subscription

## Project Structure

```
test-AZ-speech/
├── backend/          # Express server
│   ├── src/
│   │   └── index.ts  # Main server file
│   ├── package.json
│   └── .env          # Azure credentials
└── frontend/         # React application
    ├── src/
    │   ├── App.tsx   # Main component
    │   └── App.css   # Styles
    └── package.json
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Ensure the `.env` file contains your Azure credentials:
```
AZ_SPEECH_KEY=your_azure_speech_key
AZ_SPEECH_REGION=your_region
PORT=3001
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on http://localhost:3001

### Start Frontend Application

In a new terminal:

```bash
cd frontend
npm start
```

The frontend will run on http://localhost:3000

## How to Use

1. Open http://localhost:3000 in your browser
2. Type a message in the input field
3. Click "Send" or press Enter
4. The avatar will appear and speak your message
5. Continue the conversation by sending more messages

## Features

- Text input chat interface
- Azure Avatar visual representation with WebRTC
- Real-time speech synthesis with lip-sync
- Message history display
- Loading states and error handling
- ICE server configuration for WebRTC connectivity

## Troubleshooting

- If the avatar doesn't appear, check the browser console for errors
- Ensure Azure credentials are correctly set in the backend `.env` file
- Make sure both backend and frontend servers are running
- Check that CORS is properly configured if accessing from a different domain

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/speech/token` - Get Azure Speech token and region
- `GET /api/speech/ice-token` - Get ICE server configuration for WebRTC
- `POST /api/speech/synthesize` - Synthesize speech (optional)