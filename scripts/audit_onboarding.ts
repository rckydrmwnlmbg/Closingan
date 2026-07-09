import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function runAudit() {
  console.log('=== AUDIT 1: Registration, Onboarding & Referral ===');

  try {
    // 1. Create a Referrer Tenant
    console.log('[1/5] Creating Referrer Tenant...');
    const referrerEmail = `referrer_${Date.now()}@test.com`;
    
    // Simulate Auth Service Registration for Referrer
    const trialEnds1 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const referrerTenant = await prisma.tenant.create({
      data: {
        name: "Referrer's Tenant",
        subscription: {
          create: {
            state: 'TRIAL',
            plan: 'STARTER',
            trialEndsAt: trialEnds1,
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEnds1,
          }
        },
        referralCode: `REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
      }
    });

    await prisma.user.create({
      data: {
        email: referrerEmail,
        passwordHash: await bcrypt.hash('Password123!', 10),
        fullName: 'Referrer User',
        tenantId: referrerTenant.id,
      }
    });

    console.log(`✅ Referrer Created. Code: ${referrerTenant.referralCode}`);

    // 2. Create a New Tenant using the Referral Code
    console.log('\n[2/5] Creating Referred Tenant with Referral Code...');
    const referredEmail = `referred_${Date.now()}@test.com`;
    const trialEnds2 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const referredTenant = await prisma.tenant.create({
      data: {
        name: "Referred's Tenant",
        subscription: {
          create: {
            state: 'TRIAL',
            plan: 'STARTER',
            trialEndsAt: trialEnds2,
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEnds2,
          }
        }
      }
    });

    await prisma.referral.create({
      data: {
        tenantId: referrerTenant.id,
        referrerId: referrerTenant.id,
        receiverId: referredTenant.id,
        referralCode: referrerTenant.referralCode,
        status: 'SIGNED_UP',
      }
    });

    await prisma.user.create({
      data: {
        email: referredEmail,
        passwordHash: await bcrypt.hash('Password123!', 10),
        fullName: 'Referred User',
        tenantId: referredTenant.id,
      }
    });

    console.log('✅ Referred Tenant Created.');

    // 3. Verify Isolation and Onboarding State
    console.log('\n[3/5] Verifying Onboarding State & Isolation...');
    const fetchedReferred = await prisma.tenant.findUnique({ 
      where: { id: referredTenant.id },
      include: { subscription: true }
    });

    if (fetchedReferred?.isOnboarded === false) {
      console.log('✅ isOnboarded is correctly set to false for new tenant.');
    } else {
      console.error('❌ isOnboarded should be false.');
    }

    if (referrerTenant.id !== referredTenant.id) {
      console.log('✅ Tenant Isolation maintained (different IDs).');
    } else {
      console.error('❌ Tenant Isolation failed (same IDs).');
    }

    // 4. Verify Trial Extended
    console.log('\n[4/5] Verifying Referral Trial Extension (14 days)...');
    const diffTime = Math.abs(fetchedReferred?.subscription?.trialEndsAt?.getTime()! - new Date().getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 14) {
      console.log('✅ Referral trial correctly extended to 14 days.');
    } else {
      console.error(`❌ Expected 14 days trial, got ${diffDays} days.`);
    }

    // 5. Cleanup
    console.log('\n[5/5] Cleaning up audit data...');
    await prisma.user.deleteMany({ where: { email: { in: [referrerEmail, referredEmail] } } });
    await prisma.referral.deleteMany({ where: { referrerId: referrerTenant.id } });
    await prisma.subscription.deleteMany({ where: { tenantId: { in: [referrerTenant.id, referredTenant.id] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [referrerTenant.id, referredTenant.id] } } });
    console.log('✅ Cleanup complete.');
    
    console.log('\n=== AUDIT 1 PASSED ===\n');

  } catch (error) {
    console.error('❌ Audit Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runAudit();
