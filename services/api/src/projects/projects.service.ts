import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { projects, Project, NewProject } from '../database/schema';
import { CryptoService } from '../common/crypto/crypto.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const id = nanoid();
    const webhookKey = this.cryptoService.generateSecureKey(24);

    const newProject: NewProject = {
      id,
      name: dto.name,
      description: dto.description,
      webhookKey,

      // 민감 정보 암호화
      githubPat: this.cryptoService.encryptIfNeeded(dto.githubPat),
      githubOwner: dto.githubOwner,
      githubRepo: dto.githubRepo,

      jiraHost: dto.jiraHost,
      jiraEmail: dto.jiraEmail,
      jiraApiToken: this.cryptoService.encryptIfNeeded(dto.jiraApiToken),
      jiraProjectKey: dto.jiraProjectKey,

      slackWebhookUrl: this.cryptoService.encryptIfNeeded(dto.slackWebhookUrl),

      aiProvider: dto.aiProvider,
      aiApiKey: this.cryptoService.encryptIfNeeded(dto.aiApiKey),
      aiModel: dto.aiModel,

      dodChecklist: dto.dodChecklist ? JSON.stringify(dto.dodChecklist) : null,

      dailyScrumEnabled: dto.dailyScrumEnabled ?? false,
      dailyScrumCron: dto.dailyScrumCron,
      dailyScrumTimezone: dto.dailyScrumTimezone ?? 'Asia/Seoul',

      jiraFallbackEnabled: dto.jiraFallbackEnabled ?? true,
      jiraFallbackDays: dto.jiraFallbackDays ?? 7,
    };

    await this.db.insert(projects).values(newProject);

    return this.findOne(id);
  }

  async findAll(): Promise<Project[]> {
    return this.db.select().from(projects);
  }

  async findOne(id: string): Promise<Project> {
    const result = await this.db.select().from(projects).where(eq(projects.id, id));

    if (result.length === 0) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return result[0];
  }

  async findByWebhookKey(webhookKey: string): Promise<Project> {
    const result = await this.db
      .select()
      .from(projects)
      .where(eq(projects.webhookKey, webhookKey));

    if (result.length === 0) {
      throw new NotFoundException('Project not found');
    }

    return result[0];
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    // 먼저 프로젝트 존재 여부 확인
    await this.findOne(id);

    const updateData: Partial<NewProject> = {
      updatedAt: new Date(),
    };

    // 기본 필드
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;

    // GitHub 설정
    if (dto.githubPat !== undefined) {
      updateData.githubPat = this.cryptoService.encryptIfNeeded(dto.githubPat);
    }
    if (dto.githubOwner !== undefined) updateData.githubOwner = dto.githubOwner;
    if (dto.githubRepo !== undefined) updateData.githubRepo = dto.githubRepo;

    // Jira 설정
    if (dto.jiraHost !== undefined) updateData.jiraHost = dto.jiraHost;
    if (dto.jiraEmail !== undefined) updateData.jiraEmail = dto.jiraEmail;
    if (dto.jiraApiToken !== undefined) {
      updateData.jiraApiToken = this.cryptoService.encryptIfNeeded(dto.jiraApiToken);
    }
    if (dto.jiraProjectKey !== undefined) updateData.jiraProjectKey = dto.jiraProjectKey;

    // Slack 설정
    if (dto.slackWebhookUrl !== undefined) {
      updateData.slackWebhookUrl = this.cryptoService.encryptIfNeeded(dto.slackWebhookUrl);
    }

    // AI 설정
    if (dto.aiProvider !== undefined) updateData.aiProvider = dto.aiProvider;
    if (dto.aiApiKey !== undefined) {
      updateData.aiApiKey = this.cryptoService.encryptIfNeeded(dto.aiApiKey);
    }
    if (dto.aiModel !== undefined) updateData.aiModel = dto.aiModel;

    // DOD 설정
    if (dto.dodChecklist !== undefined) {
      updateData.dodChecklist = JSON.stringify(dto.dodChecklist);
    }

    // 데일리 스크럼 설정
    if (dto.dailyScrumEnabled !== undefined) updateData.dailyScrumEnabled = dto.dailyScrumEnabled;
    if (dto.dailyScrumCron !== undefined) updateData.dailyScrumCron = dto.dailyScrumCron;
    if (dto.dailyScrumTimezone !== undefined) updateData.dailyScrumTimezone = dto.dailyScrumTimezone;

    // Jira 스프린트 Fallback 설정
    if (dto.jiraFallbackEnabled !== undefined) updateData.jiraFallbackEnabled = dto.jiraFallbackEnabled;
    if (dto.jiraFallbackDays !== undefined) updateData.jiraFallbackDays = dto.jiraFallbackDays;

    await this.db.update(projects).set(updateData).where(eq(projects.id, id));

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.db.delete(projects).where(eq(projects.id, id));
  }

  /**
   * 민감 정보를 제외한 프로젝트 정보 반환
   */
  sanitize(project: Project): Omit<Project, 'githubPat' | 'jiraApiToken' | 'slackWebhookUrl' | 'aiApiKey'> & {
    hasGithubPat: boolean;
    hasJiraApiToken: boolean;
    hasSlackWebhookUrl: boolean;
    hasAiApiKey: boolean;
  } {
    const { githubPat, jiraApiToken, slackWebhookUrl, aiApiKey, ...rest } = project;

    return {
      ...rest,
      hasGithubPat: !!githubPat,
      hasJiraApiToken: !!jiraApiToken,
      hasSlackWebhookUrl: !!slackWebhookUrl,
      hasAiApiKey: !!aiApiKey,
    };
  }

  /**
   * 복호화된 설정 값 가져오기 (내부 사용)
   */
  getDecryptedConfig(project: Project) {
    return {
      githubPat: this.cryptoService.decryptIfNeeded(project.githubPat),
      jiraApiToken: this.cryptoService.decryptIfNeeded(project.jiraApiToken),
      slackWebhookUrl: this.cryptoService.decryptIfNeeded(project.slackWebhookUrl),
      aiApiKey: this.cryptoService.decryptIfNeeded(project.aiApiKey),
    };
  }
}
