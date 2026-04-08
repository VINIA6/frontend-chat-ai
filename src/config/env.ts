// ============================================================
// DEMO_MODE: quando true, todas as chamadas ao backend são
// substituídas por dados locais (localStorage). Não é necessário
// servidor rodando. Para reativar o backend, altere para false.
// ============================================================
export const DEMO_MODE = true;

// Detectar ambiente e usar URL apropriada
const getApiUrl = () => {
  // Se há variável de ambiente, usar ela
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Se está em produção (Vercel), usar proxy relativo
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // Em desenvolvimento local, usar URL direta do backend
  return 'http://72.60.166.177:5001/api';
};

export const config = {
  // API Configuration
  apiUrl: getApiUrl(),
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'ChatBot FIEC',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Features
  enableStreaming: import.meta.env.VITE_ENABLE_STREAMING === 'true',
  enableFileUpload: import.meta.env.VITE_ENABLE_FILE_UPLOAD !== 'false',
  enableVoiceInput: import.meta.env.VITE_ENABLE_VOICE_INPUT !== 'false',
  
  // Limits
  maxMessageLength: Number(import.meta.env.VITE_MAX_MESSAGE_LENGTH) || 4000,
  maxFileSize: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
} as const;
