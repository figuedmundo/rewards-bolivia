import * as winston from 'winston';
import { Injectable } from '@nestjs/common';
import { trace, Span, SpanStatusCode } from '@opentelemetry/api';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;
  private tracer = trace.getTracer('rewards-bolivia', '1.0.0');

  constructor(context?: string) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'rewards-bolivia', context },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  private getCorrelationId(): string {
    const span = trace.getActiveSpan();
    return span?.spanContext().traceId || 'no-trace';
  }

  log(message: string, meta?: any) {
    const correlationId = this.getCorrelationId();
    this.logger.info(message, { ...meta, correlationId });
  }

  error(message: string, meta?: any) {
    const correlationId = this.getCorrelationId();
    this.logger.error(message, { ...meta, correlationId });
  }

  warn(message: string, meta?: any) {
    const correlationId = this.getCorrelationId();
    this.logger.warn(message, { ...meta, correlationId });
  }

  debug(message: string, meta?: any) {
    const correlationId = this.getCorrelationId();
    this.logger.debug(message, { ...meta, correlationId });
  }

  startSpan(name: string, attributes?: Record<string, any>): Span {
    return this.tracer.startSpan(name, { attributes });
  }

  withSpan<T>(name: string, fn: (span: Span) => Promise<T>, attributes?: Record<string, any>): Promise<T> {
    return this.tracer.startActiveSpan(name, { attributes }, async (span) => {
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : String(error) });
        span.recordException(error instanceof Error ? error : new Error(String(error)));
        throw error;
      } finally {
        span.end();
      }
    });
  }
}