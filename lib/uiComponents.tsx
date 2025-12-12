/**
 * Componente de Encabezado Estandarizado para Módulos CRUD
 */
import Link from 'next/link';

interface ModuleHeaderProps {
  title: string;
  subtitle: string;
  onNewClick?: () => void;
  newButtonText?: string;
  backUrl?: string;
}

export function ModuleHeader({ 
  title, 
  subtitle, 
  onNewClick, 
  newButtonText = '+ Nuevo',
  backUrl = '/dashboard' 
}: ModuleHeaderProps) {
  return (
    <div className="section-header">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-3">
          <Link href={backUrl} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
            ← Volver
          </Link>
          {onNewClick && (
            <button onClick={onNewClick} className="btn-primary">
              {newButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Tarjeta de Estadística Estandarizada
 */
interface StatCardProps {
  label: string;
  value: number | string;
  className?: string;
}

export function StatCard({ label, value, className = '' }: StatCardProps) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

/**
 * Grid de Estadísticas
 */
interface StatsGridProps {
  stats: Array<{ label: string; value: number | string }>;
  columns?: number;
}

export function StatsGrid({ stats, columns = 5 }: StatsGridProps) {
  return (
    <div className={`grid grid-cols-${columns} gap-4 mb-6`}>
      {stats.map((stat, index) => (
        <StatCard key={index} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}

/**
 * Badge de Estado Estandarizado
 */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const variantClass = `badge-${variant}`;
  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}

/**
 * Formulario Modal Estandarizado
 */
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function FormModal({ isOpen, onClose, title, children }: FormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Botones de Formulario Estandarizados
 */
interface FormButtonsProps {
  onSubmit?: () => void;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
  isEdit?: boolean;
  loading?: boolean;
}

export function FormButtons({ 
  onCancel, 
  submitText, 
  cancelText = 'Cancelar', 
  isEdit = false,
  loading = false
}: FormButtonsProps) {
  const defaultSubmitText = isEdit ? 'Actualizar' : 'Guardar';
  
  return (
    <div className="flex gap-4 pt-4">
      <button 
        type="submit" 
        className="flex-1 btn-primary"
        disabled={loading}
      >
        {loading ? 'Guardando...' : (submitText || defaultSubmitText)}
      </button>
      <button 
        type="button" 
        onClick={onCancel} 
        className="flex-1 btn-secondary"
      >
        {cancelText}
      </button>
    </div>
  );
}

/**
 * Tabla Vacía (Empty State)
 */
interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No hay registros' }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-gray-500">
      {message}
    </div>
  );
}

/**
 * Filtro Simple de Select
 */
interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

export function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <div className="flex-1">
      <label className="form-label">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="form-select"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Panel de Filtros
 */
interface FilterPanelProps {
  children: React.ReactNode;
}

export function FilterPanel({ children }: FilterPanelProps) {
  return (
    <div className="card mb-4">
      <div className="flex gap-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Campo de Formulario Estandarizado
 */
interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required = false, children, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

/**
 * Botones de Acción en Tabla
 */
interface TableActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  editText?: string;
  deleteText?: string;
}

export function TableActions({ 
  onEdit, 
  onDelete, 
  editText = 'Editar', 
  deleteText = 'Eliminar' 
}: TableActionsProps) {
  return (
    <td className="whitespace-nowrap">
      <button
        onClick={onEdit}
        className="text-gray-700 hover:text-gray-900 font-medium mr-3"
      >
        {editText}
      </button>
      <button
        onClick={onDelete}
        className="text-red-600 hover:text-red-900 font-medium"
      >
        {deleteText}
      </button>
    </td>
  );
}
