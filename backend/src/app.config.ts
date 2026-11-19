import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Applies the HTTP behavior shared by the production bootstrap and API tests.
 */
export function configureHttpApplication(app: INestApplication): void {
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
}
