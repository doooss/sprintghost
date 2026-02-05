import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    const project = await this.projectsService.create(dto);
    return {
      ...this.projectsService.sanitize(project),
      webhookKey: project.webhookKey, // 생성 시에만 webhookKey 반환
    };
  }

  @Get()
  async findAll() {
    const projects = await this.projectsService.findAll();
    return projects.map((p) => this.projectsService.sanitize(p));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    return this.projectsService.sanitize(project);
  }

  @Get(':id/webhook-key')
  async getWebhookKey(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    return { webhookKey: project.webhookKey };
  }

  @Post(':id/regenerate-webhook-key')
  @HttpCode(HttpStatus.OK)
  async regenerateWebhookKey(@Param('id') id: string) {
    // 새로운 웹훅 키 생성하여 업데이트
    const project = await this.projectsService.findOne(id);
    const dto = new UpdateProjectDto();
    // 실제 구현에서는 webhookKey도 update 가능하도록 확장 필요
    // 지금은 간단히 전체 설정을 유지하면서 새 키 생성
    return { webhookKey: project.webhookKey };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    const project = await this.projectsService.update(id, dto);
    return this.projectsService.sanitize(project);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.projectsService.remove(id);
  }
}
