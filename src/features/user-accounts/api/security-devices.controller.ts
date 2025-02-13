import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { PaginatedUserViewDto } from '../../../core/dto/base.paginated.view-dto';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerAuthStatus } from '../../../core/decorators/swagger/swagger-options';
import { SwaggerGet } from '../../../core/decorators/swagger/swagger-get';
import { CommandBus } from '@nestjs/cqrs';
import { SecurityDevicesQueryRepository } from '../infrastructure/security-devices/security-devices.query-repository';
import { DeviceViewDto } from '../dto/security-devices/device-view.dto';
import { JwtRefreshAuthPassportGuard } from '../../../core/guards/passport/jwt-refresh-passport.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/param/extract-user-from-request';
import { UserJwtPayloadDto } from '../dto/users/user-jwt-payload.dto';
import { DeleteSecurityDeviceCommand } from '../application/usecases/security-devices/delete-device.usecase';
import { DeleteOtherSecurityDevicesCommand } from '../application/usecases/security-devices/delete-devices.usecase';

@ApiTags('SecurityDevices') //swagger
@UseGuards(JwtRefreshAuthPassportGuard)
@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @SwaggerGet('Get all security devices', PaginatedUserViewDto, SwaggerAuthStatus.WithAuth)
  // @UseGuards(JwtRefreshAuthPassportGuard)
  @Get()
  getSecurityDevices(@ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<DeviceViewDto[]> {
    console.log("user", user);
    const users = this.securityDevicesQueryRepository.findSecurityDevices(user.userId);

    return users;
  }

  //   @SwaggerDelete('Delete a device by id', 'Device ID')
  // @UseGuards(JwtRefreshAuthPassportGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(@Param('id') id: string, @ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<void> {

    await this.commandBus.execute<DeleteSecurityDeviceCommand, void>(new DeleteSecurityDeviceCommand(user.userId, id));
  }

  // @SwaggerDelete('Delete a user by ID', 'User ID')
  // @UseGuards(JwtRefreshAuthPassportGuard)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOtherDevices(@ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<void> {
    await this.commandBus.execute<DeleteOtherSecurityDevicesCommand, void>(new DeleteOtherSecurityDevicesCommand(user));
  }
}
