// // src/common/crypto/crypto.service.ts
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as crypto from 'crypto';

// @Injectable()
// export class CryptoService {
//   private readonly algorithm = 'aes-256-cbc';
//   private readonly ivLength = 16;
//   private readonly key: Buffer;
//   constructor(private configService: ConfigService) {
//     const secret = this.configService.get<string>('qrSecret');
//     if (!secret) throw new Error('Missing QR_SECRET');

//     this.key = Buffer.from(secret, 'utf8');
//   }

//   encrypt(plainText: string): string {
//     const iv = crypto.randomBytes(this.ivLength);
//     const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
//     let encrypted = cipher.update(plainText, 'utf8', 'base64');
//     encrypted += cipher.final('base64');
//     const finalEncrypted = iv.toString('base64') + ':' + encrypted;
//     return encodeURIComponent(finalEncrypted);
//   }

//   decrypt(cipherText: string): string {
//     cipherText = decodeURIComponent(cipherText);
//     const [ivBase64, encryptedData] = cipherText.split(':');
//     const iv = Buffer.from(ivBase64, 'base64');
//     const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
//     let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
//     decrypted += decipher.final('utf8');
//     return decrypted;
//   }
// }
import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly ivLength = 16;
  private readonly key: Buffer;
  private readonly prefix = 'QR-SYSTEM:';

  constructor(private configService: ConfigService) {
    const secret = this.configService.get<string>('qrSecret');
    if (!secret) throw new Error('Missing QR_SECRET');
    this.key = Buffer.from(secret, 'utf8');
  }

  private isAsciiOnly(str: string): boolean {
    return /^[\x00-\x7F]+$/.test(str);
  }

  private base64UrlEncode(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private base64UrlDecode(str: string): Buffer {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4 !== 0) str += '=';
    return Buffer.from(str, 'base64');
  }

  encrypt(plainText: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);
    const combined = Buffer.concat([iv, encrypted]);
    return this.base64UrlEncode(combined);
  }

  decrypt(cipherText: string): string {
    if (!this.isAsciiOnly(cipherText)) {
      throw new Error('Input contains non-ASCII characters (e.g., Thai)');
    }

    const combined = this.base64UrlDecode(cipherText);
    const iv = combined.subarray(0, this.ivLength);
    const encrypted = combined.subarray(this.ivLength);
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }
}
