import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Project } from '../../database/schema';

export const CurrentProject = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Project => {
    const request = ctx.switchToHttp().getRequest<Request & { project: Project }>();
    return request.project;
  },
);
