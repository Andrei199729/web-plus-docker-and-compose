import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../types/types';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('me')
  getUserRequest(@Req() req: AuthenticatedRequest) {
    return this.usersService.getUserRequest(req.user.id);
  }

  @Get('me/wishes')
  getUserRequestWishes(@Req() req: AuthenticatedRequest) {
    return this.usersService.getUserRequestWishes(req.user.id);
  }

  @Get(':username')
  getUserByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  @Get(':username/wishes')
  getUserByUsernameWishes(@Param('username') username: string) {
    return this.usersService.getUserByUsernameWishes(username);
  }

  @Patch('me')
  updateUserRequest(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.updateUserRequest(req.user.id, updateUserDto);
  }

  @Post('find')
  findManyUsers(@Body('query') query: string) {
    return this.usersService.findManyUsers(query);
  }
}
