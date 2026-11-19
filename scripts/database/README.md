# Database Scripts

## Implemented importer

`import-frontend-mocks.mjs` imports every current synthetic dataset exported from `frontend/src/mocks/` into the local MongoDB database configured by `backend/.env`.

Run it from `backend/` after MongoDB is healthy:

~~~powershell
npm run database:import-mocks
~~~

To validate source mapping and document IDs without reading `.env` or connecting to MongoDB, run this command from the repository root:

~~~powershell
node scripts/database/import-frontend-mocks.mjs --dry-run
~~~

The importer reads `backend/.env` without printing its URI, connects with a five-second timeout, pings the target, imports the documents below, and closes its MongoDB client before exiting.

| Source export | Local collection |
| --- | --- |
| `members.js:members` | `members` |
| `dashboard.js:dashboardStats` | `dashboard_stats` |
| `dashboard.js:teamPosts` | `dashboard_posts` |
| `dashboard.js:upcomingEvents` | `events` |
| `help.js:guides` | `help_guides` |
| `help.js:articleDetails` | `help_article_details` |
| `help.js:articles` | `help_search_entries` |
| `posts.js:posts` | `posts` |
| `posts.js:PostStatus` | `post_statuses` |
| `settings.js:initialSettings` | `settings` |

Each document has a stable `mockId` plus `_mockImport.source`. Running the importer again replaces its own records and removes only stale records previously imported from the same source export; it does not delete unrelated local documents.

## Safety and recovery

- The importer refuses a URI other than `mongodb://` on `localhost`, `127.0.0.1`, or `::1`.
- The target database name must end in `_local`. This rejects the normal production-like name space before any write begins.
- It imports the repository's synthetic frontend mock data only. It must never be pointed at real member data.
- To stop MongoDB while retaining its local volume, run `docker compose -f docker-compose.mongodb.yml down` from the repository root.
- To discard all contents of the named local volume, run the destructive command `docker compose -f docker-compose.mongodb.yml down -v`, then start the container and rerun the importer. Confirm that `docker-compose.mongodb.yml` is the intended target before using `-v`.

This script is an import foundation, not a frontend-backend integration. The frontend continues to use its existing mock/localStorage adapters until a later feature connects it to APIs.
