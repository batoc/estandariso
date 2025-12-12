// Sistema de Diseño Estandarizado ISO 9001
// Paleta de colores profesional para gestión de calidad

export const colors = {
  // Primarios - Azul corporativo
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Secundarios - Slate para fondos y texto
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Estados - Semáforo profesional
  success: {
    light: '#D1FAE5',
    main: '#059669',
    dark: '#047857',
    text: '#065F46',
  },
  
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#D97706',
    text: '#92400E',
  },
  
  error: {
    light: '#FEE2E2',
    main: '#DC2626',
    dark: '#B91C1C',
    text: '#991B1B',
  },
  
  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#2563EB',
    text: '#1E40AF',
  },
  
  // Neutrales
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },
};

// Clases CSS reutilizables
export const designClasses = {
  // Cards
  card: {
    base: 'bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200',
    header: 'px-6 py-4 border-b border-slate-200 bg-slate-50',
    body: 'p-6',
    footer: 'px-6 py-4 border-t border-slate-200 bg-slate-50',
  },
  
  // Badges
  badge: {
    base: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-300',
  },
  
  // Botones
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors duration-200',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors duration-200',
  },
  
  // Inputs
  input: {
    base: 'w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all',
    label: 'block text-sm font-medium text-slate-700 mb-1.5',
    error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
  },
  
  // Tablas
  table: {
    container: 'overflow-x-auto rounded-lg border border-slate-200',
    base: 'min-w-full divide-y divide-slate-200',
    header: 'bg-slate-50',
    headerCell: 'px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider',
    body: 'bg-white divide-y divide-slate-100',
    row: 'hover:bg-slate-50 transition-colors',
    cell: 'px-6 py-4 text-sm text-slate-900',
  },
  
  // Stats/Métricas
  stat: {
    container: 'bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border border-slate-200',
    value: 'text-3xl font-bold text-slate-900',
    label: 'text-sm font-medium text-slate-600 mt-1',
    change: {
      positive: 'text-emerald-600 text-sm font-semibold',
      negative: 'text-red-600 text-sm font-semibold',
      neutral: 'text-slate-600 text-sm font-semibold',
    },
  },
  
  // Títulos
  heading: {
    h1: 'text-3xl font-bold text-slate-900',
    h2: 'text-2xl font-bold text-slate-800',
    h3: 'text-xl font-semibold text-slate-800',
    h4: 'text-lg font-semibold text-slate-700',
  },
};

// Iconos SVG estandarizados
export const icons = {
  auditorias: (className = 'w-6 h-6') => (
    `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>`
  ),
  indicadores: (className = 'w-6 h-6') => (
    `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>`
  ),
  noConformidades: (className = 'w-6 h-6') => (
    `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>`
  ),
};

// Utilidades de formato
export const formatters = {
  percentage: (value: number) => `${value.toFixed(1)}%`,
  currency: (value: number) => `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
  date: (date: string) => new Date(date).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }),
  dateTime: (date: string) => new Date(date).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }),
};

// Configuración de animaciones
export const animations = {
  fadeIn: 'animate-in fade-in duration-200',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  slideDown: 'animate-in slide-in-from-top-4 duration-300',
};
