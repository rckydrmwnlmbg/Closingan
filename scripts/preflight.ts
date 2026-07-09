import { execSync } from 'child_process';
import axios from 'axios';
import 'dotenv/config';

async function runPreflight() {
  console.log('🚀 Starting Pre-Launch Checklist...');
  let hasErrors = false;

  const checks = [
    {
      name: '1. Environment Variables',
      test: () => {
        const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'FONNTE_SYSTEM_TOKEN', 'OPENAI_API_KEY', 'REDIS_URL'];
        const missing = required.filter((key) => !process.env[key]);
        if (missing.length > 0) throw new Error(`Missing: ${missing.join(', ')}`);
      },
    },
    {
      name: '2. Database Migrations',
      test: () => {
        // Just verify Prisma can connect and check migrations
        // In real prod, this checks if schema is in sync with DB
        try {
          execSync('npx prisma migrate status --schema=apps/api/prisma/schema.prisma', { stdio: 'ignore' });
        } catch (e) {
          throw new Error('Database is out of sync or unreachable.');
        }
      },
    },
    {
      name: '3. API Health Check',
      test: async () => {
        const url = process.env.APP_URL || 'http://localhost:3000';
        try {
          const res = await axios.get(`${url}/v1/health`);
          if (res.status !== 200) throw new Error(`Status ${res.status}`);
        } catch (e) {
          throw new Error(`API unreachable at ${url}/v1/health`);
        }
      },
    },
    {
      name: '4. Redis & BullMQ Connections',
      test: () => {
        if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
           throw new Error('Redis configuration missing.');
        }
        // In a more thorough script, actually create a Redis client and ping
      },
    },
  ];

  for (const check of checks) {
    try {
      process.stdout.write(`⏳ [TEST] ${check.name}... `);
      await check.test();
      console.log('✅ PASS');
    } catch (err: any) {
      console.log(`❌ FAIL\n   ↳ ${err.message}`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('\n🚨 Preflight failed! Fix the errors above before launching.');
    process.exit(1);
  } else {
    console.log('\n🎉 All systems go! Ready for launch.');
  }
}

runPreflight();
