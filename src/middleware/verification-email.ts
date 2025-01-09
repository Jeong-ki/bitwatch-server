import nodemailer from 'nodemailer';

export const sendEmail = async (recipientEmail: string, message: string): Promise<void> => {
  try {
    // SMTP 설정
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // 이메일 서비스 제공자 (Gmail 예시)
      port: 587, // SMTP 포트 (TLS 사용)
      secure: false, // TLS 사용 여부
      auth: {
        user: process.env.EMAIL, // SMTP 사용자명 (이메일 주소)
        pass: process.env.GMAIL_PW, // SMTP 비밀번호 또는 앱 비밀번호
      },
    });

    // 이메일 옵션 설정
    const mailOptions = {
      from: '"BitWatch" <gisuu9@gmail.com>', // 발신자 정보
      to: recipientEmail, // 수신자 이메일
      subject: 'BitWatch 이메일 인증번호', // 이메일 제목
      text: message, // 이메일 본문 (텍스트)
    };

    // 이메일 전송
    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('이메일 전송 중 문제가 발생했습니다.');
  }
};
