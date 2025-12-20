import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  constructor() {
    super('XP-Farmer');
  }

  logRequest(method: string, url: string, ip: string, userAgent: string) {
    this.log(`[REQUEST] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);
  }

  logResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
  ) {
    this.log(`[RESPONSE] ${method} ${url} - ${statusCode} - ${duration}ms`);
  }

  logError(method: string, url: string, error: any, duration?: number) {
    const durationText = duration ? ` - ${duration}ms` : '';
    this.error(
      `[ERROR] ${method} ${url}${durationText} - ${error.message}`,
      error.stack,
    );
  }

  logDatabaseQuery(query: string, duration?: number) {
    const durationText = duration ? ` (${duration}ms)` : '';
    this.debug(`[DB] ${query}${durationText}`);
  }

  logAuth(action: string, userId?: string, email?: string) {
    const user = userId
      ? `User: ${userId}`
      : email
        ? `Email: ${email}`
        : 'Anonymous';
    this.log(`[AUTH] ${action} - ${user}`);
  }
}
