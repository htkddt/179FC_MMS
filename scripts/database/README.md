# Database Scripts

## Implemented importer

`import-frontend-mocks.py` imports every current synthetic dataset exported from `frontend/src/mocks/` into the local MongoDB database configured by `backend/.env`. It uses Python's `pymongo` driver for the local database and `quickjs` to read the existing frontend JavaScript mock modules without adding a JavaScript automation script.

Install the importer dependencies before using either mode:

~~~powershell
python -m pip install pymongo quickjs
~~~

Run it from `backend/` only after Kiet Huynh has started and verified the local MongoDB service manually:

~~~powershell
npm run database:import-mocks
~~~

To validate source mapping and document IDs without reading `.env` or connecting to MongoDB, run this command from the repository root:

~~~powershell
python scripts/database/import-frontend-mocks.py --dry-run
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
- Stop MongoDB with the service manager or console process selected during manual installation; this repository does not manage its lifecycle.
- To discard trial data, first confirm the local `DATABASE_NAME`, then use the MongoDB shell or administration tool to run `db.dropDatabase()` against that database. This is destructive; start MongoDB manually again before rerunning the importer.

This script is an import foundation, not a frontend-backend integration. The frontend continues to use its existing mock/localStorage adapters until a later feature connects it to APIs.
