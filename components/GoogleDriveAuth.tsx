'use client';

import { useState, useEffect } from 'react';

interface GoogleDriveAuthProps {
  onAuthenticated: (token: string, userName: string, carpetaId?: string) => void;
}

export default function GoogleDriveAuth({ onAuthenticated }: GoogleDriveAuthProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>('');

  // Verificar si ya está autenticado al cargar
  useEffect(() => {
    const storedToken = localStorage.getItem('drive_token');
    const storedUser = localStorage.getItem('drive_user');
    const storedCarpetaId = localStorage.getItem('drive_carpeta_id');
    
    if (storedToken && storedUser) {
      setIsAuthenticated(true);
      setUserName(storedUser);
      onAuthenticated(storedToken, storedUser, storedCarpetaId || undefined);
    }

    // Manejar callback de OAuth
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');
    const callbackToken = params.get('token');
    const callbackUser = params.get('user');
    const provider = params.get('provider');
    const errorMsg = params.get('message');

    if (authStatus === 'success' && callbackToken && callbackUser && provider === 'google') {
      // Guardar en localStorage
      localStorage.setItem('drive_token', callbackToken);
      localStorage.setItem('drive_user', callbackUser);
      
      setIsAuthenticated(true);
      setUserName(callbackUser);
      onAuthenticated(callbackToken, callbackUser);

      // Limpiar URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (authStatus === 'error') {
      setError(errorMsg || 'Error en la autenticación');
    }
  }, [onAuthenticated]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/google/login');
      const data = await response.json();

      if (data.authUrl) {
        // Redirigir a Google para autenticación
        window.location.href = data.authUrl;
      } else {
        throw new Error('No se pudo obtener URL de autenticación');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('drive_token');
    localStorage.removeItem('drive_user');
    localStorage.removeItem('drive_carpeta_id');
    setIsAuthenticated(false);
    setUserName('');
  };

  if (isAuthenticated) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-700">
                Conectado a Google Drive
              </p>
              <p className="text-sm text-green-600">
                Usuario: {userName}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-green-700 hover:text-green-900 underline"
          >
            Desconectar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">☁️</span>
          <div>
            <p className="font-semibold text-blue-800">
              Conecta con Google Drive
            </p>
            <p className="text-sm text-blue-600">
              Necesario para guardar archivos adjuntos
            </p>
          </div>
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? 'Conectando...' : '🔗 Conectar Google Drive'}
        </button>
      </div>
    </div>
  );
}
