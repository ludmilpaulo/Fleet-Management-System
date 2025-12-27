/**
 * Standardized color palette for the Fleet Management System
 * All pages should use these colors for consistency
 */

// Primary brand colors
export const COLORS = {
  // Primary brand gradient (blue to purple)
  primary: {
    from: 'from-blue-600',
    to: 'to-purple-600',
    via: 'via-indigo-600',
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    light: 'bg-blue-50',
    border: 'border-blue-200',
  },
  
  // Role-specific colors
  roles: {
    admin: {
      gradient: 'from-red-600 to-rose-600',
      bg: 'bg-red-500',
      light: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-800 border-red-200',
    },
    staff: {
      gradient: 'from-blue-600 to-indigo-600',
      bg: 'bg-blue-500',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    driver: {
      gradient: 'from-green-600 to-emerald-600',
      bg: 'bg-green-500',
      light: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-800 border-green-200',
    },
    inspector: {
      gradient: 'from-yellow-600 to-orange-600',
      bg: 'bg-yellow-500',
      light: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
  },
  
  // Status colors
  status: {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      full: 'bg-green-100 text-green-800 border-green-200',
    },
    inactive: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      full: 'bg-gray-100 text-gray-800 border-gray-200',
    },
    maintenance: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      full: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    retired: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      full: 'bg-red-100 text-red-800 border-red-200',
    },
  },
  
  // Priority colors
  priority: {
    critical: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      full: 'bg-red-100 text-red-800 border-red-200',
    },
    high: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      full: 'bg-red-100 text-red-800 border-red-200',
    },
    medium: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      full: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    low: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      full: 'bg-green-100 text-green-800 border-green-200',
    },
  },
  
  // Ticket/Issue status colors
  ticketStatus: {
    open: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      full: 'bg-red-100 text-red-800 border-red-200',
    },
    in_progress: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      full: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    resolved: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      full: 'bg-green-100 text-green-800 border-green-200',
    },
    closed: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      full: 'bg-gray-100 text-gray-800 border-gray-200',
    },
  },
  
  // Background colors
  background: {
    main: 'bg-gray-50',
    card: 'bg-white',
    elevated: 'bg-white',
  },
  
  // Text colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    white: 'text-white',
  },
} as const;

// Helper function to get role colors
export function getRoleColors(role: 'admin' | 'staff' | 'driver' | 'inspector') {
  return COLORS.roles[role] || COLORS.roles.staff;
}

// Helper function to get status colors
export function getStatusColors(status: string) {
  const normalizedStatus = status.toLowerCase().replace(/_/g, '-');
  
  if (normalizedStatus.includes('active')) return COLORS.status.active;
  if (normalizedStatus.includes('inactive')) return COLORS.status.inactive;
  if (normalizedStatus.includes('maintenance')) return COLORS.status.maintenance;
  if (normalizedStatus.includes('retired')) return COLORS.status.retired;
  
  return COLORS.status.inactive;
}

// Helper function to get priority colors
export function getPriorityColors(priority: string) {
  const normalizedPriority = priority.toLowerCase();
  
  if (normalizedPriority === 'critical' || normalizedPriority === 'urgent') {
    return COLORS.priority.critical;
  }
  if (normalizedPriority === 'high') return COLORS.priority.high;
  if (normalizedPriority === 'medium') return COLORS.priority.medium;
  if (normalizedPriority === 'low') return COLORS.priority.low;
  
  return COLORS.priority.medium;
}

// Helper function to get ticket status colors
export function getTicketStatusColors(status: string) {
  const normalizedStatus = status.toLowerCase().replace(/_/g, '-');
  
  if (normalizedStatus === 'open') return COLORS.ticketStatus.open;
  if (normalizedStatus === 'in-progress' || normalizedStatus === 'in_progress') {
    return COLORS.ticketStatus.in_progress;
  }
  if (normalizedStatus === 'resolved') return COLORS.ticketStatus.resolved;
  if (normalizedStatus === 'closed') return COLORS.ticketStatus.closed;
  
  return COLORS.ticketStatus.open;
}

