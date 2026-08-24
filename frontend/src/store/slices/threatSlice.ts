import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ThreatAlert {
  id: string;
  timestamp: string;
  source: string;
  type: 'url' | 'email' | 'job' | 'deepfake' | 'screenshot' | 'qr' | 'voice';
  target: string;
  score: number;
  confidence: number;
  status: 'critical' | 'high' | 'medium' | 'safe';
  explanation: string;
  originIp?: string;
  country?: string;
}

interface ThreatState {
  threats: ThreatAlert[];
  liveLogs: string[];
  systemStatus: {
    ollamaStatus: 'online' | 'offline';
    mongoStatus: 'online' | 'offline';
    redisStatus: 'online' | 'offline';
    modelAccuracy: number;
  };
}

const initialState: ThreatState = {
  threats: [
    {
      id: 'TH-8902',
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      source: 'External Gateway',
      type: 'url',
      target: 'http://secure-login-chase-update.info/signin',
      score: 96,
      confidence: 0.98,
      status: 'critical',
      explanation: 'Phishing clone detected. Leverages homograph domain impersonating Chase Bank. SSL certificate missing.',
      originIp: '185.220.101.4',
      country: 'RU'
    },
    {
      id: 'TH-8903',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      source: 'Microsoft 365 Integration',
      type: 'email',
      target: 'Urgent Wire Transfer Request from CEO',
      score: 82,
      confidence: 0.89,
      status: 'high',
      explanation: 'Business Email Compromise (BEC) pattern detected. Stylistic variation in sender profile. Urges direct bypass of standard invoice protocols.',
      originIp: '94.140.14.8',
      country: 'NL'
    },
    {
      id: 'TH-8904',
      timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      source: 'LinkedIn Scraper API',
      type: 'job',
      target: 'Data Entry Assistant - Upfront Payment required for training',
      score: 74,
      confidence: 0.91,
      status: 'medium',
      explanation: 'Advance-fee job fraud pattern. Requesting payment for training equipment and uses non-corporate domain contact emails.',
      originIp: '203.0.113.41',
      country: 'IN'
    },
    {
      id: 'TH-8905',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      source: 'API File Upload',
      type: 'deepfake',
      target: 'audio_interview_candidate_491.wav',
      score: 89,
      confidence: 0.94,
      status: 'critical',
      explanation: 'Synthetic voice replication detected (94.2% likelihood). Linear prediction pitch anomalies detected. Cloned voice mimics executive CFO speech.',
      originIp: '198.51.100.12',
      country: 'CN'
    },
    {
      id: 'TH-8906',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      source: 'External Gateway',
      type: 'url',
      target: 'https://paypal-verif-security.com/login',
      score: 98,
      confidence: 0.99,
      status: 'critical',
      explanation: 'Cloned PayPal layout detected. Domain was registered 24 hours ago. Hosted on bulletproof VPS infrastructure.',
      originIp: '109.248.9.22',
      country: 'RU'
    }
  ],
  liveLogs: [
    'System initialization completed.',
    'FastAPI Gateway router online.',
    'MongoDB thread pool ready (Motor driver active).',
    'Redis cache initialized.',
    'Listening on real-time cyber telemetry feed...'
  ],
  systemStatus: {
    ollamaStatus: 'online',
    mongoStatus: 'online',
    redisStatus: 'online',
    modelAccuracy: 98.4
  }
};

export const threatSlice = createSlice({
  name: 'threats',
  initialState,
  reducers: {
    addThreat: (state, action: PayloadAction<ThreatAlert>) => {
      state.threats.unshift(action.payload);
      if (state.threats.length > 50) {
        state.threats.pop();
      }
    },
    addLiveLog: (state, action: PayloadAction<string>) => {
      state.liveLogs.unshift(`[${new Date().toLocaleTimeString()}] ${action.payload}`);
      if (state.liveLogs.length > 30) {
        state.liveLogs.pop();
      }
    },
    updateSystemStatus: (state, action: PayloadAction<Partial<ThreatState['systemStatus']>>) => {
      state.systemStatus = { ...state.systemStatus, ...action.payload };
    }
  }
});

export const { addThreat, addLiveLog, updateSystemStatus } = threatSlice.actions;

export default threatSlice.reducer;
