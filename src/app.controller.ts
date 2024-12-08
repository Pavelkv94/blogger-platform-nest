import { Controller, Delete } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Delete("/testing/all-data")
  clearDb(): string {
    
    return this.appService.getHello();
  }
}
