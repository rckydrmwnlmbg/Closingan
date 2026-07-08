import type { Request } from 'express';
import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateUserDto, ChangePasswordDto } from './users.dto';
import { ResponseBuilder } from '../../common/helpers/response.builder';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: Request & { user: { id: string } }) {
    const user = await this.usersService.getMe(req.user.id);
    return ResponseBuilder.success(user);
  }

  @Patch('me')
  async updateMe(
    @Req() req: Request & { user: { id: string } },
    @Body() updateDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateMe(req.user.id, updateDto);
    return ResponseBuilder.success(user);
  }

  @Post('me/change-password')
  async changePassword(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(req.user.id, dto);
    return ResponseBuilder.success({ success: true });
  }
}
