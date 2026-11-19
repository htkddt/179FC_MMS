import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';
import { DatabaseConfigService } from './database-config.module';

export type DatabaseReadiness = 'disabled' | 'not_ready' | 'ready';

@Injectable()
export class DatabaseClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseClientService.name);
  private client: MongoClient | undefined;
  private database: Db | undefined;

  constructor(private readonly config: DatabaseConfigService) {}

  async onModuleInit(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.warn('MongoDB is disabled by DATABASE_ENABLED=false.');
      return;
    }

    const client = new MongoClient(this.config.uri, {
      connectTimeoutMS: this.config.connectTimeoutMs,
      serverSelectionTimeoutMS: this.config.connectTimeoutMs,
    });

    try {
      await client.connect();
      const database = client.db(this.config.name);
      await database.command({ ping: 1 });

      this.client = client;
      this.database = database;
      this.logger.log('MongoDB connection is ready.');
    } catch {
      await client.close().catch(() => undefined);
      throw new Error(
        'MongoDB connection failed during startup. Check the local MongoDB service and database configuration.',
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.database = undefined;

    const client = this.client;
    this.client = undefined;

    await client?.close();
  }

  async getReadiness(): Promise<DatabaseReadiness> {
    if (!this.config.enabled) {
      return 'disabled';
    }

    if (this.client === undefined || this.database === undefined) {
      return 'not_ready';
    }

    try {
      await this.database.command(
        { ping: 1 },
        { timeoutMS: this.config.connectTimeoutMs },
      );
      return 'ready';
    } catch {
      return 'not_ready';
    }
  }
}
