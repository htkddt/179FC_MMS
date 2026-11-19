# Scripts

## Purpose

This directory will contain repeatable automation for development, validation, CI, and release operations. Scripts are grouped by the component they support.

## Structure

~~~text
scripts/
├── backend/
├── chatbot/
├── database/
└── frontend/
~~~

## Implemented database automation

- `database/import-frontend-mocks.mjs` imports the synthetic exports in `frontend/src/mocks/` into the guarded local MongoDB target from `backend/.env`. Run `npm run database:import-mocks` from `backend/` only after Kiet Huynh has started the local MongoDB service manually. Its [database script documentation](database/README.md) lists mapping, input, safety guard, idempotency, and recovery behavior.

## Plan

1. Add environment validation and dependency-install helpers.
2. Add component-specific lint, build, test, and local-run scripts.
3. Add database migration and backup automation when feature persistence is introduced.
4. Add CI entry-point scripts that invoke tests exclusively from `../tests/`.
5. Document required inputs, expected output, permissions, and rollback behavior for every automation script.

## Conventions

- Use English names and lowercase kebab-case filenames.
- New or modified automation scripts must use Python with a `.py` filename.
- Scripts must be idempotent where practical and must not embed secrets.

## Documentation Rule

Update this README and the matching component README whenever an automation changes a component workflow. Update the root README when it changes project-wide operations.
