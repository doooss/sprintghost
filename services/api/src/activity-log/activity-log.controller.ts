import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ActivityLogService, EventType, ActivityStatus } from './activity-log.service';

@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('eventType') eventType?: EventType,
    @Query('status') status?: ActivityStatus,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.activityLogService.findAll({
      projectId,
      eventType,
      status,
      limit,
      offset,
    });
  }

  @Get('project/:projectId')
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    return this.activityLogService.findByProject(projectId, limit);
  }

  @Get('project/:projectId/stats')
  async getStats(
    @Param('projectId') projectId: string,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days?: number,
  ) {
    return this.activityLogService.getStats(projectId, days);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activityLogService.findOne(id);
  }
}
