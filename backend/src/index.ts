import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Get speech token endpoint
app.get('/api/speech/token', async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error getting speech token:', error);
    res.status(500).json({ error: 'Failed to get speech token' });
  }
});

// Get ICE server configuration for WebRTC
app.get('/api/speech/ice-token', async (req: Request, res: Response) => {
  try {
    const speechKey = process.env.AZ_SPEECH_KEY;
    const speechRegion = process.env.AZ_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      return res.status(500).json({ error: 'Azure Speech credentials not configured' });
    }

    console.log('Fetching ICE token from Azure...');
    
    // Fetch ICE server information from Azure
    const response = await axios.get(
      `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': speechKey
        }
      }
    );

    console.log('ICE token response status:', response.status);
    console.log('ICE token response data:', response.data);

    const iceServers = [{
      urls: response.data.Urls,
      username: response.data.Username,
      credential: response.data.Password
    }];

    res.json({ iceServers });
  } catch (error: any) {
    console.error('Error getting ICE token:', error);
    console.error('Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status
    });
    
    // Check if it's a 404 or authorization error
    if (error?.response?.status === 404) {
      console.error('ICE token endpoint not found. Avatar feature may not be available in your region or subscription.');
    } else if (error?.response?.status === 401 || error?.response?.status === 403) {
      console.error('Authorization failed. Please check your Azure Speech key and ensure your subscription supports Avatar.');
    }
    
    // Return empty array to use fallback STUN server
    res.json({ iceServers: [] });
  }
});

// Text to speech endpoint (optional - can be done client-side)
app.post('/api/speech/synthesize', async (req: Request, res: Response) => {
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
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
          res.json({ 
            success: true, 
            audioData: result.audioData,
            duration: result.audioDuration 
          });
        } else {
          console.error('Speech synthesis canceled, reason:', result.errorDetails);
          res.status(500).json({ error: 'Speech synthesis failed' });
        }
        synthesizer.close();
      },
      (error) => {
        console.error('Error:', error);
        res.status(500).json({ error: 'Speech synthesis error' });
        synthesizer.close();
      }
    );
  } catch (error) {
    console.error('Error in speech synthesis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});