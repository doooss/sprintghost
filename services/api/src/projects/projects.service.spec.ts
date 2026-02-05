import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { DRIZZLE } from '../database/database.module';
import { CryptoService } from '../common/crypto/crypto.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockDb: {
    insert: jest.Mock;
    select: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let mockCryptoService: {
    encryptIfNeeded: jest.Mock;
    decryptIfNeeded: jest.Mock;
    generateSecureKey: jest.Mock;
  };

  const mockProject = {
    id: 'test-id',
    name: 'Test Project',
    description: 'Test description',
    webhookKey: 'test-webhook-key',
    githubPat: 'encrypted-pat',
    githubOwner: 'owner',
    githubRepo: 'repo',
    jiraHost: null,
    jiraEmail: null,
    jiraApiToken: null,
    jiraProjectKey: null,
    slackWebhookUrl: null,
    aiProvider: 'openai',
    aiApiKey: 'encrypted-api-key',
    aiModel: 'gpt-4',
    dodChecklist: null,
    dailyScrumEnabled: false,
    dailyScrumCron: null,
    dailyScrumTimezone: 'Asia/Seoul',
    jiraFallbackEnabled: true,
    jiraFallbackDays: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockProject]),
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    };

    mockCryptoService = {
      encryptIfNeeded: jest.fn((value) => value ? `encrypted-${value}` : null),
      decryptIfNeeded: jest.fn((value) => value ? value.replace('encrypted-', '') : null),
      generateSecureKey: jest.fn(() => 'generated-webhook-key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: DRIZZLE,
          useValue: mockDb,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a project with encrypted sensitive data', async () => {
      const dto = {
        name: 'New Project',
        githubPat: 'my-github-pat',
        aiProvider: 'openai' as const,
        aiApiKey: 'my-api-key',
      };

      await service.create(dto);

      expect(mockCryptoService.generateSecureKey).toHaveBeenCalledWith(24);
      expect(mockCryptoService.encryptIfNeeded).toHaveBeenCalledWith('my-github-pat');
      expect(mockCryptoService.encryptIfNeeded).toHaveBeenCalledWith('my-api-key');
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a project when found', async () => {
      const result = await service.findOne('test-id');
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException when project not found', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByWebhookKey', () => {
    it('should return a project when webhook key matches', async () => {
      const result = await service.findByWebhookKey('test-webhook-key');
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException when webhook key not found', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(service.findByWebhookKey('invalid-key')).rejects.toThrow(NotFoundException);
    });
  });

  describe('sanitize', () => {
    it('should remove sensitive fields and add has* flags', () => {
      const sanitized = service.sanitize(mockProject);

      expect(sanitized).not.toHaveProperty('githubPat');
      expect(sanitized).not.toHaveProperty('jiraApiToken');
      expect(sanitized).not.toHaveProperty('slackWebhookUrl');
      expect(sanitized).not.toHaveProperty('aiApiKey');

      expect(sanitized.hasGithubPat).toBe(true);
      expect(sanitized.hasJiraApiToken).toBe(false);
      expect(sanitized.hasSlackWebhookUrl).toBe(false);
      expect(sanitized.hasAiApiKey).toBe(true);
    });
  });

  describe('getDecryptedConfig', () => {
    it('should return decrypted sensitive values', () => {
      const config = service.getDecryptedConfig(mockProject);

      expect(mockCryptoService.decryptIfNeeded).toHaveBeenCalledWith('encrypted-pat');
      expect(mockCryptoService.decryptIfNeeded).toHaveBeenCalledWith('encrypted-api-key');
      expect(config).toHaveProperty('githubPat');
      expect(config).toHaveProperty('aiApiKey');
    });
  });
});
