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
import { WishlistsService } from './wishlists.service';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/types/types';

@Controller('wishlistlists')
@UseGuards(JwtAuthGuard)
export class WishlistsController {
  constructor(private wishlistsService: WishlistsService) {}

  @Post()
  postCreateWishlists(
    @Body() createWishlistsDto: CreateWishlistDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.wishlistsService.postCreateWishlists(
      createWishlistsDto,
      req.user.id,
    );
  }

  @Get()
  getfindAllWishlists() {
    return this.wishlistsService.getfindAllWishlists();
  }

  @Get(':id')
  getfindByWishlists(@Param('id', ParseIntPipe) id: number) {
    return this.wishlistsService.getfindByWishlists(id);
  }

  @Patch(':id')
  patchUpdateByWishlists(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishlistsDto: UpdateWishlistDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.wishlistsService.patchUpdateByWishlists(
      id,
      updateWishlistsDto,
      req.user.id,
    );
  }

  @Delete(':id')
  deleteByWishlists(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.wishlistsService.deleteByWishlists(id, req.user.id);
  }
}
