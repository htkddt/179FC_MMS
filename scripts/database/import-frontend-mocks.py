"""Import the current synthetic frontend mocks into a guarded local MongoDB target."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


CONNECT_TIMEOUT_MS = 5_000
SCRIPT_DIRECTORY = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIRECTORY.parent.parent
BACKEND_ROOT = PROJECT_ROOT / "backend"


@dataclass(frozen=True)
class MockSource:
    collection: str
    export_name: str
    file: str


MOCK_SOURCES = (
    MockSource("members", "members", "frontend/src/mocks/members.js"),
    MockSource("dashboard_stats", "dashboardStats", "frontend/src/mocks/dashboard.js"),
    MockSource("dashboard_posts", "teamPosts", "frontend/src/mocks/dashboard.js"),
    MockSource("events", "upcomingEvents", "frontend/src/mocks/dashboard.js"),
    MockSource("help_guides", "guides", "frontend/src/mocks/help.js"),
    MockSource(
        "help_article_details",
        "articleDetails",
        "frontend/src/mocks/help.js",
    ),
    MockSource("help_search_entries", "articles", "frontend/src/mocks/help.js"),
    MockSource("posts", "posts", "frontend/src/mocks/posts.js"),
    MockSource("post_statuses", "PostStatus", "frontend/src/mocks/posts.js"),
    MockSource("settings", "initialSettings", "frontend/src/mocks/settings.js"),
)


class ImporterError(Exception):
    """A user-safe importer failure that never includes a database URI."""


def read_environment_value(name: str) -> str:
    value = os.environ.get(name, "")
    return value.strip() if isinstance(value, str) else ""


def load_local_environment() -> None:
    environment_file = BACKEND_ROOT / ".env"
    try:
        contents = environment_file.read_text(encoding="utf-8")
    except FileNotFoundError:
        return

    for line in contents.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue

        name, value = stripped.split("=", 1)
        name = name.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"\"", "'"}:
            value = value[1:-1]
        if name and name not in os.environ:
            os.environ[name] = value


def validate_local_target(uri: str, database_name: str) -> None:
    if not database_name:
        raise ImporterError("DATABASE_NAME is required.")
    if not database_name.endswith("_local"):
        raise ImporterError(
            "The importer only accepts a DATABASE_NAME ending in _local."
        )
    if not uri:
        raise ImporterError("DATABASE_URI is required.")

    parsed_uri = urlparse(uri)
    host = (parsed_uri.hostname or "").lower()
    if parsed_uri.scheme != "mongodb" or host not in {"localhost", "127.0.0.1", "::1"}:
        raise ImporterError(
            "The importer only accepts a mongodb:// URI for localhost, 127.0.0.1, or ::1."
        )


def load_mock_export(source: MockSource) -> Any:
    try:
        import quickjs
    except ImportError as error:
        raise ImporterError(
            "The importer requires the quickjs package. Run python -m pip install pymongo quickjs."
        ) from error

    source_path = PROJECT_ROOT / source.file
    source_code = source_path.read_text(encoding="utf-8")
    executable_code = re.sub(r"^export\s+const\s+", "const ", source_code, flags=re.MULTILINE)
    executable_code = f"{executable_code}\nJSON.stringify({source.export_name});"

    try:
        serialized_value = quickjs.Context().eval(executable_code)
        value = json.loads(serialized_value)
    except Exception as error:
        raise ImporterError(
            f"Unable to read expected export {source.export_name} from {source.file}."
        ) from error

    return value


def create_documents(source: MockSource, value: Any) -> list[dict[str, Any]]:
    entries = value if isinstance(value, list) else [value]
    source_label = f"{source.file}:{source.export_name}"
    documents: list[dict[str, Any]] = []

    for index, entry in enumerate(entries, start=1):
        if not isinstance(entry, dict):
            raise ImporterError(f"{source_label} must contain object values.")

        document = json.loads(json.dumps(entry))
        candidate_id = document.get("id")
        mock_id = candidate_id if isinstance(candidate_id, str) and candidate_id else f"{source.export_name}-{index}"
        document["mockId"] = mock_id
        document["_mockImport"] = {"source": source_label}
        documents.append(document)

    if len({document["mockId"] for document in documents}) != len(documents):
        raise ImporterError(f"{source_label} contains duplicate mock IDs.")

    return documents


def source_result(source: MockSource, documents: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "collection": source.collection,
        "documents": len(documents),
        "source": f"{source.file}:{source.export_name}",
    }


def validate_mock_sources() -> list[dict[str, Any]]:
    results = []
    for source in MOCK_SOURCES:
        results.append(source_result(source, create_documents(source, load_mock_export(source))))
    return results


def print_results(results: list[dict[str, Any]], action: str) -> None:
    for result in results:
        print(f"{result['collection']}: {result['documents']} ({result['source']})")
    document_count = sum(result["documents"] for result in results)
    print(f"{action} {document_count} mock documents.")


def import_sources(uri: str, database_name: str) -> list[dict[str, Any]]:
    try:
        from pymongo import MongoClient, ReplaceOne
        from pymongo.errors import PyMongoError
    except ImportError as error:
        raise ImporterError(
            "The importer requires the pymongo package. Run python -m pip install pymongo quickjs."
        ) from error

    try:
        with MongoClient(
            uri,
            connectTimeoutMS=CONNECT_TIMEOUT_MS,
            serverSelectionTimeoutMS=CONNECT_TIMEOUT_MS,
        ) as client:
            database = client[database_name]
            database.command("ping")
            results = []

            for source in MOCK_SOURCES:
                documents = create_documents(source, load_mock_export(source))
                source_label = f"{source.file}:{source.export_name}"
                collection = database[source.collection]

                if documents:
                    collection.bulk_write(
                        [
                            ReplaceOne(
                                {"_mockImport.source": source_label, "mockId": document["mockId"]},
                                document,
                                upsert=True,
                            )
                            for document in documents
                        ],
                        ordered=True,
                    )

                collection.delete_many(
                    {
                        "_mockImport.source": source_label,
                        "mockId": {"$nin": [document["mockId"] for document in documents]},
                    }
                )
                results.append(source_result(source, documents))
            return results
    except PyMongoError as error:
        raise ImporterError(
            "Cannot connect to the local MongoDB target. Check the local service and database configuration."
        ) from error


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate mock source mappings without reading .env or connecting to MongoDB.",
    )
    return parser.parse_args()


def main() -> int:
    arguments = parse_arguments()
    if arguments.dry_run:
        print_results(validate_mock_sources(), "Validated")
        return 0

    load_local_environment()
    if read_environment_value("DATABASE_ENABLED").lower() == "false":
        raise ImporterError("DATABASE_ENABLED must be true when importing frontend mocks.")

    uri = read_environment_value("DATABASE_URI")
    database_name = read_environment_value("DATABASE_NAME")
    validate_local_target(uri, database_name)
    print_results(import_sources(uri, database_name), "Imported")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ImporterError as error:
        print(f"Mock import failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error
