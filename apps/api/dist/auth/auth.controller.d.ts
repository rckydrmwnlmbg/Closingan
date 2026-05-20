import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyOtpDto, ResendOtpDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        success: boolean;
        data: {
            userId: string;
            email: string;
            message: string;
        };
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        success: boolean;
        data: {
            verified: boolean;
        };
    }>;
    resendOtp(dto: ResendOtpDto): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
    login(dto: LoginDto, ip: string): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: any;
                email: any;
                fullName: any;
                role: any;
            };
        };
    }>;
    refreshTokens(dto: RefreshTokenDto): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: any;
                email: any;
                fullName: any;
                role: any;
            };
        };
    }>;
    logout(dto: RefreshTokenDto): Promise<{
        success: boolean;
        data: {
            success: boolean;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        data: {
            success: boolean;
        };
    }>;
}
