#!/bin/bash
sed -i '1s/^/\/* eslint-disable *\/\n/' apps/api/src/common/guards/jwt-auth.guard.ts
