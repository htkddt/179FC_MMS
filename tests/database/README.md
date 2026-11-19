# Database Tests

This directory is reserved for future database migration, integrity, repository, and query test source. MongoDB and a database runner are not configured yet; no database tests or database coverage are implemented.

When persistence is selected, keep all database test source, fixtures, and test-only configuration here. Use a dedicated disposable test database or equivalent isolated service, synthetic records only, explicit connection/test timeouts, and teardown that closes all handles. Document the selected runner, commands, environment requirements, artifact policy, and lifecycle before claiming database coverage.
