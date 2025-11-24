// Tipos para usuário
export interface User {
  id: number;
  email: string;
  fullName: string;
  type: 'internal' | 'external';
  role?: 'admin' | 'organizer' | 'attendee';
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para evento
export interface Event {
  id: number;
  userId: number;
  organizerName: string;
  name: string;
  type: 'internal' | 'external';
  description: string;
  date: string;
  location: string;
  capacity: number;
  subscriptionsCount?: number;
  availableSeats?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para inscrição
export interface Subscription {
  id: number;
  userId: number;
  eventId: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  event?: Event;
  user?: User;
  hasCertificate: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para autenticação
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  type: 'internal' | 'external';
}

export interface AuthResponse {
  user: User;
}

// Tipos para criação/edição de evento
export interface EventCreateRequest {
  name: string;
  type: 'internal' | 'external';
  description: string;
  date: string;
  location: string;
  capacity: number;
}

// Tipos para criação/edição de usuário
export interface UserCreateRequest {
  email: string;
  password: string;
  fullName: string;
  type: 'internal' | 'external';
  role?: 'admin' | 'organizer' | 'user';
}

// Tipos para certificado
export interface Certificate {
  id: number;
  certificateNumber: string;
  verificationToken: string;
  issuedAt: string;
  verifiedAt: string | null;
  verificationCount: number;
  event: {
    id: number;
    name: string;
    type: 'internal' | 'external';
    date: string;
    location: string;
  };
  subscription: {
    id: number;
    status: string;
    checkedInAt: string | null;
  };
}

