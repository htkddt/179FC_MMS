import { Module } from '@nestjs/common';
import { DatabaseClientService } from './database-client.service';
import { DatabaseConfigModule } from './database-config.module';

@Module({
  imports: [DatabaseConfigModule],
  providers: [DatabaseClientService],
  exports: [DatabaseClientService],
})
export class DatabaseModule {}
