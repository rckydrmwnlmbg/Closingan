export declare class MailService {
    private readonly logger;
    sendOtp(to: string, otp: string): Promise<void>;
    sendPasswordReset(to: string, token: string): Promise<void>;
}
