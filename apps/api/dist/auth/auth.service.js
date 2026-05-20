"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../common/prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const bcrypt = __importStar(require("bcryptjs"));
const app_exception_1 = require("../common/exceptions/app.exception");
const audit_service_1 = require("../common/audit/audit.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    mailService;
    auditService;
    constructor(prisma, jwtService, configService, mailService, auditService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
        this.auditService = auditService;
    }
    isDisposableEmail(email) {
        const disposableDomains = ['mailinator.com', 'guerrillamail.com'];
        const domain = email.split('@')[1];
        return disposableDomains.includes(domain);
    }
    async register(dto) {
        if (this.isDisposableEmail(dto.email)) {
            throw new app_exception_1.AppException('EMAIL_DISPOSABLE', 'Email disposable tidak diizinkan.', 422);
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new app_exception_1.AppException('EMAIL_ALREADY_EXISTS', 'Email sudah terdaftar.', 409);
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.$transaction(async (prisma) => {
            const tenantName = dto.fullName.split(' ')[0] + "'s Tenant";
            const tenant = await prisma.tenant.create({
                data: {
                    name: tenantName,
                },
            });
            return prisma.user.create({
                data: {
                    email: dto.email,
                    passwordHash,
                    fullName: dto.fullName,
                    tenantId: tenant.id,
                    role: 'SALES',
                },
            });
        });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.otpCode.create({
            data: {
                userId: user.id,
                code: otp,
                type: 'EMAIL_VERIFY',
                expiresAt,
            },
        });
        await this.mailService.sendOtp(dto.email, otp);
        await this.auditService.log({
            tenantId: user.tenantId,
            userId: user.id,
            action: client_1.AuditAction.USER_REGISTER,
            entityType: 'User',
            entityId: user.id,
        });
        return {
            userId: user.id,
            email: user.email,
            message: 'OTP verifikasi telah dikirim ke email kamu.',
        };
    }
    async verifyOtp(dto) {
        const otpRecord = await this.prisma.otpCode.findFirst({
            where: {
                userId: dto.userId,
                type: 'EMAIL_VERIFY',
                usedAt: null,
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!otpRecord) {
            throw new app_exception_1.AppException('OTP_INVALID', 'OTP salah atau tidak ditemukan.', 422);
        }
        if (otpRecord.expiresAt < new Date()) {
            throw new app_exception_1.AppException('OTP_EXPIRED', 'OTP sudah expired.', 422);
        }
        if (otpRecord.attempts >= 3) {
            const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
            await this.prisma.user.update({
                where: { id: dto.userId },
                data: { lockedUntil: lockUntil },
            });
            throw new app_exception_1.AppException('OTP_MAX_ATTEMPTS', 'Terlalu banyak percobaan OTP, coba lagi nanti.', 429);
        }
        if (otpRecord.code !== dto.code) {
            await this.prisma.otpCode.update({
                where: { id: otpRecord.id },
                data: { attempts: { increment: 1 } },
            });
            throw new app_exception_1.AppException('OTP_INVALID', 'OTP salah.', 422);
        }
        await this.prisma.otpCode.update({
            where: { id: otpRecord.id },
            data: { usedAt: new Date() },
        });
        await this.prisma.user.update({
            where: { id: dto.userId },
            data: { emailVerified: true },
        });
        return { verified: true };
    }
    async resendOtp(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new app_exception_1.AppException('USER_NOT_FOUND', 'User tidak ditemukan.', 404);
        }
        await this.prisma.otpCode.updateMany({
            where: { userId, type: 'EMAIL_VERIFY', usedAt: null },
            data: { usedAt: new Date() },
        });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.otpCode.create({
            data: {
                userId: user.id,
                code: otp,
                type: 'EMAIL_VERIFY',
                expiresAt,
            },
        });
        await this.mailService.sendOtp(user.email, otp);
        return { message: 'OTP baru telah dikirim.' };
    }
    async login(dto, ipAddress) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new app_exception_1.AppException('USER_NOT_FOUND', 'Email atau password salah.', 404);
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new app_exception_1.AppException('ACCOUNT_LOCKED', 'Akun terkunci sementara.', 423);
        }
        if (!user.emailVerified) {
            throw new app_exception_1.AppException('EMAIL_NOT_VERIFIED', 'Email belum diverifikasi.', 403);
        }
        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            const attempts = user.loginAttempts + 1;
            let lockedUntil = null;
            if (attempts >= 3) {
                lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            }
            await this.prisma.user.update({
                where: { id: user.id },
                data: { loginAttempts: attempts, lockedUntil },
            });
            throw new app_exception_1.AppException('USER_NOT_FOUND', 'Email atau password salah.', 404);
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                loginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
                lastLoginIp: ipAddress,
            },
        });
        await this.auditService.log({
            tenantId: user.tenantId,
            userId: user.id,
            action: client_1.AuditAction.USER_LOGIN,
            ipAddress: ipAddress,
        });
        return this.generateTokens(user);
    }
    async refreshTokens(dto) {
        const record = await this.prisma.refreshToken.findUnique({
            where: { token: dto.refreshToken },
            include: { user: true },
        });
        if (!record || record.usedAt || record.expiresAt < new Date()) {
            throw new app_exception_1.AppException('UNAUTHORIZED', 'Token tidak valid atau expired.', 401);
        }
        await this.prisma.refreshToken.update({
            where: { id: record.id },
            data: { usedAt: new Date() },
        });
        return this.generateTokens(record.user);
    }
    async logout(refreshToken) {
        const record = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (record && !record.usedAt) {
            await this.prisma.refreshToken.update({
                where: { id: record.id },
                data: { usedAt: new Date() },
            });
            await this.auditService.log({
                tenantId: record.user.tenantId,
                userId: record.user.id,
                action: client_1.AuditAction.USER_LOGOUT,
            });
        }
        return true;
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user) {
            const token = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
            await this.prisma.otpCode.create({
                data: {
                    userId: user.id,
                    code: token,
                    type: 'PASSWORD_RESET',
                    expiresAt,
                },
            });
            await this.mailService.sendPasswordReset(email, token);
        }
        return { message: 'Link reset dikirim ke email.' };
    }
    async resetPassword(token, newPassword) {
        const otpRecord = await this.prisma.otpCode.findFirst({
            where: { code: token, type: 'PASSWORD_RESET', usedAt: null },
        });
        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            throw new app_exception_1.AppException('UNAUTHORIZED', 'Token tidak valid atau expired.', 401);
        }
        const passwordHash = await bcrypt.hash(newPassword, 12);
        const user = await this.prisma.user.findUnique({
            where: { id: otpRecord.userId },
        });
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: otpRecord.userId },
                data: { passwordHash },
            }),
            this.prisma.otpCode.update({
                where: { id: otpRecord.id },
                data: { usedAt: new Date() },
            }),
            this.prisma.refreshToken.updateMany({
                where: { userId: otpRecord.userId, usedAt: null },
                data: { usedAt: new Date() },
            }),
        ]);
        if (user) {
            await this.auditService.log({
                tenantId: user.tenantId,
                userId: user.id,
                action: client_1.AuditAction.PASSWORD_CHANGED,
            });
        }
        return true;
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET') || 'default_secret',
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET') ||
                'refresh_secret',
            expiresIn: '7d',
        });
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map