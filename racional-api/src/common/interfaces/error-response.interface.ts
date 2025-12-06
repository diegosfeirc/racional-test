export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string[];
  error?: string;
}

export interface HttpExceptionResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface PrismaErrorResponse extends ErrorResponse {
  prismaCode?: string;
  prismaMeta?: Record<string, unknown>;
}
