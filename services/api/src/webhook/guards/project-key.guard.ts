import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ProjectsService } from '../../projects/projects.service';

export const PROJECT_KEY_HEADER = 'x-project-key';

@Injectable()
export class ProjectKeyGuard implements CanActivate {
  constructor(private readonly projectsService: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const projectKey = request.headers[PROJECT_KEY_HEADER] as string;

    if (!projectKey) {
      throw new UnauthorizedException(`Missing ${PROJECT_KEY_HEADER} header`);
    }

    try {
      const project = await this.projectsService.findByWebhookKey(projectKey);
      // 프로젝트를 request에 저장하여 컨트롤러에서 사용 가능하도록
      (request as Request & { project: typeof project }).project = project;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid project key');
    }
  }
}
