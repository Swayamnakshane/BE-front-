
export interface ScanResult {
  confidence: number;
  diagnosis: 'Normal' | 'Tuberculosis' | 'Pneumonia' | 'Undetermined';
  findings: string[];
  reportText: string;
  patientId: string;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  REPORT = 'REPORT'
}
