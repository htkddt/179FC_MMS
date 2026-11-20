# Database Tests

MongoDB local connectivity and a synthetic mock importer are implemented, but no database test runner or database integration suite is implemented in this ticket. Do not claim database coverage from the backend unit/integration commands: they deliberately set `DATABASE_ENABLED=false`.

When database coverage is scheduled, keep all database test source, fixtures, and test-only configuration here. Use a dedicated disposable test database or equivalent isolated service, synthetic records only, explicit connection and test timeouts, and teardown that closes all handles. Document the selected runner, commands, environment requirements, artifact policy, and lifecycle before claiming database coverage.
