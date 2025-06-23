# Azure Speech Avatar Demo

A React + Express application demonstrating Azure Speech Services Avatar capabilities with real-time text-to-speech synthesis and visual avatar representation using WebRTC.

## 🚀 Features

- **Real-time Avatar Synthesis**: Visual avatar with synchronized lip movements
- **WebRTC Integration**: Low-latency streaming of avatar video and audio
- **Chat Interface**: Interactive conversation with message history
- **Azure Speech Services**: Powered by Azure Cognitive Services
- **TypeScript Support**: Full type safety for both frontend and backend

## 📋 Prerequisites

- Node.js (v18+)
- npm or yarn
- Azure Speech Services subscription (Standard S0 tier required for Avatar)
- Modern browser with WebRTC support (Chrome, Edge, Firefox, Safari)

## 🏗️ Project Structure

```
test-AZ-speech/
├── backend/                 # Express.js server
│   ├── src/
│   │   └── index.ts        # Main server file with API endpoints
│   ├── dist/               # Compiled JavaScript
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example        # Example environment variables
│
└── frontend/               # React application
    ├── src/
    │   ├── App.tsx        # Main component with avatar logic
    │   ├── App.css        # Styling
    │   └── index.tsx      # Entry point
    ├── public/
    └── package.json
```

## 🔧 Installation

### 1. Clone the repository

```bash
git clone git@github.com:marcus888-techstack/test-AZ-Speech-Avatar.git
cd test-AZ-Speech-Avatar
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your Azure credentials:
```env
AZ_SPEECH_KEY=your_azure_speech_key_here
AZ_SPEECH_REGION=your_azure_region_here
PORT=3000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### Development Mode

1. **Start the backend server:**
```bash
cd backend
npm run dev
```
The server will run on http://localhost:3000

2. **Start the frontend (in a new terminal):**
```bash
cd frontend
npm start
```
The application will open at http://localhost:3000

### Production Build

1. **Build the backend:**
```bash
cd backend
npm run build
npm start
```

2. **Build the frontend:**
```bash
cd frontend
npm run build
```
Serve the `build` folder with any static file server.

## 💡 Usage

1. Open the application in your browser
2. Wait for the avatar to initialize (you'll see "Initializing avatar...")
3. Type a message in the chat input
4. Press Enter or click Send
5. The avatar will appear and speak your message with synchronized lip movements
6. Continue the conversation!

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check endpoint |
| `/api/speech/token` | GET | Get Azure Speech token and region |
| `/api/speech/ice-token` | GET | Get ICE server configuration for WebRTC |
| `/api/speech/synthesize` | POST | Optional: Server-side speech synthesis |

## 🛠️ Configuration

### Azure Speech Services

1. Create an Azure Speech Services resource in the [Azure Portal](https://portal.azure.com)
2. Select **Standard S0** pricing tier (required for Avatar)
3. Copy your key and region
4. Add them to the backend `.env` file

### Supported Avatar Characters

- **lisa** (default)
- **jason**
- And more available in Azure documentation

### Supported Avatar Styles

- **casual-sitting** (default)
- **technical-standing**
- **business-standing**
- And more available in Azure documentation

## 🐛 Troubleshooting

### Avatar doesn't appear

1. Check browser console for errors
2. Verify Azure credentials in `.env`
3. Ensure you're using Standard S0 pricing tier
4. Check if your region supports Avatar feature

### Connection errors

1. Ensure both backend and frontend are running
2. Check CORS configuration
3. Verify firewall settings allow WebRTC connections

### No audio/video

1. Check browser permissions for audio/video
2. Ensure WebRTC is supported in your browser
3. Try using a different browser

## 🔒 Security Notes

- Never commit `.env` files with real credentials
- Use environment variables for production deployments
- Consider implementing authentication for production use
- Use HTTPS in production for WebRTC security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Azure Speech Services team for the Avatar API
- Microsoft Cognitive Services Speech SDK
- React and Express.js communities

## 📚 Resources

- [Azure Speech Services Documentation](https://docs.microsoft.com/azure/cognitive-services/speech-service/)
- [Speech SDK JavaScript Reference](https://docs.microsoft.com/javascript/api/microsoft-cognitiveservices-speech-sdk/)
- [Azure Avatar Documentation](https://docs.microsoft.com/azure/cognitive-services/speech-service/text-to-speech-avatar)

---

Built with ❤️ using React, Express, and Azure Speech Services