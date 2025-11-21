/**
 * Configuração de Monitoramento de Erros
 * Impacto Pro League v1.0
 * 
 * Este módulo configura o monitoramento de erros em produção.
 * Suporta múltiplos providers: Sentry, LogRocket, Datadog, etc.
 */

import { Request, Response, NextFunction } from 'express';

// Configuração do Sentry (recomendado)
// Para ativar, instale: pnpm add @sentry/node @sentry/profiling-node
// E descomente o código abaixo

/*
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

export function initSentry(app: Express.Application) {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
        new ProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });

    // RequestHandler cria um escopo separado para cada requisição
    app.use(Sentry.Handlers.requestHandler());
    
    // TracingHandler cria um span para cada requisição
    app.use(Sentry.Handlers.tracingHandler());

    console.log('[Monitoring] Sentry initialized');
  } else {
    console.warn('[Monitoring] SENTRY_DSN not configured, skipping Sentry initialization');
  }
}

export function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler();
}
*/

/**
 * Logger customizado para erros
 * Captura erros e envia para o sistema de monitoramento
 */
export function logError(error: Error, context?: Record<string, any>) {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  // Em produção, enviar para serviço de monitoramento
  if (process.env.NODE_ENV === 'production') {
    console.error('[Error]', JSON.stringify(errorLog));
    
    // Se Sentry estiver configurado, capturar erro
    // Sentry.captureException(error, { extra: context });
  } else {
    // Em desenvolvimento, log detalhado no console
    console.error('[Error]', error);
    if (context) {
      console.error('[Error Context]', context);
    }
  }
}

/**
 * Middleware de tratamento de erros
 * Captura erros não tratados e envia para monitoramento
 */
export function errorMonitoringMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Capturar contexto da requisição
  const context = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    user: (req as any).user?.id,
  };

  // Logar erro com contexto
  logError(err, context);

  // Responder com erro genérico em produção
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
    });
  } else {
    // Em desenvolvimento, retornar stack trace
    res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }
}

/**
 * Capturar erros não tratados
 */
export function setupGlobalErrorHandlers() {
  // Erros não capturados
  process.on('uncaughtException', (error: Error) => {
    console.error('[Uncaught Exception]', error);
    logError(error, { type: 'uncaughtException' });
    
    // Em produção, fazer graceful shutdown
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  // Promises rejeitadas não tratadas
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('[Unhandled Rejection]', reason);
    logError(new Error(String(reason)), { 
      type: 'unhandledRejection',
      promise: String(promise),
    });
  });

  console.log('[Monitoring] Global error handlers configured');
}

/**
 * Métricas de performance
 * Monitora tempo de resposta e uso de recursos
 */
export function performanceMonitoringMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  // Capturar quando a resposta terminar
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Logar requisições lentas (> 1s)
    if (duration > 1000) {
      console.warn('[Performance] Slow request:', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        status: res.statusCode,
      });
    }

    // Em produção, enviar métricas para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Exemplo: enviar para Datadog, New Relic, etc.
      // metrics.timing('http.request.duration', duration, {
      //   method: req.method,
      //   route: req.route?.path,
      //   status: res.statusCode,
      // });
    }
  });

  next();
}

/**
 * Health check endpoint
 * Verifica se o serviço está funcionando
 */
export function healthCheck(req: Request, res: Response) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
  };

  res.json(health);
}

/**
 * Configuração completa de monitoramento
 * Chame esta função no início do servidor
 */
export function setupMonitoring(app: any) {
  // 1. Configurar handlers globais
  setupGlobalErrorHandlers();

  // 2. Configurar Sentry (se disponível)
  // initSentry(app);

  // 3. Adicionar middleware de performance
  app.use(performanceMonitoringMiddleware);

  // 4. Health check endpoint
  app.get('/api/health', healthCheck);

  // 5. Middleware de erro (deve ser o último)
  // app.use(errorMonitoringMiddleware);
  // Se Sentry estiver ativo:
  // app.use(sentryErrorHandler());

  console.log('[Monitoring] Monitoring system configured');
}

// Exportar função de log para uso em outros módulos
export { logError as default };
