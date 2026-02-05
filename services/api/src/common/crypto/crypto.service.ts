import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;

@Injectable()
export class CryptoService {
  private readonly masterKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('ENCRYPTION_SECRET');
    if (!secret) {
      throw new Error('ENCRYPTION_SECRET is required');
    }

    // 마스터 키 생성 (scrypt를 사용하여 안전하게 키 파생)
    const salt = this.configService.get<string>('ENCRYPTION_SALT', 'sprintghost-default-salt');
    this.masterKey = scryptSync(secret, salt, KEY_LENGTH);
  }

  /**
   * 문자열 암호화 (AES-256-GCM)
   * 반환 형식: iv:authTag:encryptedData (모두 hex)
   */
  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.masterKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * 문자열 복호화
   */
  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, this.masterKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  }

  /**
   * 안전한 랜덤 문자열 생성 (웹훅 키 등에 사용)
   */
  generateSecureKey(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * 값이 암호화되어 있는지 확인
   */
  isEncrypted(value: string): boolean {
    if (!value) return false;
    const parts = value.split(':');
    if (parts.length !== 3) return false;

    // IV (32 hex chars) : AuthTag (32 hex chars) : EncryptedData
    return parts[0].length === IV_LENGTH * 2 && parts[1].length === AUTH_TAG_LENGTH * 2;
  }

  /**
   * 조건부 암호화 (이미 암호화된 경우 건너뜀)
   */
  encryptIfNeeded(value: string | null | undefined): string | null {
    if (!value) return null;
    if (this.isEncrypted(value)) return value;
    return this.encrypt(value);
  }

  /**
   * 조건부 복호화 (암호화되지 않은 경우 원본 반환)
   */
  decryptIfNeeded(value: string | null | undefined): string | null {
    if (!value) return null;
    if (!this.isEncrypted(value)) return value;
    return this.decrypt(value);
  }
}
