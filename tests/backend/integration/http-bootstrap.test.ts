import assert from 'node:assert/strict';
import { Body, Controller, INestApplication, Module, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsInt, IsString, Min } from 'class-validator';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { configureHttpApplication } from '../../../backend/src/app.config';
import { AppModule } from '../../../backend/src/app.module';

class ValidationProbeDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  activeYears!: number;
}

@Controller('test-validation')
class ValidationProbeController {
  @Post()
  create(@Body() body: ValidationProbeDto): ValidationProbeDto {
    return body;
  }
}

@Module({
  controllers: [ValidationProbeController],
})
class ValidationProbeModule {}

describe('HTTP bootstrap', { timeout: 10_000 }, () => {
  let app: INestApplication;

  before(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, ValidationProbeModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureHttpApplication(app);
    await app.init();
  });

  after(async () => {
    await app.close();
  });

  it('returns the documented health response shape', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    assert.deepEqual(response.body, {
      service: '179fc-mms-backend',
      status: 'ok',
    });
  });

  it('reports database readiness without contacting MongoDB in the isolated suite', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(503);

    assert.deepEqual(response.body, {
      service: '179fc-mms-backend',
      status: 'not_ready',
      database: 'disabled',
    });
  });

  it('uses the production ValidationPipe for valid payloads', async () => {
    const response = await request(app.getHttpServer())
      .post('/test-validation')
      .send({ name: 'Synthetic test member', activeYears: 3 })
      .expect(201);

    assert.deepEqual(response.body, {
      name: 'Synthetic test member',
      activeYears: 3,
    });
  });

  it('rejects invalid and non-whitelisted payload properties', async () => {
    const response = await request(app.getHttpServer())
      .post('/test-validation')
      .send({
        name: 'Synthetic test member',
        activeYears: 0,
        unexpected: 'not allowed',
      })
      .expect(400);

    assert.equal(response.body.statusCode, 400);
    assert.equal(response.body.error, 'Bad Request');
    assert.ok(Array.isArray(response.body.message));
    assert.match(
      response.body.message.join('\n'),
      /property unexpected should not exist/,
    );
    assert.match(
      response.body.message.join('\n'),
      /activeYears must not be less than 1/,
    );
  });
});
