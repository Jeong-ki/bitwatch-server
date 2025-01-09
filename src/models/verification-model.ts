import { Model } from './model';

export type VerificationType = {
  id: number;
  email: string;
  verification_code: string;
  expires_at: Date;
  is_verified: boolean;
};

export class VerificationModel extends Model {
  static tableName = 'email_verifications';

  // 인증번호 생성 및 저장
  public static async createVerification(
    email: string,
    code: string,
    expiresAt: Date
  ): Promise<VerificationType> {
    return this.insert({
      email,
      verification_code: code,
      expires_at: expiresAt,
      is_verified: false,
    });
  }

  // 인증번호 가져오기
  public static findByEmail(email: string): Promise<VerificationType> {
    return this.findBy<{ email: string }, VerificationType>({ email });
  }

  // 인증 상태 업데이트
  public static async verifyEmail(email: string): Promise<void> {
    await this.updateBy<{ email: string }, { is_verified: boolean }, VerificationType>(
      { email },
      { is_verified: true }
    );
  }
}
