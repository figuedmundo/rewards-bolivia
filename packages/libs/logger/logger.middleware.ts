import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, cookies } = request;

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - Cookies: ${JSON.stringify(cookies)}`,
      );
    });

    next();
  }
}
