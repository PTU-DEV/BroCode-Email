export interface ScanResult {
  isPhishing: boolean;
  confidence: number;
  explanation: string;
  recommendations: string[];
  riskFactors: string[];
}

export interface EmailData {
  sender: string;
  subject: string;
  content: string;
  links: string[];
  attachments: string[];
  timestamp?: string;
  read?: boolean;
}

export interface WorkloadData {
  ipAddress: string;
  domain: string;
  trafficPattern: string;
  payload: string;
}