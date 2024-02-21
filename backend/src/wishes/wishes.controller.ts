import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('wishes')
export class WishesController {
  constructor(private wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createWishDto: CreateWishDto, @Req() req) {
    return this.wishesService.create(createWishDto, req.user.id);
  }

  @Get('last')
  getWishesLast() {
    return this.wishesService.getWishesLast();
  }

  @Get('top')
  getWishesTop() {
    return this.wishesService.getWishesTop();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getfindByWishes(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.getfindByWishes(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  patchUpdateByWishes(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishDto: UpdateWishDto,
    @Req() req,
  ) {
    return this.wishesService.patchUpdateByWishes(
      id,
      updateWishDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteOneWish(@Param('id', ParseIntPipe) wishId: number) {
    return this.wishesService.deleteOneWish(wishId);
  }

  @Post(':id/copy')
  @UseGuards(JwtAuthGuard)
  postCopyWish(@Param('id') wishId: number, @Req() req) {
    return this.wishesService.postCopyWish(wishId, req.user.id);
  }
}
