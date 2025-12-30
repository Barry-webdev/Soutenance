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
  id: string;
  userId: string;
  description: string;
  imageUrl?: string;
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