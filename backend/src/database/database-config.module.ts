import { Global, Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { resolve } from 'node:path';

const DEFAULT_CONNECT_TIMEOUT_MS = 5_000;
const MIN_CONNECT_TIMEOUT_MS = 100;
const MAX_CONNECT_TIMEOUT_MS = 60_000;
const databaseNamePattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/;
const mongoUriPattern = /^mongodb(?:\+srv)?:\/\/[^\s/]+(?:\/[^\s?]*)?(?:\?[^\s]*)?$/i;

function configurationError(message: string): Error {
  return new Error(`Database configuration error: ${message}`);
}

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseEnabled(value: unknown): boolean {
  const normalized = readTrimmedString(value).toLowerCase();

  if (normalized === '' || normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  throw configurationError('DATABASE_ENABLED must be true or false.');
}

function parseTimeout(value: unknown): number {
  const normalized = readTrimmedString(value);

  if (normalized === '') {
    return DEFAULT_CONNECT_TIMEOUT_MS;
  }

  const timeout = Number(normalized);
  if (
    !Number.isInteger(timeout) ||
    timeout < MIN_CONNECT_TIMEOUT_MS ||
    timeout > MAX_CONNECT_TIMEOUT_MS
  ) {
    throw configurationError(
      `DATABASE_CONNECT_TIMEOUT_MS must be an integer from ${MIN_CONNECT_TIMEOUT_MS} to ${MAX_CONNECT_TIMEOUT_MS}.`,
    );
  }

  return timeout;
}

/**
 * Validates and normalizes the database environment before Nest constructs providers.
 * It deliberately reports variable names only, never the URI value.
 */
export function validateDatabaseEnvironment(
  environment: Record<string, unknown>,
): Record<string, unknown> {
  const enabled = parseEnabled(environment.DATABASE_ENABLED);
  const timeout = parseTimeout(environment.DATABASE_CONNECT_TIMEOUT_MS);

  if (!enabled) {
    return {
      ...environment,
      DATABASE_ENABLED: 'false',
      DATABASE_CONNECT_TIMEOUT_MS: String(timeout),
    };
  }

  const uri = readTrimmedString(environment.DATABASE_URI);
  if (uri === '') {
    throw configurationError('DATABASE_URI is required when DATABASE_ENABLED is true.');
  }
  if (!mongoUriPattern.test(uri)) {
    throw configurationError('DATABASE_URI must use a mongodb:// or mongodb+srv:// URI.');
  }

  const databaseName = readTrimmedString(environment.DATABASE_NAME);
  if (databaseName === '') {
    throw configurationError('DATABASE_NAME is required when DATABASE_ENABLED is true.');
  }
  if (!databaseNamePattern.test(databaseName)) {
    throw configurationError(
      'DATABASE_NAME may contain only letters, numbers, underscores, and hyphens.',
    );
  }

  return {
    ...environment,
    DATABASE_ENABLED: 'true',
    DATABASE_URI: uri,
    DATABASE_NAME: databaseName,
    DATABASE_CONNECT_TIMEOUT_MS: String(timeout),
  };
}

@Injectable()
export class DatabaseConfigService {
  constructor(private readonly configService: ConfigService) {}

  get enabled(): boolean {
    return this.getRequired('DATABASE_ENABLED') === 'true';
  }

  get uri(): string {
    return this.getRequired('DATABASE_URI');
  }

  get name(): string {
    return this.getRequired('DATABASE_NAME');
  }

  get connectTimeoutMs(): number {
    return Number(this.getRequired('DATABASE_CONNECT_TIMEOUT_MS'));
  }

  private getRequired(name: string): string {
    const value = this.configService.get<string>(name);
    if (value === undefined || value === '') {
      throw configurationError(`${name} is required.`);
    }

    return value;
  }
}

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: resolve(__dirname, '..', '..', '.env'),
      isGlobal: true,
      validate: validateDatabaseEnvironment,
    }),
  ],
  providers: [DatabaseConfigService],
  exports: [DatabaseConfigService],
})
export class DatabaseConfigModule {}
