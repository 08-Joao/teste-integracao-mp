import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger, // Importe o Logger
  } from '@nestjs/common';
  import { HttpAdapterHost } from '@nestjs/core';
  
  @Catch() // O decorator @Catch() sem argumentos captura todas as exceções.
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name); // Crie uma instância do Logger
  
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  
    catch(exception: unknown, host: ArgumentsHost): void {
      const { httpAdapter } = this.httpAdapterHost;
      const ctx = host.switchToHttp();
      const request = ctx.getRequest();
  
      // Determina o status HTTP. Se for um erro conhecido (HttpException), usa o status dele. Senão, padrão para 500.
      const httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
          
      // Log detalhado do erro no console para debugging
      // Não loga erros 401 (Unauthorized) pois são esperados quando o usuário não está autenticado
      if (httpStatus !== HttpStatus.UNAUTHORIZED) {
        this.logger.error(
            `HTTP Status: ${httpStatus} Error Message: ${JSON.stringify(exception)}`,
            `Path: ${request.url}`,
        );
      }
  
      // Estrutura da resposta de erro que será enviada ao cliente
      const responseBody = {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(request),
        message: (exception instanceof HttpException) ? exception.getResponse() : 'Internal server error',
      };
  
      // Envia a resposta de erro formatada
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
  }