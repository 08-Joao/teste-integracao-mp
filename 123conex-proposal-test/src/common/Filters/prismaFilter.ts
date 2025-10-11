// src/common/filters/prisma-exception.filter.ts

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { Prisma } from 'generated/prisma';
  
  @Catch(Prisma.PrismaClientKnownRequestError)
  export class PrismaExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PrismaExceptionFilter.name);
  
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Ocorreu um erro inesperado no banco de dados.';
  
      // Log detalhado para o desenvolvedor
      this.logger.error(
          `Prisma Error Code: ${exception.code} - ${exception.message}`,
          `Path: ${request.url}`
      );
  
      switch (exception.code) {
        case 'P2002': { // Violação de restrição única (Unique constraint violation)
          status = HttpStatus.CONFLICT; // 409
          // A propriedade 'meta.target' geralmente contém o(s) campo(s) que causaram o erro
          const field = (exception.meta?.target as string[])?.join(', ');
          message = `Já existe um registro com este valor no campo: ${field}.`;
          break;
        }
        case 'P2025': { // Registro não encontrado (para update ou delete)
          status = HttpStatus.NOT_FOUND; // 404
          message = `O registro que você tentou operar não foi encontrado.`;
          break;
        }
        // Adicione outros códigos de erro do Prisma que você queira tratar
        // https://www.prisma.io/docs/reference/api-reference/error-reference
        default: {
          // Para todos os outros erros conhecidos do Prisma, usamos um erro 500
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Erro interno no processamento da requisição ao banco de dados.';
          break;
        }
      }
      
      response.status(status).json({
        statusCode: status,
        message: message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }