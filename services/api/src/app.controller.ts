import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { ApiResponse } from '@repo/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): ApiResponse<string> {
    return {
      success: true,
      data: this.appService.getHello(),
    };
  }

  @Get('health')
  healthCheck(): ApiResponse<{ status: string }> {
    return {
      success: true,
      data: { status: 'ok' },
    };
  }
}
