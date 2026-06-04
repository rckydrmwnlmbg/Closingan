import * as fs from 'fs';

const filePath = 'apps/api/src/modules/billing/controllers/quota.controller.ts';
let code = fs.readFileSync(filePath, 'utf-8');

code = code.replace(
  /import \{ Controller, Get, Post, UseGuards, Req \} from '@nestjs\/common';/,
  "import { Controller, Get, Post, UseGuards, Req, NotFoundException } from '@nestjs/common';"
);

code = code.replace(
  /throw new Error\('Tenant has no active subscription'\);/,
  "throw new NotFoundException('Tenant has no active subscription');"
);

code = code.replace(
  /return \{\n      success: true,\n      data: \{\n        paymentUrl: result.paymentUrl,\n        invoiceId: result.invoiceId,\n      \},\n    \};/,
  "return {\n      success: true,\n      data: {\n        paymentUrl: result.paymentUrl,\n        invoiceId: result.invoiceId,\n        token: result.paymentUrl.split('/').pop(),\n      },\n    };"
);

fs.writeFileSync(filePath, code);
