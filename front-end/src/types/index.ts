export interface User {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'collector' | 'authority' | 'admin';
  points: number;
  createdAt: string;
}

export interface WasteReport {
  id: string;
  userId: string;
  userName: string;
  description: string;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'reported' | 'inProgress' | 'completed';
  wasteType: 'general' | 'recyclable' | 'organic' | 'hazardous' | 'other';
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