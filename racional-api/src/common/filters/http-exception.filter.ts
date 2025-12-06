import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ErrorResponse } from '../interfaces/error-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    this.logError(exception, request, errorResponse.statusCode);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    if (exception instanceof HttpException) {
      return this.buildHttpExceptionResponse(exception, request);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.buildPrismaErrorResponse(exception, request);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return this.buildPrismaValidationErrorResponse(exception, request);
    }

    if (exception instanceof Error) {
      return this.buildGenericErrorResponse(exception, request);
    }

    return this.buildUnknownErrorResponse(request);
  }

  private buildHttpExceptionResponse(
    exception: HttpException,
    request: Request,
  ): ErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string[];
    let error: string | undefined;

    if (typeof exceptionResponse === 'string') {
      message = [exceptionResponse];
      error = exceptionResponse;
    } else if (this.isHttpExceptionResponseObject(exceptionResponse)) {
      const responseMessage = exceptionResponse.message;
      message = Array.isArray(responseMessage)
        ? responseMessage
        : [responseMessage];
      error = exceptionResponse.error;
    } else {
      message = [exception.message];
      error = exception.message;
    }

    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };
  }

  private buildPrismaErrorResponse(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request,
  ): ErrorResponse {
    const status = this.mapPrismaErrorToHttpStatus(exception.code);
    const message = this.getPrismaErrorMessage(exception);

    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: [message],
      error: 'Database operation failed',
    };
  }

  private buildPrismaValidationErrorResponse(
    exception: Prisma.PrismaClientValidationError,
    request: Request,
  ): ErrorResponse {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: ['Invalid data provided'],
      error: 'Validation error',
    };
  }

  private buildGenericErrorResponse(
    exception: Error,
    request: Request,
  ): ErrorResponse {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: [exception.message],
      error: 'Internal server error',
    };
  }

  private buildUnknownErrorResponse(request: Request): ErrorResponse {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: ['An unexpected error occurred'],
      error: 'Internal server error',
    };
  }

  private mapPrismaErrorToHttpStatus(code: string): HttpStatus {
    const errorCodeMap: Record<string, HttpStatus> = {
      P2002: HttpStatus.CONFLICT, // Unique constraint failed
      P2025: HttpStatus.NOT_FOUND, // Record not found
      P2003: HttpStatus.BAD_REQUEST, // Foreign key constraint failed
      P2014: HttpStatus.BAD_REQUEST, // Required relation violation
    };

    return errorCodeMap[code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getPrismaErrorMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    const errorMessageMap: Record<string, string> = {
      P2002: 'A record with this value already exists',
      P2025: 'The requested record was not found',
      P2003: 'Invalid reference to a related record',
      P2014: 'Required relation is missing',
    };

    return (
      errorMessageMap[exception.code] ??
      'A database error occurred while processing your request'
    );
  }

  private isHttpExceptionResponseObject(
    response: string | object,
  ): response is { message: string | string[]; error?: string } {
    return (
      typeof response === 'object' && response !== null && 'message' in response
    );
  }

  private logError(
    exception: unknown,
    request: Request,
    statusCode: number,
  ): void {
    const logContext = {
      method: request.method,
      url: request.url,
      statusCode,
    };

    if (statusCode >= 500) {
      const errorStack =
        exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `${request.method} ${request.url}`,
        errorStack ?? JSON.stringify(exception),
        logContext,
      );
    } else {
      const errorMessage =
        exception instanceof Error
          ? exception.message
          : 'Unknown error occurred';
      this.logger.warn(
        `${request.method} ${request.url} - ${statusCode} - ${errorMessage}`,
        logContext,
      );
    }
  }
}
