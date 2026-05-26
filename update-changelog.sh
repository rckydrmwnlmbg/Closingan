cat << 'INNER_EOF' >> Docs/CHANGELOG.md

## [Unreleased]

### Added
- TASK 7.3: Implemented Graceful Degradation for Whatsapp/Fonnte service failures to prevent queue loops and infinite retries.
- TASK 7.3: Reconfigured Redis retry strategy to backoff indefinitely instead of throwing after 3 attempts, allowing the API to stay alive while queue pauses.
- TASK 7.3: Added a listener in `main.ts` to catch unhandled promise rejections so they are properly logged rather than silently crashing.
- TASK 7.4: Standardized basic observability across the application using `nestjs-pino` and structured logging contexts (e.g. `tenantId`, `jobId`, `error`).
- TASK 7.4: Ensured external API calls to OpenAI log `tokensUsed` and `tenantId` in structured format for token auditing.

### Fixed
- Fixed unhandled exception response mapping to avoid leaking stack traces directly as strings without proper log categorization.

INNER_EOF
