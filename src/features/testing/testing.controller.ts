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
    const createFunctionQuery = `
  CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
DECLARE
    statements CURSOR FOR
        SELECT tablename FROM pg_tables
        WHERE tableowner = username AND schemaname = 'public';
BEGIN
    FOR stmt IN statements LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

`;

    const callFunctionQuery = `
SELECT truncate_tables($1);
`;

    await this.datasourse.query(createFunctionQuery);

    await this.datasourse.query(callFunctionQuery, ['admin']);
  }
}
