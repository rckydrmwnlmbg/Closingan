/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ObservabilityMetricsService } from '../../observability/observability-metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: ObservabilityMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        this.metricsService.incrementRequestCount();
      }),
      catchError((err) => {
        this.metricsService.incrementErrorCount();
        return throwError(() => err);
      }),
    );
  }
}
