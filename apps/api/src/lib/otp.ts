import { generateSecret, generate, verify } from "otplib";

export const otp = {
  generateSecret: (): string => {
    return generateSecret();
  },
  generateCode: async (secret: string): Promise<string> => {
    return generate({ secret });
  },
  verifyCode: async (code: string, secret: string): Promise<boolean> => {
    const result = await verify({ token: code, secret });
    return result.valid;
  },
  generateNumericCode: (length: number = 6): string => {
    return Math.floor(
      Math.pow(10, length - 1) +
        Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1),
    ).toString();
  },
};
