import { Controller, Delete, HttpCode } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private datasourse: DataSource) {}

  @ApiOperation({ summary: 'Delete all data' }) //swagger
  @ApiNoContentResponse({ description: 'All data is deleted' }) //swagger
  @Delete('all-data')
  @HttpCode(204)
  async removeAll() {
    const query = `
    DELETE FROM confirmation_email;
    DELETE FROM password_recovery;
    DELETE FROM security_devices;

    DELETE FROM likes;

    DELETE FROM comments;
    DELETE FROM posts;
    DELETE FROM blogs;

    DELETE FROM users; 

  `;

    await this.datasourse.query(query);
  }
}
