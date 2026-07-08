/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { AppException } from './app.exception';

export class ProviderDegradationException extends AppException {
  constructor(providerName: string, details?: any) {
    super(
      `PROVIDER_CIRCUIT_OPEN`,
      `${providerName} circuit breaker is open due to consecutive failures. Delaying execution.`,
      503,
      details,
    );
  }
}
