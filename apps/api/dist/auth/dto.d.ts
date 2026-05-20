export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class VerifyOtpDto {
    userId: string;
    code: string;
}
export declare class ResendOtpDto {
    userId: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
