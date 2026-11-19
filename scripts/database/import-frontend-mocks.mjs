import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..', '..');
const backendRoot = resolve(projectRoot, 'backend');
const require = createRequire(resolve(backendRoot, 'package.json'));
const { MongoClient } = require('mongodb');

const mockSources = [
  {
    collection: 'members',
    exportName: 'members',
    file: 'frontend/src/mocks/members.js',
  },
  {
    collection: 'dashboard_stats',
    exportName: 'dashboardStats',
    file: 'frontend/src/mocks/dashboard.js',
  },
  {
    collection: 'dashboard_posts',
    exportName: 'teamPosts',
    file: 'frontend/src/mocks/dashboard.js',
  },
  {
    collection: 'events',
    exportName: 'upcomingEvents',
    file: 'frontend/src/mocks/dashboard.js',
  },
  {
    collection: 'help_guides',
    exportName: 'guides',
    file: 'frontend/src/mocks/help.js',
  },
  {
    collection: 'help_article_details',
    exportName: 'articleDetails',
    file: 'frontend/src/mocks/help.js',
  },
  {
    collection: 'help_search_entries',
    exportName: 'articles',
    file: 'frontend/src/mocks/help.js',
  },
  {
    collection: 'posts',
    exportName: 'posts',
    file: 'frontend/src/mocks/posts.js',
  },
  {
    collection: 'post_statuses',
    exportName: 'PostStatus',
    file: 'frontend/src/mocks/posts.js',
  },
  {
    collection: 'settings',
    exportName: 'initialSettings',
    file: 'frontend/src/mocks/settings.js',
  },
];

function getEnvironmentValue(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

async function loadLocalEnvironment() {
  const environmentFile = resolve(backendRoot, '.env');

  try {
    const contents = await readFile(environmentFile, 'utf8');
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) {
        continue;
      }

      const separator = trimmed.indexOf('=');
      if (separator <= 0) {
        continue;
      }

      const name = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if (
        value.length >= 2 &&
        ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'")))
      ) {
        value = value.slice(1, -1);
      }

      if (process.env[name] === undefined) {
        process.env[name] = value;
      }
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }
}

function validateLocalTarget(uri, databaseName) {
  if (databaseName === '') {
    throw new Error('DATABASE_NAME is required.');
  }
  if (!databaseName.endsWith('_local')) {
    throw new Error('The importer only accepts a DATABASE_NAME ending in _local.');
  }
  if (uri === '') {
    throw new Error('DATABASE_URI is required.');
  }

  let parsedUri;
  try {
    parsedUri = new URL(uri);
  } catch {
    throw new Error('DATABASE_URI must be a valid local mongodb:// URI.');
  }

  const host = parsedUri.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  if (parsedUri.protocol !== 'mongodb:' || !isLocalHost) {
    throw new Error(
      'The importer only accepts a mongodb:// URI for localhost, 127.0.0.1, or ::1.',
    );
  }
}

async function loadMockExport(source) {
  const sourcePath = resolve(projectRoot, source.file);
  const sourceCode = await readFile(sourcePath, 'utf8');
  const executableCode = `${sourceCode.replace(/^export\s+const\s+/gm, 'const ')}\nmodule.exports = { ${source.exportName} };`;
  const module = { exports: {} };
  const context = vm.createContext({
    Date,
    Object,
    Set,
    module,
  });

  new vm.Script(executableCode, { filename: sourcePath }).runInContext(context);

  const value = module.exports[source.exportName];
  if (value === undefined) {
    throw new Error(`Missing expected export ${source.exportName} in ${source.file}.`);
  }

  return value;
}

function createDocuments(source, value) {
  const entries = Array.isArray(value) ? value : [value];
  const sourceLabel = `${source.file}:${source.exportName}`;
  const documents = entries.map((entry, index) => {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`${sourceLabel} must contain object values.`);
    }

    const document = JSON.parse(JSON.stringify(entry));
    const mockId =
      typeof document.id === 'string' && document.id !== ''
        ? document.id
        : `${source.exportName}-${index + 1}`;

    return {
      ...document,
      mockId,
      _mockImport: {
        source: sourceLabel,
      },
    };
  });

  if (new Set(documents.map((document) => document.mockId)).size !== documents.length) {
    throw new Error(`${sourceLabel} contains duplicate mock IDs.`);
  }

  return documents;
}

async function importSource(database, source) {
  const value = await loadMockExport(source);
  const documents = createDocuments(source, value);
  const sourceLabel = `${source.file}:${source.exportName}`;
  const collection = database.collection(source.collection);

  if (documents.length > 0) {
    await collection.bulkWrite(
      documents.map((document) => ({
        replaceOne: {
          filter: {
            '_mockImport.source': sourceLabel,
            mockId: document.mockId,
          },
          replacement: document,
          upsert: true,
        },
      })),
      { ordered: true },
    );
  }

  await collection.deleteMany({
    '_mockImport.source': sourceLabel,
    mockId: { $nin: documents.map((document) => document.mockId) },
  });

  return {
    collection: source.collection,
    documents: documents.length,
    source: sourceLabel,
  };
}

async function validateMockSources() {
  const results = [];

  for (const source of mockSources) {
    const value = await loadMockExport(source);
    const documents = createDocuments(source, value);
    results.push({
      collection: source.collection,
      documents: documents.length,
      source: `${source.file}:${source.exportName}`,
    });
  }

  const documentCount = results.reduce((total, result) => total + result.documents, 0);
  console.table(results);
  console.log(`Validated ${documentCount} mock documents without connecting to MongoDB.`);
}

async function main() {
  if (process.argv.includes('--dry-run')) {
    await validateMockSources();
    return;
  }

  await loadLocalEnvironment();

  const enabled = getEnvironmentValue('DATABASE_ENABLED');
  if (enabled.toLowerCase() === 'false') {
    throw new Error('DATABASE_ENABLED must be true when importing frontend mocks.');
  }

  const uri = getEnvironmentValue('DATABASE_URI');
  const databaseName = getEnvironmentValue('DATABASE_NAME');
  validateLocalTarget(uri, databaseName);

  const client = new MongoClient(uri, {
    connectTimeoutMS: 5_000,
    serverSelectionTimeoutMS: 5_000,
  });

  try {
    await client.connect();
    const database = client.db(databaseName);
    await database.command({ ping: 1 });

    const results = [];
    for (const source of mockSources) {
      results.push(await importSource(database, source));
    }

    const documentCount = results.reduce((total, result) => total + result.documents, 0);
    console.table(results);
    console.log(`Imported ${documentCount} mock documents into ${databaseName}.`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(`Mock import failed: ${error.message}`);
  process.exitCode = 1;
});
