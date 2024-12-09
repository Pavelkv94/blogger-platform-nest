import { Controller, Delete } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Clear database' }) //swagger
  @ApiResponse({ status: 204 }) //swagger
  @Delete('/testing/all-data')
  clearDb(): string {
    
    return this.appService.getHello();
  }
}
