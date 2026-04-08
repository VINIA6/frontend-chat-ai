// ============================================================
// DEMO_MODE: quando ativo, todas as chamadas HTTP abaixo ficam
// dentro de blocos /* ... */ e são substituídas por operações
// de localStorage. Para reativar o backend real, defina
// DEMO_MODE = false em src/config/env.ts
// ============================================================

import type { Talk, Message, ChatRequest, ChatResponse } from '../types';
import { DEMO_MODE } from '../config/env';

// Importações axios – usadas apenas quando DEMO_MODE = false
import axios from 'axios';
import type { AxiosInstance } from 'axios';

// Chaves usadas no localStorage em modo demo
const DEMO_TALKS_KEY = 'demo-talks';
const DEMO_MESSAGES_PREFIX = 'demo-messages-';

class ChatService {
  private api: AxiosInstance;

  constructor() {
    // --------------------------------------------------------
    // Configuração real do axios (desabilitada em DEMO_MODE)
    // --------------------------------------------------------
    if (!DEMO_MODE) {
      let baseURL: string;
      if (import.meta.env.VITE_API_URL) {
        baseURL = import.meta.env.VITE_API_URL;
      } else if (import.meta.env.PROD) {
        baseURL = '/api';
      } else {
        baseURL = 'http://72.60.166.177:5001/api';
      }

      console.log('🌐 ChatService - URL do backend:', baseURL);

      this.api = axios.create({
        baseURL,
        timeout: 120000,
        headers: { 'Content-Type': 'application/json' },
      });

      this.setupInterceptors();
    } else {
      // Instância dummy para satisfazer o TypeScript no modo demo
      this.api = axios.create({ baseURL: 'http://localhost' });
      console.log('🎭 ChatService - MODO DEMO ativo (localStorage)');
    }
  }

  // ============================================================
  // Interceptores HTTP – apenas para o backend real
  // ============================================================
  private setupInterceptors() {
    /*
     * Request interceptor: injeta token JWT no cabeçalho Authorization
     */
    this.api.interceptors.request.use(
      (config) => {
        const authData = localStorage.getItem('auth-store');
        if (authData) {
          try {
            const parsed = JSON.parse(authData);
            const token = parsed?.state?.token;
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.warn('Error parsing auth store:', error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    /*
     * Response interceptor: redireciona para login em caso de 401
     */
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth-store');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ============================================================
  // getUserTalks
  // ============================================================
  async getUserTalks(): Promise<Talk[]> {
    if (DEMO_MODE) {
      await this.delay(300);
      return this.getDemoTalks();
    }

    /*
     * BACKEND REAL (desabilitado em DEMO_MODE):
     *
     * try {
     *   const response = await this.api.get<Talk[]>('/talk-user');
     *   if (!Array.isArray(response.data)) return [];
     *   return response.data;
     * } catch (error) {
     *   throw this.handleError(error);
     * }
     */

    return [];
  }

  // ============================================================
  // getMessagesByTalk
  // ============================================================
  async getMessagesByTalk(talkId: string): Promise<Message[]> {
    if (DEMO_MODE) {
      await this.delay(200);
      return this.getDemoMessages(talkId);
    }

    /*
     * BACKEND REAL (desabilitado em DEMO_MODE):
     *
     * try {
     *   const response = await this.api.get(`/messages-by-talk?talk_id=${talkId}`);
     *   return response.data.map(this.convertApiMessageToMessage);
     * } catch (error) {
     *   throw this.handleError(error);
     * }
     */

    return [];
  }

  // ============================================================
  // createNewTalk – cria conversa e retorna resposta do bot
  // ============================================================
  async createNewTalk(
    message: string
  ): Promise<{ talk: { talk_id: string; name: string; created_at: string }; messages: Message[] }> {
    if (DEMO_MODE) {
      return this.demoCreateNewTalk(message);
    }

    /*
     * BACKEND REAL (desabilitado em DEMO_MODE):
     *
     * try {
     *   const response = await this.retryOnTimeout(
     *     () => this.api.post('/talk', { message }),
     *     2,
     *     3000
     *   );
     *   const messages = response.data.messages.map(this.convertApiMessageToMessage);
     *   return { talk: response.data.talk, messages };
     * } catch (error) {
     *   throw this.handleError(error);
     * }
     */

    throw new Error('Backend desabilitado. Ative o DEMO_MODE ou configure o backend.');
  }

  // ============================================================
  // sendMessageToExistingTalk – envia mensagem e retorna histórico
  // ============================================================
  async sendMessageToExistingTalk(talkId: string, message: string): Promise<Message[]> {
    if (DEMO_MODE) {
      return this.demoSendMessageToExistingTalk(talkId, message);
    }

    /*
     * BACKEND REAL (desabilitado em DEMO_MODE):
     *
     * try {
     *   const response = await this.retryOnTimeout(
     *     () => this.api.post('/message', { talk_id: talkId, content: message, type: 'user' }),
     *     2,
     *     3000
     *   );
     *   return response.data.messages.map(this.convertApiMessageToMessage);
     * } catch (error) {
     *   throw this.handleError(error);
     * }
     */

    throw new Error('Backend desabilitado. Ative o DEMO_MODE ou configure o backend.');
  }

  // ============================================================
  // updateTalk – renomeia conversa
  // ============================================================
  async updateTalk(
    talkId: string,
    newName: string
  ): Promise<{ talk_id: string; name: string; updated_at: string }> {
    if (DEMO_MODE) {
      await this.delay(200);
      const talks = this.getDemoTalks();
      const now = new Date().toISOString();
      const updated = talks.map((t) =>
        t._id.$oid === talkId
          ? { ...t, name: newName, update_at: { $date: now } }
          : t
      );
      this.saveDemoTalks(updated);
      return { talk_id: talkId, name: newName, updated_at: now };
    }

    /*
     * BACKEND REAL (desabilitado em DEMO_MODE):
     *
     * try {
     *   const response = await this.api.put('/talk', { talk_id: talkId, name: newName });
     *   return response.data.talk;
     * } catch (error) {
     *   throw this.handleError(error);
     * }
     */

    throw new Error('Backend desabilitado. Ative o DEMO_MODE ou configure o backend.');
  }

  // ============================================================
  // deleteTalk – remove conversa
  // ============================================================
  async deleteTalk(talkId: string): Promise<void> {
    if (DEMO_MODE) {
      await this.delay(200);
      const talks = this.getDemoTalks().filter((t) => t._id.$oid !== talkId);
      this.saveDemoTalks(talks);
      localStorage.removeItem(`${DEMO_MESSAGES_PREFIX}${talkId}`);
      return;
    }

    /*
     * BACKEND REAL (desabilitado em DEMO_MODE):
     *
     * try {
     *   await this.api.delete(`/talk?talk_id=${talkId}`);
     * } catch (error) {
     *   throw this.handleError(error);
     * }
     */

    throw new Error('Backend desabilitado. Ative o DEMO_MODE ou configure o backend.');
  }

  // ============================================================
  // sendMessage – chat simples sem streaming (legado)
  // ============================================================
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    if (DEMO_MODE) {
      await this.delay(800);
      return {
        message: this.generateMockAIResponse(request.message),
        conversationId: request.conversationId ?? crypto.randomUUID(),
        timestamp: Date.now(),
      };
    }

    /*
     * BACKEND REAL (desabilitado em DEMO_MODE):
     *
     * try {
     *   const response = await this.api.post<ChatResponse>('/chat', request);
     *   return response.data;
     * } catch (error) {
     *   throw this.handleError(error);
     * }
     */

    throw new Error('Backend desabilitado. Ative o DEMO_MODE ou configure o backend.');
  }

  // ============================================================
  // sendMessageStream – streaming SSE
  // ============================================================
  async sendMessageStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: (response: ChatResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    if (DEMO_MODE) {
      await this.streamMockResponse(request, onChunk, onComplete);
      return;
    }

    /*
     * BACKEND REAL (desabilitado em DEMO_MODE):
     *
     * try {
     *   const authData = localStorage.getItem('auth-store');
     *   let token = '';
     *   if (authData) {
     *     try {
     *       const parsed = JSON.parse(authData);
     *       token = parsed?.state?.token || '';
     *     } catch { }
     *   }
     *
     *   const response = await fetch(`${this.api.defaults.baseURL}/chat/stream`, {
     *     method: 'POST',
     *     headers: {
     *       'Content-Type': 'application/json',
     *       ...(token && { Authorization: `Bearer ${token}` }),
     *     },
     *     body: JSON.stringify(request),
     *   });
     *
     *   if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
     *
     *   const reader = response.body?.getReader();
     *   const decoder = new TextDecoder();
     *   if (!reader) throw new Error('Response body is not readable');
     *
     *   let fullResponse = '';
     *   while (true) {
     *     const { done, value } = await reader.read();
     *     if (done) break;
     *     const chunk = decoder.decode(value);
     *     const lines = chunk.split('\n');
     *     for (const line of lines) {
     *       if (line.startsWith('data: ')) {
     *         const data = line.slice(6);
     *         if (data === '[DONE]') {
     *           onComplete({ message: fullResponse, conversationId: request.conversationId || crypto.randomUUID(), timestamp: Date.now() });
     *           return;
     *         }
     *         try {
     *           const parsed = JSON.parse(data);
     *           if (parsed.content) { fullResponse += parsed.content; onChunk(parsed.content); }
     *         } catch { }
     *       }
     *     }
     *   }
     * } catch (error) {
     *   onError(this.handleError(error));
     * }
     */

    onError(new Error('Backend desabilitado. Ative o DEMO_MODE ou configure o backend.'));
  }

  // ============================================================
  // Helpers de retry (backend real)
  // ============================================================
  /*
   * private async retryOnTimeout<T>(fn: () => Promise<T>, maxRetries = 2, retryDelay = 2000): Promise<T> {
   *   let lastError: Error | null = null;
   *   for (let attempt = 0; attempt <= maxRetries; attempt++) {
   *     try { return await fn(); }
   *     catch (error) {
   *       lastError = error as Error;
   *       if (axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || error.message.includes('timeout')) && attempt < maxRetries) {
   *         await new Promise(resolve => setTimeout(resolve, retryDelay));
   *         continue;
   *       }
   *       throw error;
   *     }
   *   }
   *   throw lastError;
   * }
   */

  // ============================================================
  // DEMO MODE: helpers de localStorage
  // ============================================================

  private getDemoTalks(): Talk[] {
    const raw = localStorage.getItem(DEMO_TALKS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Talk[];
    } catch {
      return [];
    }
  }

  private saveDemoTalks(talks: Talk[]): void {
    localStorage.setItem(DEMO_TALKS_KEY, JSON.stringify(talks));
  }

  private getDemoMessages(talkId: string): Message[] {
    const raw = localStorage.getItem(`${DEMO_MESSAGES_PREFIX}${talkId}`);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as Array<Omit<Message, 'timestamp'> & { timestamp: string }>;
      return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
    } catch {
      return [];
    }
  }

  private saveDemoMessages(talkId: string, messages: Message[]): void {
    localStorage.setItem(`${DEMO_MESSAGES_PREFIX}${talkId}`, JSON.stringify(messages));
  }

  private makeId(): string {
    return `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================================
  // DEMO MODE: criação de nova conversa no localStorage
  // ============================================================
  private async demoCreateNewTalk(
    message: string
  ): Promise<{ talk: { talk_id: string; name: string; created_at: string }; messages: Message[] }> {
    await this.delay(900);

    const talkId = this.makeId();
    const now = new Date();
    const talkName = message.length > 50 ? message.substring(0, 47) + '...' : message;

    const userMessage: Message = {
      id: this.makeId(),
      content: message,
      type: 'user',
      timestamp: now,
    };

    const botMessage: Message = {
      id: this.makeId(),
      content: this.generateMockAIResponse(message),
      type: 'bot',
      timestamp: new Date(now.getTime() + 100),
    };

    const messages = [userMessage, botMessage];

    // Salvar mensagens e talk no localStorage
    this.saveDemoMessages(talkId, messages);

    const newTalk: Talk = {
      _id: { $oid: talkId },
      name: talkName,
      create_at: { $date: now.toISOString() },
      update_at: { $date: now.toISOString() },
      user_id: { $oid: 'demo-user' },
      is_deleted: false,
    };
    const talks = this.getDemoTalks();
    this.saveDemoTalks([newTalk, ...talks]);

    return {
      talk: {
        talk_id: talkId,
        name: talkName,
        created_at: now.toISOString(),
      },
      messages,
    };
  }

  // ============================================================
  // DEMO MODE: envio de mensagem para conversa existente
  // ============================================================
  private async demoSendMessageToExistingTalk(talkId: string, message: string): Promise<Message[]> {
    await this.delay(900);

    const existing = this.getDemoMessages(talkId);

    const userMessage: Message = {
      id: this.makeId(),
      content: message,
      type: 'user',
      timestamp: new Date(),
    };

    const botMessage: Message = {
      id: this.makeId(),
      content: this.generateMockAIResponse(message),
      type: 'bot',
      timestamp: new Date(Date.now() + 100),
    };

    const updated = [...existing, userMessage, botMessage];
    this.saveDemoMessages(talkId, updated);

    // Atualizar update_at do talk
    const talks = this.getDemoTalks().map((t) =>
      t._id.$oid === talkId
        ? { ...t, update_at: { $date: new Date().toISOString() } }
        : t
    );
    this.saveDemoTalks(talks);

    return updated;
  }

  // ============================================================
  // DEMO MODE: streaming simulado (exibe resposta letra a letra)
  // ============================================================
  private async streamMockResponse(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: (response: ChatResponse) => void
  ): Promise<void> {
    const fullResponse = this.generateMockAIResponse(request.message);
    const conversationId = request.conversationId ?? crypto.randomUUID();

    // Simular digitação chunk a chunk
    const words = fullResponse.split(' ');
    for (const word of words) {
      await this.delay(40 + Math.random() * 30);
      onChunk(word + ' ');
    }

    onComplete({ message: fullResponse, conversationId, timestamp: Date.now() });
  }

  // ============================================================
  // DEMO MODE: gerador de respostas contextuais
  // ============================================================
  private generateMockAIResponse(message: string): string {
    const msg = message.toLowerCase();

    if (
      msg.includes('olá') ||
      msg.includes('oi') ||
      msg.includes('bom dia') ||
      msg.includes('boa tarde') ||
      msg.includes('boa noite') ||
      msg.includes('hello')
    ) {
      return (
        'Olá! Sou o assistente IA do Observatório da Indústria. 👋\n\n' +
        'Posso ajudá-lo com:\n' +
        '• Consultas sobre dados de empresas e clientes\n' +
        '• Análises de vendas e desempenho comercial\n' +
        '• Integração de dados ERP/CRM\n' +
        '• Geração de relatórios personalizados\n\n' +
        'Como posso auxiliá-lo hoje?'
      );
    }

    if (msg.includes('empresa') || msg.includes('cliente') || msg.includes('cnpj')) {
      return (
        'Para consultar dados de empresas clientes, posso acessar informações consolidadas do ERP, CRM e planilhas comerciais.\n\n' +
        '**Opções disponíveis:**\n' +
        '• Busca por CNPJ ou razão social\n' +
        '• Filtro por segmento industrial\n' +
        '• Histórico de relacionamento\n' +
        '• Dados de contato e localização\n\n' +
        'Qual empresa você gostaria de consultar?'
      );
    }

    if (
      msg.includes('venda') ||
      msg.includes('faturamento') ||
      msg.includes('receita') ||
      msg.includes('comercial')
    ) {
      return (
        'Posso ajudar com análises de vendas consolidadas! 📊\n\n' +
        '**Dados disponíveis:**\n' +
        '• Faturamento por período (mensal/trimestral/anual)\n' +
        '• Performance por analista e equipe\n' +
        '• Oportunidades abertas no CRM\n' +
        '• Metas vs. realizado\n' +
        '• Segmentação por setor industrial\n\n' +
        'Que tipo de análise você precisa?'
      );
    }

    if (
      msg.includes('erp') ||
      msg.includes('crm') ||
      msg.includes('integr') ||
      msg.includes('sistema')
    ) {
      return (
        'A integração entre os sistemas é uma das minhas especialidades! ⚙️\n\n' +
        '**Sistemas conectados:**\n' +
        '• **ERP**: Dados de faturamento e estoque\n' +
        '• **CRM**: Gestão de relacionamento e oportunidades\n' +
        '• **Planilhas**: Informações de campo dos analistas\n\n' +
        'Com essa integração elimino retrabalho e garanto dados consistentes. O que você precisa integrar?'
      );
    }

    if (
      msg.includes('relatório') ||
      msg.includes('relatorio') ||
      msg.includes('report') ||
      msg.includes('exportar')
    ) {
      return (
        'Posso gerar relatórios personalizados para você! 📋\n\n' +
        '**Tipos disponíveis:**\n' +
        '• Relatório de clientes ativos/inativos\n' +
        '• Análise de desempenho comercial\n' +
        '• Dashboard executivo consolidado\n' +
        '• Relatório de oportunidades CRM\n\n' +
        '**Formatos de saída:** PDF, Excel, Dashboard interativo\n\n' +
        'Que tipo de relatório você precisa?'
      );
    }

    if (
      msg.includes('mercado') ||
      msg.includes('setor') ||
      msg.includes('indústria') ||
      msg.includes('industria')
    ) {
      return (
        'Posso fornecer análises de inteligência de mercado! 🏭\n\n' +
        '**Informações disponíveis:**\n' +
        '• Tendências por setor industrial\n' +
        '• Mapeamento de empresas por região (CE, NE, Brasil)\n' +
        '• Dados do Observatório da Indústria FIEC\n' +
        '• Indicadores econômicos setoriais\n\n' +
        'Qual setor ou região você deseja analisar?'
      );
    }

    if (
      msg.includes('ajuda') ||
      msg.includes('help') ||
      msg.includes('o que você') ||
      msg.includes('o que pode')
    ) {
      return (
        'Sou o Assistente IA do Observatório da Indústria! 🤖\n\n' +
        '**Minhas capacidades:**\n\n' +
        '1. **Consulta de dados** – Empresas, clientes, contatos\n' +
        '2. **Análise comercial** – Vendas, metas, desempenho\n' +
        '3. **Integração de sistemas** – ERP, CRM, planilhas\n' +
        '4. **Geração de relatórios** – PDF, Excel, dashboards\n' +
        '5. **Inteligência de mercado** – Tendências e análises setoriais\n\n' +
        'Digite sua pergunta e eu responderei!'
      );
    }

    // Resposta genérica para mensagens não reconhecidas
    const generic = [
      'Entendi sua solicitação! Estou processando as informações disponíveis nos sistemas integrados.\n\n' +
        '> 🎭 *Modo demonstração ativo. Em produção, esta consulta seria processada pelo agente de IA conectado ao ERP, CRM e demais sistemas do Observatório da Indústria.*',
      'Boa pergunta! Com base nos dados do Observatório da Indústria, vou analisar essa questão para você.\n\n' +
        '> 🎭 *Modo demonstração – dados reais disponíveis após conexão com o backend.*',
      'Recebi sua mensagem. Para uma análise completa, consultarei os sistemas integrados.\n\n' +
        '> 🎭 *Demonstração local – respostas em tempo real após ativar o backend.*',
    ];

    return generic[Math.floor(Math.random() * generic.length)];
  }

  // ============================================================
  // Tratamento de erros HTTP – descomente ao definir DEMO_MODE = false
  // ============================================================
  /*
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes('Timeout ao conectar com n8n')) {
        return new Error('O sistema está demorando mais que o esperado. Tente novamente.');
      }
      if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
        return new Error('O servidor demorou muito para responder. Tente novamente em instantes.');
      }
      return new Error(errorMessage);
    }
    return error instanceof Error ? error : new Error('Erro desconhecido ao processar sua mensagem');
  }
  */
}

export const chatService = new ChatService();
