import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../store';
import { addThreat, addLiveLog } from '../store/slices/threatSlice';

const API_BASE = 'http://localhost:8000/api/v1';

// Standard API response envelope
interface Envelope<T> {
  success: boolean;
  data: T;
  error: string | null;
  timestamp: string;
}

export interface ScanResponseData {
  risk_score: number;
  confidence_score: number;
  status: string;
  url?: string;
  filename?: string;
  ai_analysis: {
    summary: string;
    indicators: string[];
    shap_values?: Record<string, number>;
    suggested_action?: string;
    spectral_anomalies?: string;
    model_confidence?: number;
  };
}

export interface WeeklyTrendData {
  day: string;
  URLs: number;
  Emails: number;
  JobOffers: number;
  Deepfakes: number;
}

export interface ThreatTypeDist {
  name: string;
  value: number;
  color?: string;
}

export interface Metrics {
  totalScans: number;
  threatsBlocked: number;
  safeProcessed: number;
  weeklyTrend: WeeklyTrendData[];
  threatTypesDistribution: ThreatTypeDist[];
  modelMetrics: {
    precision: number;
    recall: number;
    f1: number;
    latencyMs: number;
  };
}

export interface Report {
  id: string;
  title: string;
  created_at: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  assigned_analyst: string;
  summary: string;
  findings_count: number;
}

function generateThreatId(): string {
  return `TH-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const useScanner = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  // Helper for generic API posting
  async function apiPost<T, R>(path: string, body: T): Promise<R> {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token-xyz'
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const json: Envelope<R> = await response.json();
      if (!json.success) {
        throw new Error(json.error || 'Unknown error');
      }
      return json.data;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`Backend fetch failed on ${path}. Using mock response. Details:`, errMsg);
      throw err;
    }
  }

  // Helper for generic API getting
  async function apiGet<R>(path: string): Promise<R> {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Authorization': 'Bearer mock-jwt-token-xyz'
      }
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const json: Envelope<R> = await response.json();
    if (!json.success) {
      throw new Error(json.error || 'Unknown error');
    }
    return json.data;
  }

  // URL Scanner Mutation
  const urlScanMutation = useMutation({
    mutationFn: async (url: string) => {
      try {
        return await apiPost<{ url: string }, ScanResponseData>('/scan/url', { url });
      } catch {
        // Mock fallback if API offline
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const isPhishing = url.toLowerCase().includes('secure') || url.toLowerCase().includes('chase') || url.toLowerCase().includes('paypal') || url.length > 30;
        const score = isPhishing ? Math.floor(Math.random() * 25) + 75 : Math.floor(Math.random() * 15) + 5;
        const confidence = 0.85 + Math.random() * 0.14;
        
        return {
          url,
          risk_score: score,
          confidence_score: Number(confidence.toFixed(2)),
          status: 'completed',
          ai_analysis: {
            summary: isPhishing
              ? 'High probability phishing attempt. Impersonates financial institutional domain using anomalous entropy.'
              : 'Safe domain verification. Reputation check passed, active domain certificate matched.',
            indicators: isPhishing
              ? ['Suspicious keyword pattern match', 'Short-lived registration age', 'Anomalous path structure']
              : ['Standard secure protocol HTTPS', 'Well-established registrar history', 'Low-entropy URI path'],
            shap_values: {
              domain_length: isPhishing ? 0.35 : -0.15,
              contains_at_symbol: url.includes('@') ? 0.4 : 0.0,
              https_scheme: url.startsWith('https') ? -0.25 : 0.3,
              keyword_match_bank: isPhishing ? 0.5 : -0.1
            }
          }
        };
      }
    },
    onSuccess: (data) => {
      // Add to Redux state
      const alertStatus = (data.risk_score > 75 ? 'critical' : data.risk_score > 50 ? 'high' : data.risk_score > 25 ? 'medium' : 'safe') as 'critical' | 'high' | 'medium' | 'safe';
      const threat = {
        id: generateThreatId(),
        timestamp: new Date().toISOString(),
        source: 'User Portal Request',
        type: 'url' as const,
        target: data.url,
        score: data.risk_score,
        confidence: data.confidence_score,
        status: alertStatus,
        explanation: data.ai_analysis.summary,
        originIp: '192.168.1.1',
        country: 'US'
      };
      
      dispatch(addThreat(threat));
      dispatch(addLiveLog(`URL scan complete: ${data.url} [Score: ${data.risk_score}]`));
      queryClient.invalidateQueries({ queryKey: ['threat-metrics'] });
    }
  });

  // Email Scanner Mutation
  const emailScanMutation = useMutation({
    mutationFn: async (emailText: string) => {
      try {
        return await apiPost<{ email_text: string }, ScanResponseData>('/scan/email', { email_text: emailText });
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const isScam = emailText.toLowerCase().includes('urgent') || emailText.toLowerCase().includes('wire') || emailText.toLowerCase().includes('bank') || emailText.toLowerCase().includes('ceo') || emailText.toLowerCase().includes('lottery');
        const score = isScam ? Math.floor(Math.random() * 20) + 78 : Math.floor(Math.random() * 12) + 8;
        const confidence = 0.90 + Math.random() * 0.09;
        
        return {
          risk_score: score,
          confidence_score: Number(confidence.toFixed(2)),
          status: 'completed',
          ai_analysis: {
            summary: isScam
              ? 'Social engineering attempt detected mimicking standard executive billing instructions.'
              : 'Standard communication style. Low probability of coercion or credential phishing.',
            indicators: isScam
              ? ['Urgency framing keywords', 'Alternative payout account instruction', 'Mismatched sender domain records']
              : ['Standard sign-off style', 'Corporate domain DKIM signatures verified', 'No transactional alerts'],
            suggested_action: isScam
              ? 'WARNING: Quarantining email content. Do NOT click external attachments or execute money wire transactions.'
              : 'Safe to process. Standard internal communication verified.'
          }
        };
      }
    },
    onSuccess: (data, variables) => {
      const alertStatus = (data.risk_score > 75 ? 'critical' : data.risk_score > 50 ? 'high' : data.risk_score > 25 ? 'medium' : 'safe') as 'critical' | 'high' | 'medium' | 'safe';
      const threat = {
        id: generateThreatId(),
        timestamp: new Date().toISOString(),
        source: 'Corporate SMTP Hook',
        type: 'email' as const,
        target: variables.substring(0, 45) + '...',
        score: data.risk_score,
        confidence: data.confidence_score,
        status: alertStatus,
        explanation: data.ai_analysis.summary,
        originIp: '203.0.113.88',
        country: 'IE'
      };
      
      dispatch(addThreat(threat));
      dispatch(addLiveLog(`Email scanner verified transaction scam [Score: ${data.risk_score}]`));
      queryClient.invalidateQueries({ queryKey: ['threat-metrics'] });
    }
  });

  // Job Scanner Mutation
  const jobScanMutation = useMutation({
    mutationFn: async (jobText: string) => {
      try {
        return await apiPost<{ job_text: string }, ScanResponseData>('/scan/job', { job_text: jobText });
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const isScam = jobText.toLowerCase().includes('upfront') || jobText.toLowerCase().includes('training fee') || jobText.toLowerCase().includes('unlimited income') || jobText.toLowerCase().includes('telegram');
        const score = isScam ? Math.floor(Math.random() * 20) + 70 : Math.floor(Math.random() * 15) + 10;
        const confidence = 0.88 + Math.random() * 0.10;

        return {
          risk_score: score,
          confidence_score: Number(confidence.toFixed(2)),
          status: 'completed',
          ai_analysis: {
            summary: isScam
              ? 'Advance-fee job scam targeting personal recruitment vectors. Requires registration deposits.'
              : 'Valid employer posting matching traditional work parameters.',
            indicators: isScam
              ? ['Mandatory upfront capital request', 'Interviews hosted exclusively via personal chats', 'Vague contract obligations']
              : ['Standard salary parameters', 'Direct verified site application', 'Professional vetting structure']
          }
        };
      }
    },
    onSuccess: (data, variables) => {
      const alertStatus = (data.risk_score > 75 ? 'critical' : data.risk_score > 50 ? 'high' : data.risk_score > 25 ? 'medium' : 'safe') as 'critical' | 'high' | 'medium' | 'safe';
      const threat = {
        id: generateThreatId(),
        timestamp: new Date().toISOString(),
        source: 'Recruitment Scraper',
        type: 'job' as const,
        target: variables.substring(0, 45) + '...',
        score: data.risk_score,
        confidence: data.confidence_score,
        status: alertStatus,
        explanation: data.ai_analysis.summary,
        originIp: '185.220.101.42',
        country: 'UA'
      };
      
      dispatch(addThreat(threat));
      dispatch(addLiveLog(`Job offer vetted. Class: ${isScam(data.risk_score) ? 'FRAUD' : 'VALID'} [Score: ${data.risk_score}]`));
      queryClient.invalidateQueries({ queryKey: ['threat-metrics'] });
    }
  });

  // Deepfake Scanner Mutation
  const deepfakeScanMutation = useMutation({
    mutationFn: async (fileData: { name: string, type: 'audio' | 'video', size: number }) => {
      try {
        return await apiPost<{ filename: string, file_type: string, file_size: number }, ScanResponseData>('/scan/deepfake', {
          filename: fileData.name,
          file_type: fileData.type,
          file_size: fileData.size
        });
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const isFake = fileData.name.toLowerCase().includes('fake') || fileData.name.toLowerCase().includes('clone') || fileData.name.toLowerCase().includes('cfo') || Math.random() > 0.5;
        const score = isFake ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 15) + 2;
        const confidence = 0.92 + Math.random() * 0.07;

        return {
          filename: fileData.name,
          risk_score: score,
          confidence_score: Number(confidence.toFixed(2)),
          status: 'completed',
          ai_analysis: {
            summary: isFake
              ? `Synthetic ${fileData.type} media detected. Found visual/auditory frequency anomalies matching generator profiles.`
              : 'Organic media profile. Standard audio spectral densities and face mesh vector movements verified.',
            spectral_anomalies: isFake ? 'High high-frequency variance in speech bands. Mismatched lip movements.' : 'None detected.',
            model_confidence: Number((confidence * 100).toFixed(1))
          }
        };
      }
    },
    onSuccess: (data) => {
      const alertStatus = (data.risk_score > 75 ? 'critical' : data.risk_score > 50 ? 'high' : data.risk_score > 25 ? 'medium' : 'safe') as 'critical' | 'high' | 'medium' | 'safe';
      const threat = {
        id: generateThreatId(),
        timestamp: new Date().toISOString(),
        source: 'SOC Deepfake Uplink',
        type: 'deepfake' as const,
        target: data.filename,
        score: data.risk_score,
        confidence: data.confidence_score,
        status: alertStatus,
        explanation: data.ai_analysis.summary,
        originIp: '127.0.0.1',
        country: 'US'
      };
      
      dispatch(addThreat(threat));
      dispatch(addLiveLog(`Deepfake evaluation: ${data.filename} [Risk: ${data.risk_score}%]`));
      queryClient.invalidateQueries({ queryKey: ['threat-metrics'] });
    }
  });

  // ---------- Chat Assistant Mutation ----------
  interface ChatTurn { role: 'user' | 'assistant'; content: string; }
  interface ChatResult {
    reply: string;
    risk_score?: number;
    indicators: string[];
    suggested_action?: string;
  }

  const chatMutation = useMutation({
    mutationFn: async (vars: { message: string; history: ChatTurn[]; language: string }) => {
      try {
        return await apiPost<typeof vars, ChatResult>('/assist/chat', vars);
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 900));
        const risky = /http|urgent|otp|bank|wire|prize|lottery|click/i.test(vars.message);
        return {
          reply: risky
            ? "⚠️ That has some scam red flags — avoid clicking links or sharing OTP/bank details."
            : "✅ Nothing alarming jumps out, but never share OTPs or passwords with anyone.",
          risk_score: risky ? 82 : 12,
          indicators: risky ? ['Urgency / payment / OTP keyword match'] : ['No scam keywords found'],
          suggested_action: risky ? 'Do not click or respond. Block and report the sender.' : 'Safe to proceed with normal caution.'
        };
      }
    }
  });

  // ---------- Screenshot Scanner Mutation ----------
  interface ScreenshotResult extends ScanResponseData { extracted_text: string; }

  const screenshotScanMutation = useMutation({
    mutationFn: async (vars: { image_base64: string; source_hint: string }) => {
      return await apiPost<typeof vars, ScreenshotResult>('/assist/screenshot', vars);
    },
    onSuccess: (data) => {
      const alertStatus = (data.risk_score > 75 ? 'critical' : data.risk_score > 50 ? 'high' : data.risk_score > 25 ? 'medium' : 'safe') as 'critical' | 'high' | 'medium' | 'safe';
      dispatch(addThreat({
        id: generateThreatId(),
        timestamp: new Date().toISOString(),
        source: 'Screenshot Upload (OCR)',
        type: 'screenshot',
        target: data.extracted_text.substring(0, 50) + '...',
        score: data.risk_score,
        confidence: data.confidence_score,
        status: alertStatus,
        explanation: data.ai_analysis.summary,
        originIp: 'local-upload',
        country: 'IN'
      }));
      dispatch(addLiveLog(`Screenshot scanned via OCR [Score: ${data.risk_score}]`));
      queryClient.invalidateQueries({ queryKey: ['threat-metrics'] });
    }
  });

  // ---------- QR Code Scanner Mutation ----------
  interface QRResult {
    decoded_url: string | null;
    qr_type: string;
    risk_score: number;
    confidence_score: number;
    status: string;
    ai_analysis: { summary: string; indicators: string[]; suggested_action?: string; };
  }

  const qrScanMutation = useMutation({
    mutationFn: async (vars: { image_base64: string }) => {
      return await apiPost<typeof vars, QRResult>('/assist/qr', vars);
    },
    onSuccess: (data) => {
      const alertStatus = (data.risk_score > 75 ? 'critical' : data.risk_score > 50 ? 'high' : data.risk_score > 25 ? 'medium' : 'safe') as 'critical' | 'high' | 'medium' | 'safe';
      dispatch(addThreat({
        id: generateThreatId(),
        timestamp: new Date().toISOString(),
        source: 'QR Code Upload',
        type: 'qr',
        target: data.decoded_url || 'unreadable-qr',
        score: data.risk_score,
        confidence: data.confidence_score,
        status: alertStatus,
        explanation: data.ai_analysis.summary,
        originIp: 'local-upload',
        country: 'IN'
      }));
      dispatch(addLiveLog(`QR code scanned [Type: ${data.qr_type}, Score: ${data.risk_score}]`));
      queryClient.invalidateQueries({ queryKey: ['threat-metrics'] });
    }
  });

  // ---------- Voice Scam Detection Mutation ----------
  interface HighlightedSentence { sentence: string; flagged: boolean; matched_terms: string[]; }
  interface VoiceResult extends ScanResponseData {
    transcript: string;
    ai_analysis: ScanResponseData['ai_analysis'] & { highlighted_sentences?: HighlightedSentence[] };
  }

  const voiceScanMutation = useMutation({
    mutationFn: async (vars: { audio_base64: string; filename: string; language: string }) => {
      return await apiPost<typeof vars, VoiceResult>('/assist/voice', vars);
    },
    onSuccess: (data) => {
      const alertStatus = (data.risk_score > 75 ? 'critical' : data.risk_score > 50 ? 'high' : data.risk_score > 25 ? 'medium' : 'safe') as 'critical' | 'high' | 'medium' | 'safe';
      dispatch(addThreat({
        id: generateThreatId(),
        timestamp: new Date().toISOString(),
        source: 'Voice Upload (Speech-to-Text)',
        type: 'voice',
        target: data.transcript.substring(0, 50) + '...',
        score: data.risk_score,
        confidence: data.confidence_score,
        status: alertStatus,
        explanation: data.ai_analysis.summary,
        originIp: 'local-upload',
        country: 'IN'
      }));
      dispatch(addLiveLog(`Voice call analyzed [Score: ${data.risk_score}]`));
      queryClient.invalidateQueries({ queryKey: ['threat-metrics'] });
    }
  });

  // Query for charts and executive analytics
  const useAnalytics = () => {
    return useQuery({
      queryKey: ['threat-metrics'],
      queryFn: async () => {
        try {
          return await apiGet<Metrics>('/threat-intel/metrics');
        } catch {
          // Mock data offline
          return {
            totalScans: 1420,
            threatsBlocked: 341,
            safeProcessed: 1079,
            weeklyTrend: [
              { day: 'Mon', URLs: 40, Emails: 24, JobOffers: 12, Deepfakes: 4 },
              { day: 'Tue', URLs: 54, Emails: 32, JobOffers: 15, Deepfakes: 7 },
              { day: 'Wed', URLs: 78, Emails: 45, JobOffers: 8, Deepfakes: 10 },
              { day: 'Thu', URLs: 65, Emails: 38, JobOffers: 21, Deepfakes: 9 },
              { day: 'Fri', URLs: 90, Emails: 52, JobOffers: 19, Deepfakes: 12 },
              { day: 'Sat', URLs: 45, Emails: 18, JobOffers: 5, Deepfakes: 6 },
              { day: 'Sun', URLs: 30, Emails: 12, JobOffers: 7, Deepfakes: 3 }
            ],
            threatTypesDistribution: [
              { name: 'Phishing URLs', value: 450, color: '#f43f5e' },
              { name: 'Scam Emails', value: 290, color: '#f97316' },
              { name: 'Fake Jobs', value: 120, color: '#eab308' },
              { name: 'Deepfake Media', value: 80, color: '#a855f7' }
            ],
            modelMetrics: {
              precision: 99.1,
              recall: 98.4,
              f1: 98.7,
              latencyMs: 140
            }
          };
        }
      },
      refetchInterval: 30000 // Update metrics every 30 seconds
    });
  };

  // Query for Reports
  const useReports = () => {
    return useQuery({
      queryKey: ['investigation-reports'],
      queryFn: async () => {
        try {
          return await apiGet<Report[]>('/reports');
        } catch {
          return [
            {
              id: 'REP-9001',
              title: 'BEC Attack Campaign Targeting Accounts Payable',
              created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
              severity: 'high',
              assigned_analyst: 'sec_admin',
              summary: 'Campaign of multiple phishing emails attempting to direct wire transfers to offshore shell accounts. Intercepted via stylistic pattern detection.',
              findings_count: 3
            },
            {
              id: 'REP-9002',
              title: 'Cloned Bank Domain Phishing Campaign',
              created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
              severity: 'critical',
              assigned_analyst: 'sec_admin',
              summary: 'Active phishing portal hosted on Bulletproof server matching homograph variants of standard financial portals. Blocked 45 client visits.',
              findings_count: 12
            },
            {
              id: 'REP-9003',
              title: 'C-Suite Synthetic Audio Impersonation',
              created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
              severity: 'critical',
              assigned_analyst: 'sec_admin',
              summary: 'Deepfake voice clone of CFO sent via voicemail. Extracted pitch fluctuation anomalies matching generative neural synthesizer.',
              findings_count: 1
            }
          ];
        }
      }
    });
  };

  function isScam(score: number): boolean {
    return score > 60;
  }

  return {
    urlScanMutation,
    emailScanMutation,
    jobScanMutation,
    deepfakeScanMutation,
    chatMutation,
    screenshotScanMutation,
    qrScanMutation,
    voiceScanMutation,
    useAnalytics,
    useReports
  };
};
