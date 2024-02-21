import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../types/types';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Post()
  postCreateOffers(
    @Body() createOfferDto: CreateOfferDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.offersService.postCreateOffers(createOfferDto, req.user.id);
  }

  @Get()
  getfindAllOffers() {
    return this.offersService.getfindAllOffers();
  }

  @Get(':id')
  getOfferById(@Param('id', ParseIntPipe) id: number) {
    return this.offersService.getOfferById(id);
  }
}
