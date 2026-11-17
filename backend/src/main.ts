import { NestFactory } from '@nestjs/core';
import { configureHttpApplication } from './app.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureHttpApplication(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

void bootstrap();
