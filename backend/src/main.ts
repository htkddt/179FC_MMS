import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { configureHttpApplication } from './app.config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  let app: INestApplication | undefined;

  try {
    app = await NestFactory.create(AppModule);
    configureHttpApplication(app);
    app.enableShutdownHooks();

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
  } catch {
    await app?.close();
    Logger.error(
      'Application startup failed. Check local MongoDB availability and database configuration.',
      'Bootstrap',
    );
    process.exitCode = 1;
  }
}

void bootstrap();
