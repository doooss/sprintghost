import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              if (key === 'ENCRYPTION_SECRET') return 'test-secret-key-for-testing-12345';
              if (key === 'ENCRYPTION_SALT') return defaultValue || 'test-salt';
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const plaintext = 'Hello, World!';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext (due to random IV)', () => {
      const plaintext = 'Same text';
      const encrypted1 = service.encrypt(plaintext);
      const encrypted2 = service.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      const plaintext = '';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters', () => {
      const plaintext = '한글 テスト 特殊文字 !@#$%^&*()';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long strings', () => {
      const plaintext = 'a'.repeat(10000);
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('isEncrypted', () => {
    it('should return true for encrypted value', () => {
      const encrypted = service.encrypt('test');
      expect(service.isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(service.isEncrypted('plain text')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.isEncrypted('')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(service.isEncrypted(null as unknown as string)).toBe(false);
      expect(service.isEncrypted(undefined as unknown as string)).toBe(false);
    });
  });

  describe('encryptIfNeeded', () => {
    it('should encrypt plain text', () => {
      const plaintext = 'secret';
      const result = service.encryptIfNeeded(plaintext);

      expect(result).not.toBe(plaintext);
      expect(service.isEncrypted(result!)).toBe(true);
    });

    it('should not re-encrypt already encrypted text', () => {
      const encrypted = service.encrypt('secret');
      const result = service.encryptIfNeeded(encrypted);

      expect(result).toBe(encrypted);
    });

    it('should return null for null/undefined', () => {
      expect(service.encryptIfNeeded(null)).toBeNull();
      expect(service.encryptIfNeeded(undefined)).toBeNull();
    });
  });

  describe('decryptIfNeeded', () => {
    it('should decrypt encrypted text', () => {
      const plaintext = 'secret';
      const encrypted = service.encrypt(plaintext);
      const result = service.decryptIfNeeded(encrypted);

      expect(result).toBe(plaintext);
    });

    it('should return plain text as-is', () => {
      const plaintext = 'not encrypted';
      const result = service.decryptIfNeeded(plaintext);

      expect(result).toBe(plaintext);
    });

    it('should return null for null/undefined', () => {
      expect(service.decryptIfNeeded(null)).toBeNull();
      expect(service.decryptIfNeeded(undefined)).toBeNull();
    });
  });

  describe('generateSecureKey', () => {
    it('should generate a key of default length', () => {
      const key = service.generateSecureKey();
      expect(key).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    it('should generate a key of specified length', () => {
      const key = service.generateSecureKey(16);
      expect(key).toHaveLength(32); // 16 bytes = 32 hex chars
    });

    it('should generate unique keys', () => {
      const key1 = service.generateSecureKey();
      const key2 = service.generateSecureKey();

      expect(key1).not.toBe(key2);
    });
  });
});
