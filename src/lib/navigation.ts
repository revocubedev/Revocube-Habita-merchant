import {
  LayoutDashboard,
  Users,
  Shield,
  UserCog,
  Building2,
  Building,
  Wrench,
  DollarSign,
  FileText,
  UserCheck,
  File,
  Tag,
  Mail,
  Settings,
  History,
  Receipt,
  CreditCard,
  Users as UsersIcon,
  UserCheck as UserCheckIcon,
} from 'lucide-react';
import type { NavItem } from '@/types';

// Navigation structure based on Figma Admin section
export const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { 
    to: '/management/users', 
    label: 'Management', 
    icon: Shield,
    children: [
      { to: '/management/users', label: 'Users', icon: Users },
      { to: '/management/roles', label: 'Roles', icon: Shield },
      { to: '/management/logs', label: 'Logged History', icon: History },
    ]
  },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/maintainers', label: 'Maintainers', icon: UserCog },
  { 
    to: '/real-estate/properties', 
    label: 'Real Estate', 
    icon: Building2,
    children: [
      { to: '/real-estate/properties', label: 'Properties', icon: Building },
      { to: '/real-estate/units', label: 'Units', icon: Building2 },
    ]
  },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { 
    to: '/finance/invoices', 
    label: 'Finance', 
    icon: DollarSign,
    children: [
      { to: '/finance/invoices', label: 'Invoices', icon: Receipt },
      { to: '/finance/expense', label: 'Expense', icon: CreditCard },
    ]
  },
  { to: '/notice-board', label: 'Notice Board', icon: FileText },
  { 
    to: '/visitors/guest-verification', 
    label: 'Visitors', 
    icon: UserCheck,
    children: [
      { to: '/visitors/guest-verification', label: 'Guest verification', icon: UsersIcon },
      { to: '/visitors/staff-verification', label: 'Staff verification', icon: UserCheckIcon },
    ]
  },
  { to: '/estate-rules', label: 'Estate Rules', icon: File },
  { to: '/types', label: 'Types', icon: Tag },
  { to: '/email-notification', label: 'Email Notification', icon: Mail },
  { to: '/settings', label: 'Settings', icon: Settings },
];

// Mock user profile (based on Figma design)
export const userProfile = {
  name: 'Diwura Ojo',
  email: 'diwura@revocube.com',
  role: 'Admin',
  avatar: null, // Can be replaced with image URL
};
