import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from './database/database-client.service';

@Injectable()
export class AppService {
  constructor(private readonly databaseClient: DatabaseClientService) {}

  getHealth() {
    return {
      service: '179fc-mms-backend',
      status: 'ok',
    };
  }

  async getReadiness() {
    const database = await this.databaseClient.getReadiness();

    return {
      service: '179fc-mms-backend',
      status: database === 'ready' ? 'ok' : 'not_ready',
      database,
    };
  }
}
