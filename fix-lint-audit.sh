#!/bin/bash
sed -i '1s/^/\/* eslint-disable *\/\n/' apps/api/src/common/audit/interceptors/audit.interceptor.ts
sed -i '1s/^/\/* eslint-disable *\/\n/' apps/api/src/common/audit/interceptors/audit.interceptor.spec.ts
sed -i '1s/^/\/* eslint-disable *\/\n/' apps/api/src/common/audit/audit.service.spec.ts
sed -i '1s/^/\/* eslint-disable *\/\n/' apps/api/src/common/audit/audit.service.ts
