// lib/constants/colors.ts - Nueva paleta Pololitos 2025 🎨
export const Colors = {
  // Nueva paleta principal
  primary: '#4949E9',        // Azul principal (nuevo)
  primaryLight: '#7070ED',   // Azul claro (variante)
  primaryMuted: '#B8B8F4',   // Azul muy claro (variante)
  primaryHover: '#3838D6',   // Azul hover (más oscuro)
  
  secondary: '#DCF343',      // Verde limón (nuevo secundario)
  secondaryHover: '#C9E635', // Verde hover (más oscuro)
  
  // Colores complementarios
  purple: '#9C7BF6',        // Morado complementario
  purpleLight: '#B899F8',   // Morado claro
  
  yellow: '#F9DD2E',        // Amarillo complementario
  yellowLight: '#FAE657',   // Amarillo claro
  
  red: '#EF4A53',           // Rojo complementario
  redLight: '#F26B72',      // Rojo claro
  
  // Estados usando la nueva paleta
  success: '#DCF343',       // Verde limón para éxito
  error: '#EF4A53',         // Rojo complementario para errores
  warning: '#F9DD2E',       // Amarillo complementario para advertencias
  
  // Grises y neutros (mantener)
  dark: '#141518',          // Negro principal
  gray: '#626D77',          // Gris
  lightGray: '#D8DCE2',     // Gris claro
  light: '#F9FAFB',         // Fondo claro
  white: '#FFFFFF',         // Blanco
  black: '#000000',         // Negro
  
  // Texto
  textPrimary: '#141518',   // Texto principal (dark)
  textSecondary: '#626D77', // Texto secundario (gray)
  
  // Específicos para admin con nueva paleta
  sidebar: '#1F2937',         // Fondo sidebar (mantener neutro)
  sidebarActive: '#4949E9',   // Item activo sidebar (azul principal)
  cardBg: '#FFFFFF',          // Fondo tarjetas
  border: '#E5E7EB',          // Bordes
} as const;

// lib/constants/admin.ts - Configuraciones admin
export const ADMIN_CONFIG = {
  // Paginación
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Dashboard refresh
  DASHBOARD_REFRESH_INTERVAL: 30000, // 30 segundos
  
  // Tickets con nueva paleta
  TICKET_STATUSES: [
    { value: 'NEW', label: 'Nuevo', color: Colors.yellow },
    { value: 'OPEN', label: 'Abierto', color: Colors.primary },
    { value: 'IN_PROGRESS', label: 'En Progreso', color: Colors.purple },
    { value: 'RESOLVED', label: 'Resuelto', color: Colors.success },
    { value: 'CLOSED', label: 'Cerrado', color: Colors.gray },
  ],
  
  TICKET_PRIORITIES: [
    { value: 'LOW', label: 'Baja', color: Colors.success },
    { value: 'MEDIUM', label: 'Media', color: Colors.yellow },
    { value: 'HIGH', label: 'Alta', color: Colors.warning },
    { value: 'URGENT', label: 'Urgente', color: Colors.red },
  ],
  
  // Verificaciones con nueva paleta
  VERIFICATION_STATUSES: [
    { value: 'PENDING', label: 'Pendiente', color: Colors.yellow },
    { value: 'APPROVED', label: 'Aprobado', color: Colors.success },
    { value: 'REJECTED', label: 'Rechazado', color: Colors.error },
  ],
  
  // Navegación sidebar
  NAVIGATION_ITEMS: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      label: 'Usuarios',
      href: '/users',
      icon: 'Users',
    },
    {
      label: 'Verificaciones',
      href: '/verification',
      icon: 'Shield',
    },
    {
      label: 'Soporte',
      href: '/support',
      icon: 'MessageSquare',
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: 'BarChart3',
    },
    {
      label: 'Configuración',
      href: '/settings',
      icon: 'Settings',
    },
  ],
} as const;

// lib/constants/api.ts - Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  
  // Admin
  DASHBOARD_STATS: '/api/admin/dashboard/stats',
  USERS: '/api/admin/users',
  
  // Support
  TICKETS: '/api/support/admin/tickets',
  
  // Verification
  VERIFICATION_DOCS: '/api/verification/admin/documents',
} as const;