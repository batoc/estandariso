'use client';

import { useState, useEffect } from 'react';

interface OneDriveAuthProps {
  onTokenReceived: (token: string) => void;
  onLogout: () => void;
}

export default function OneDriveAuth({ onTokenReceived, onLogout }: OneDriveAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si ya hay un token almacenado
    const token = localStorage.getItem('onedrive_token');
    const email = localStorage.getItem('onedrive_user_email');
    
    if (token && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
      onTokenReceived(token);
    }
    setIsLoading(false);

    // Manejar el callback de autenticación
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const message = urlParams.get('message');
    
    if (authStatus === 'success' && message) {
      try {
        const data = JSON.parse(decodeURIComponent(message));
        if (data.token && data.email) {
          localStorage.setItem('onedrive_token', data.token);
          localStorage.setItem('onedrive_user_email', data.email);
          setIsAuthenticated(true);
          setUserEmail(data.email);
          onTokenReceived(data.token);
          
          // Limpiar los parámetros de la URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      } catch (error) {
        console.error('Error procesando autenticación de OneDrive:', error);
      }
    } else if (authStatus === 'error') {
      console.error('Error de autenticación de OneDrive:', message);
      alert(`Error al conectar con OneDrive: ${message}\n\nNota: Si el error es "Se necesita la aprobación del administrador", contacta a tu administrador de Microsoft 365 para que apruebe el acceso a OneDrive para esta aplicación.`);
    }
  }, [onTokenReceived]);

  const handleLogin = () => {
    window.location.href = '/api/auth/onedrive/login';
  };

  const handleLogout = () => {
    localStorage.removeItem('onedrive_token');
    localStorage.removeItem('onedrive_user_email');
    setIsAuthenticated(false);
    setUserEmail('');
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-blue-700">Verificando conexión...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 1.5L1.5 7.125V16.875L13.5 22.5L22.5 18V6L13.5 1.5Z M12 10.5V19.875L3 15.375V9L12 10.5Z M13.5 3.375L20.625 6.75L13.5 10.125L6.375 6.75L13.5 3.375Z"/>
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">OneDrive conectado</p>
              <p className="text-xs text-blue-700">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded transition-colors"
          >
            Desconectar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.5 1.5L1.5 7.125V16.875L13.5 22.5L22.5 18V6L13.5 1.5Z M12 10.5V19.875L3 15.375V9L12 10.5Z M13.5 3.375L20.625 6.75L13.5 10.125L6.375 6.75L13.5 3.375Z"/>
        </svg>
        <h3 className="text-sm font-medium text-gray-900 mb-1">OneDrive no conectado</h3>
        <p className="text-xs text-gray-500 mb-3">
          Conecta tu cuenta de OneDrive para almacenar archivos
        </p>
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Conectar OneDrive
        </button>
        <p className="text-xs text-amber-600 mt-2">
          ⚠️ Nota: Requiere aprobación del administrador de Microsoft 365
        </p>
      </div>
    </div>
  );
}