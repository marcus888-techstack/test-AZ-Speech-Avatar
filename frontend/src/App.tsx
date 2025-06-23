import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'avatar';
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speechConfig, setSpeechConfig] = useState<SpeechSDK.SpeechConfig | null>(null);
  const [avatarSynthesizer, setAvatarSynthesizer] = useState<SpeechSDK.AvatarSynthesizer | null>(null);
  const [isAvatarReady, setIsAvatarReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Initialize speech config and avatar
    initializeAvatar();

    return () => {
      // Cleanup
      if (avatarSynthesizer) {
        avatarSynthesizer.close();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  const initializeAvatar = async () => {
    try {
      console.log('Starting avatar initialization...');
      
      // Get speech config from backend
      const response = await axios.get('http://localhost:3000/api/speech/token');
      const { token, region } = response.data;
      console.log('Got token and region:', { region, tokenLength: token?.length });

      const config = SpeechSDK.SpeechConfig.fromSubscription(token, region);
      config.speechSynthesisVoiceName = 'en-US-JennyNeural';
      setSpeechConfig(config);

      // Get ICE server configuration
      console.log('Fetching ICE server configuration...');
      const iceResponse = await axios.get('http://localhost:3000/api/speech/ice-token');
      const iceServers = iceResponse.data.iceServers || [];
      console.log('ICE servers:', iceServers);

      // Create WebRTC peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: iceServers.length > 0 ? iceServers : [
          { urls: 'stun:stun.l.google.com:19302' } // Fallback STUN server
        ]
      });

      peerConnectionRef.current = peerConnection;

      // Add connection state logging
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
      };

      // Set up video/audio stream handlers
      peerConnection.ontrack = (event) => {
        console.log('Track received:', event.track.kind);
        
        if (event.track.kind === 'video' && videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
        
        if (event.track.kind === 'audio' && audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
        }
      };

      // Add transceivers for bidirectional communication
      peerConnection.addTransceiver('video', { direction: 'sendrecv' });
      peerConnection.addTransceiver('audio', { direction: 'sendrecv' });

      // Configure avatar
      console.log('Configuring avatar...');
      const avatarConfig = new (SpeechSDK as any).AvatarConfig(
        'lisa',
        'casual-sitting', 
        new (SpeechSDK as any).AvatarVideoFormat()
      );
      avatarConfig.backgroundColor = '#FFFFFFFF';

      // Create avatar synthesizer
      const synthesizer = new SpeechSDK.AvatarSynthesizer(config, avatarConfig);
      
      // Start avatar with peer connection
      console.log('Starting avatar with peer connection...');
      await synthesizer.startAvatarAsync(peerConnection);
      
      setAvatarSynthesizer(synthesizer);
      setIsAvatarReady(true);
      console.log('Avatar started successfully');
    } catch (error: any) {
      console.error('Failed to initialize avatar:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response?.data
      });
      alert(`Failed to initialize avatar: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !avatarSynthesizer || !isAvatarReady) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Create avatar response
      const avatarMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Hello! You said: "${userMessage.text}". This is a demo of Azure Avatar synthesis.`,
        sender: 'avatar',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, avatarMessage]);

      // Make avatar speak
      await avatarSynthesizer.speakTextAsync(avatarMessage.text).then(
        (result) => {
          if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            console.log('Speech synthesis completed');
          } else {
            console.error('Speech synthesis failed:', result);
            if (result.reason === SpeechSDK.ResultReason.Canceled) {
              const cancellation = SpeechSDK.CancellationDetails.fromResult(result as any);
              console.error('Cancellation details:', cancellation.errorDetails);
            }
          }
        }
      ).catch((error) => {
        console.error('Speech synthesis error:', error);
      });
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Azure Avatar Demo</h1>
      </header>

      <div className="chat-container">
        <div className="avatar-section">
          <h2>Avatar</h2>
          <div className="avatar-display">
            <video 
              ref={videoRef} 
              className="avatar-video"
              autoPlay 
              playsInline
              muted
            />
            <audio 
              ref={audioRef} 
              className="avatar-audio"
              autoPlay 
            />
            {!isAvatarReady && (
              <div className="avatar-loading">
                <p>Initializing avatar...</p>
              </div>
            )}
          </div>
        </div>

        <div className="chat-section">
          <div className="messages-container">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.sender}`}
              >
                <span className="message-sender">
                  {message.sender === 'user' ? 'You' : 'Avatar'}:
                </span>
                <span className="message-text">{message.text}</span>
              </div>
            ))}
            {isLoading && (
              <div className="message avatar loading">
                <span className="message-sender">Avatar:</span>
                <span className="message-text">Speaking...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
              disabled={isLoading || !isAvatarReady}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={isLoading || !isAvatarReady || !inputText.trim()}
            >
              {isAvatarReady ? 'Send' : 'Initializing...'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
