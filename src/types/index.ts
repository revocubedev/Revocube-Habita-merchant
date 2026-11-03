// Authentication types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

// Theme types
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Navigation types
export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  children?: NavItem[];
}

// Common UI types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Mock data interfaces (for development)
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface MockRole {
  id: string;
  name: string;
  permissions: string[];
  userCount: number;
}

export interface MockMember {
  id: string;
  name: string;
  phone: string;
  address: string;
  property: string;
  unit: string;
}

export interface MockMaintainer {
  id: string;
  name: string;
  email: string;
  user: string;
  creationDate: string;
  type: string;
}

export interface MockProperty {
  id: string;
  name: string;
  description: string;
  ownershipType: 'Own Property' | 'Lease Property';
  unitCount: number;
  roomCount: number;
  images: string[];
}

export interface MockUnit {
  id: string;
  unit: string;
  rentType: string;
  rent: string;
  rentDuration: string;
  property: string;
  member: string;
}

export interface MockMaintenanceRequest {
  id: string;
  property: string;
  unit: string;
  type: string;
  maintainer: string;
  requestDate: string;
  hasAttachment: boolean;
  status: 'Completed' | 'In Progress' | 'Pending';
}

export interface MockInvoice {
  id: string;
  invoice: string;
  invoiceType: string;
  property: string;
  unit: string;
  dueDate: string;
  amount: string;
  status: 'Paid' | 'Open' | 'In Progress' | 'Pending';
}

export interface MockExpense {
  id: string;
  expense: string;
  title: string;
  property: string;
  unit: string;
  type: string;
  date: string;
  amount: string;
  hasReceipt: boolean;
}

export interface MockNotice {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface MockVisitor {
  id: string;
  code: string;
  visitor: string;
  checkIn: string;
  checkOut: string;
  status: 'Checked In' | 'Checked Out';
}

export interface MockType {
  id: string;
  title: string;
  type: string;
}

export interface MockEmailNotification {
  id: string;
  module: string;
  subject: string;
  status: 'Enabled' | 'Disabled';
}
