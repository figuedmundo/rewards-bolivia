import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response } from 'express';

// OpenTelemetry setup
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
});

async function bootstrap() {
  // Start OpenTelemetry
  sdk.start();

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Rewards Bolivia API')
    .setDescription('The Rewards Bolivia API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Add OpenAPI JSON endpoint for SDK generation
  app.getHttpAdapter().get('/docs-json', (req: Request, res: Response) => {
    res.json(document);
  });

  await app.listen(3001);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error during shutdown:', error);
      process.exit(1);
    });
});

process.on('SIGINT', () => {
  sdk
    .shutdown()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error during shutdown:', error);
      process.exit(1);
    });
});

bootstrap().catch((error) => {
  console.error('Error during bootstrap:', error);
  process.exit(1);
});
