export interface Recording {
  id: string;
  timestamp: number;
  duration: number; // in seconds
  url: string;
  outcome: 'connected' | 'missed' | 'voicemail';
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  interest: 'Buying' | 'Renting' | 'Selling' | 'Management';
  lastActivity: string;
  notes: string;
  recordings: Recording[];
}

export interface Property {
  id: string;
  address: string;
  price: string;
  type: string;
  status: 'Active' | 'Sold' | 'Pending';
  image: string;
}

export enum CallState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  ERROR = 'ERROR'
}

export interface AudioVolume {
  input: number;
  output: number;
}