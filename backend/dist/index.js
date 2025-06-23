"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const speechsdk = __importStar(require("microsoft-cognitiveservices-speech-sdk"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Get speech token endpoint
app.get('/api/speech/token', async (req, res) => {
    try {
        const speechKey = process.env.AZ_SPEECH_KEY;
        const speechRegion = process.env.AZ_SPEECH_REGION;
        if (!speechKey || !speechRegion) {
            return res.status(500).json({ error: 'Azure Speech credentials not configured' });
        }
        // Return the token directly for the frontend to use
        res.json({
            token: speechKey,
            region: speechRegion
        });
    }
    catch (error) {
        console.error('Error getting speech token:', error);
        res.status(500).json({ error: 'Failed to get speech token' });
    }
});
// Get ICE server configuration for WebRTC
app.get('/api/speech/ice-token', async (req, res) => {
    try {
        const speechKey = process.env.AZ_SPEECH_KEY;
        const speechRegion = process.env.AZ_SPEECH_REGION;
        if (!speechKey || !speechRegion) {
            return res.status(500).json({ error: 'Azure Speech credentials not configured' });
        }
        // Fetch ICE server information from Azure
        const response = await axios_1.default.get(`https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`, {
            headers: {
                'Ocp-Apim-Subscription-Key': speechKey
            }
        });
        const iceServers = [{
                urls: response.data.Urls,
                username: response.data.Username,
                credential: response.data.Password
            }];
        res.json({ iceServers });
    }
    catch (error) {
        console.error('Error getting ICE token:', error);
        // Return empty array to use fallback STUN server
        res.json({ iceServers: [] });
    }
});
// Text to speech endpoint (optional - can be done client-side)
app.post('/api/speech/synthesize', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        const speechKey = process.env.AZ_SPEECH_KEY;
        const speechRegion = process.env.AZ_SPEECH_REGION;
        if (!speechKey || !speechRegion) {
            return res.status(500).json({ error: 'Azure Speech credentials not configured' });
        }
        // Create speech config
        const speechConfig = speechsdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
        // Create audio config for streaming
        const audioConfig = speechsdk.AudioConfig.fromDefaultSpeakerOutput();
        // Create synthesizer
        const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
        // Synthesize text
        synthesizer.speakTextAsync(text, (result) => {
            if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
                res.json({
                    success: true,
                    audioData: result.audioData,
                    duration: result.audioDuration
                });
            }
            else {
                console.error('Speech synthesis canceled, reason:', result.errorDetails);
                res.status(500).json({ error: 'Speech synthesis failed' });
            }
            synthesizer.close();
        }, (error) => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Speech synthesis error' });
            synthesizer.close();
        });
    }
    catch (error) {
        console.error('Error in speech synthesis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
