export type ErrorCode = 400 | 401 | 403 | 404 | 405 | 500 | 502 | 503 | 0;

export interface ErrorAction {
  label: string;
  icon?: string;
  link?: string;
  action?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ErrorDetail {
  code: ErrorCode;
  title: string;
  message: string;
  description: string;
  icon: string;
  colorClass: string;
  badgeClass: string;
  correlationId?: string;
  technicalDetails?: string | object | null;
  primaryAction?: ErrorAction;
  secondaryAction?: ErrorAction;
  canRetry?: boolean;
  retryCallback?: () => void;
}

export const ERROR_DEFINITIONS: Record<ErrorCode, Omit<ErrorDetail, 'correlationId' | 'technicalDetails' | 'retryCallback'>> = {
  404: {
    code: 404,
    title: 'Page or Asset Not Found',
    message: 'The requested workstation resource, chart, or endpoint does not exist or has been relocated.',
    description: 'We checked our distributed ledger and routes, but could not locate the requested resource.',
    icon: 'fa-solid fa-compass-drafting',
    colorClass: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    primaryAction: {
      label: 'Back to Paper Trading',
      link: '/trading',
      icon: 'fa-solid fa-chart-line',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Trading Terminal',
      link: '/trading/trade',
      icon: 'fa-solid fa-shapes',
      variant: 'secondary',
    },
  },
  403: {
    code: 403,
    title: 'Access Forbidden',
    message: 'You do not have permission or role clearance to access this trading resource or execute this administrative command.',
    description: 'This area requires specific permissions (e.g. Administrator or Verified Trader). If you believe this is an error, contact your tenant admin.',
    icon: 'fa-solid fa-shield-halved',
    colorClass: 'text-rose-500',
    badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    primaryAction: {
      label: 'Return to Hub',
      link: '/trading',
      icon: 'fa-solid fa-arrow-left',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Profile Settings',
      link: '/profile',
      icon: 'fa-solid fa-user-gear',
      variant: 'secondary',
    },
  },
  401: {
    code: 401,
    title: 'Unauthorized Session',
    message: 'Your authenticated session has expired, or valid JWT bearer credentials were not provided.',
    description: 'Please sign in with your credentials or Google account to restore your trading session.',
    icon: 'fa-solid fa-lock',
    colorClass: 'text-cyan-500',
    badgeClass: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    primaryAction: {
      label: 'Sign In Again',
      link: '/auth/login',
      icon: 'fa-solid fa-right-to-bracket',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Register Account',
      link: '/auth/register',
      icon: 'fa-solid fa-user-plus',
      variant: 'secondary',
    },
  },
  405: {
    code: 405,
    title: 'Method & Action Not Allowed',
    message: 'The requested action or HTTP verb is not permitted on this market entity or current instrument state.',
    description: 'The endpoint exists, but does not support the attempted action (e.g. shorting an unsupported asset, or invalid order transition).',
    icon: 'fa-solid fa-ban',
    colorClass: 'text-orange-500',
    badgeClass: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    primaryAction: {
      label: 'Open Trade Terminal',
      link: '/trading/trade',
      icon: 'fa-solid fa-chart-line',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'View Order History',
      link: '/trading/history',
      icon: 'fa-solid fa-receipt',
      variant: 'secondary',
    },
  },
  400: {
    code: 400,
    title: 'Bad Request / Validation Error',
    message: 'The server could not process the submitted parameters due to invalid formatting or constraints.',
    description: 'Please review your input values (e.g. lot size, leverage, date bounds) and try again.',
    icon: 'fa-solid fa-circle-exclamation',
    colorClass: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    primaryAction: {
      label: 'Review Workstation',
      link: '/trading',
      icon: 'fa-solid fa-arrow-left',
      variant: 'primary',
    },
  },
  500: {
    code: 500,
    title: 'Internal Server Error',
    message: 'The backend API service encountered an unhandled exception while processing your transaction.',
    description: 'Our telemetry systems have captured this event. You can retry the operation or check system audit logs.',
    icon: 'fa-solid fa-server',
    colorClass: 'text-rose-500',
    badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    primaryAction: {
      label: 'Retry Action',
      icon: 'fa-solid fa-rotate-right',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'System Audit Logs',
      link: '/admin/audit-log',
      icon: 'fa-solid fa-list-check',
      variant: 'secondary',
    },
  },
  502: {
    code: 502,
    title: 'Bad Gateway',
    message: 'The reverse proxy or API gateway received an invalid response from upstream market microservices.',
    description: 'External price feeds or upstream microservices are momentarily restarting. Please refresh momentarily.',
    icon: 'fa-solid fa-network-wired',
    colorClass: 'text-rose-500',
    badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    primaryAction: {
      label: 'Retry Connection',
      icon: 'fa-solid fa-rotate',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Paper Trading Hub',
      link: '/trading',
      icon: 'fa-solid fa-chart-pie',
      variant: 'secondary',
    },
  },
  503: {
    code: 503,
    title: 'Service Unavailable / Maintenance',
    message: 'The trading exchange gateway or database engine is undergoing scheduled maintenance or temporary rate limiting.',
    description: 'Live price sync and order execution are paused. Your account balance and open positions remain securely preserved.',
    icon: 'fa-solid fa-screwdriver-wrench',
    colorClass: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    primaryAction: {
      label: 'Retry Connection',
      icon: 'fa-solid fa-rotate-right',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Outbox Telemetry',
      link: '/admin/outbox',
      icon: 'fa-solid fa-box-archive',
      variant: 'secondary',
    },
  },
  0: {
    code: 0,
    title: 'Network Disconnected / Gateway Offline',
    message: 'Unable to establish HTTP or WebSocket communication with the backend API service.',
    description: 'Verify your internet connectivity and ensure the local backend API server (port 5143) is running.',
    icon: 'fa-solid fa-wifi',
    colorClass: 'text-rose-500',
    badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    primaryAction: {
      label: 'Retry Connection',
      icon: 'fa-solid fa-rotate',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Check Terminal',
      link: '/trading',
      icon: 'fa-solid fa-house',
      variant: 'secondary',
    },
  },
};
