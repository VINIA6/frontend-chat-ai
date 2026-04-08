import type { LoginCredentials, LoginResponse, User } from '../types';
import { DEMO_MODE } from '../config/env';

// ============================================================
// DEMO_MODE: importações axios comentadas - não usadas no demo
// Para reativar o backend, remova o bloco de comentário abaixo
// e defina DEMO_MODE = false em src/config/env.ts
// ============================================================

/*
import axios, { AxiosError } from 'axios';

interface ApiLoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    cargo: string;
    setor: string;
  };
}
*/

class AuthService {
  private readonly baseURL: string;

  // timeout e validateCredentials pertencem ao fluxo do backend real.
  // Descomente ao definir DEMO_MODE = false.
  /*
  private readonly timeout = 120000;
  */

  constructor() {
    // Detectar ambiente e usar URL apropriada
    if (import.meta.env.VITE_API_URL) {
      this.baseURL = import.meta.env.VITE_API_URL;
    } else if (import.meta.env.PROD) {
      this.baseURL = '/api';
    } else {
      this.baseURL = 'http://72.60.166.177:5001/api';
    }

    if (DEMO_MODE) {
      console.log('🎭 AuthService - MODO DEMO ativo (sem backend)');
    } else {
      console.log('🌐 AuthService - URL do backend:', this.baseURL);
      console.log('🌐 AuthService - Ambiente:', import.meta.env.MODE);
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (DEMO_MODE) {
      return this.mockLogin(credentials);
    }

    // ============================================================
    // BACKEND LOGIN (desabilitado quando DEMO_MODE = true)
    // Para reativar: defina DEMO_MODE = false em src/config/env.ts
    // ============================================================
    /*
    console.log('🔧 AuthService - Iniciando login com:', {
      email: credentials.email,
      hasPassword: !!credentials.password,
      rememberMe: credentials.rememberMe
    });

    this.validateCredentials(credentials);
    console.log('✅ AuthService - Credenciais validadas');

    try {
      const requestData = {
        username: credentials.email,
        password: credentials.password,
      };

      const response = await axios.post(
        `${this.baseURL}/login`,
        requestData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: this.timeout,
        }
      );

      return this.transformApiResponse(response.data, credentials.email);

    } catch (error) {
      console.error('❌ AuthService - Erro no login:', error);
      throw this.handleError(error);
    }
    */

    throw new Error('Backend desabilitado. Ative o DEMO_MODE ou configure o backend.');
  }

  // ============================================================
  // DEMO MODE: login mock sem chamada ao servidor
  // Aceita qualquer email/senha. Usuários pré-definidos recebem
  // perfis específicos; outros recebem perfil "user" genérico.
  // ============================================================
  private async mockLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    if (!credentials.email?.trim() || !credentials.password?.trim()) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 700));

    const demoProfiles: Record<string, { name: string; role: 'admin' | 'analyst' | 'user'; department: string }> = {
      'admin@observatorio.fiec.org.br': {
        name: 'Administrador FIEC',
        role: 'admin',
        department: 'TI',
      },
      'maria.silva@observatorio.fiec.org.br': {
        name: 'Maria Silva',
        role: 'analyst',
        department: 'Análise de Dados',
      },
      'joao.santos@empresa.com.br': {
        name: 'João Santos',
        role: 'user',
        department: 'Comercial',
      },
    };

    const profile = demoProfiles[credentials.email.toLowerCase()];
    const displayName = profile?.name ?? credentials.email.split('@')[0];

    const user: User = {
      id: `demo-${Date.now()}`,
      name: displayName,
      email: credentials.email,
      role: profile?.role ?? 'user',
      company: 'FIEC',
      department: profile?.department ?? 'Observatório da Indústria',
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    console.log('✅ AuthService Demo - Login realizado como:', user.name);

    return {
      user,
      token: `demo-token-${Date.now()}`,
      expiresIn: 24 * 60 * 60 * 1000, // 24 horas
    };
  }

  // Métodos de validação do backend real – descomente ao definir DEMO_MODE = false.
  /*
  private validateCredentials(credentials: LoginCredentials): void {
    if (!credentials.email?.trim()) throw new Error('Email é obrigatório');
    if (!credentials.password?.trim()) throw new Error('Senha é obrigatória');
    if (!this.isValidEmail(credentials.email)) throw new Error('Formato de email inválido');
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  */

  async logout(): Promise<void> {
    // Limpeza local já é feita no authStore
  }

  isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }

  getTokenExpiryTime(expiresIn: number): number {
    return Date.now() + expiresIn;
  }
}

export const authService = new AuthService();
