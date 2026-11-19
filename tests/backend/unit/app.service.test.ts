import assert from 'node:assert/strict';
import test from 'node:test';
import { AppService } from '../../../backend/src/app.service';

test('AppService returns the stable health payload', () => {
  const service = new AppService();

  assert.deepEqual(service.getHealth(), {
    service: '179fc-mms-backend',
    status: 'ok',
  });
});
