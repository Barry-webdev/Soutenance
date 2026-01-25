export interface User {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'admin' | 'partner';
  points: number;
  isActive: boolean;
  createdAt: string;
}

export interface WasteReport {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  description: string;
  images?: {
    original?: {
      url: string;
      filename?: string;
      size?: number;
      dimensions?: {
        width: number;
        height: number;
      };
      mimeType?: string;
    };
    medium?: {
      url: string;
      filename?: string;
      size?: number;
      dimensions?: {
        width: number;
        height: number;
      };
    };
    thumbnail?: {
      url: string;
      filename?: string;
      size?: number;
      dimensions?: {
        width: number;
        height: number;
      };
    };
  };
  audio?: {
    url: string;
    publicId?: string;
    duration: number;
    size?: number;
    mimeType?: string;
    transcription?: string;
    language?: 'fr' | 'ff' | 'sus' | 'man';
    transcribedAt?: string;
    transcribedBy?: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  status: 'pending' | 'collected' | 'not_collected';
  wasteType: 'plastique' | 'verre' | 'métal' | 'organique' | 'papier' | 'dangereux' | 'autre';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}