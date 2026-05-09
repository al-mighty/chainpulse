import { Controller, Get, Query, Inject } from '@nestjs/common';
import type { PriceService } from '@chainpulse/sdk';

@Controller('prices')
export class PricesController {
  constructor(@Inject('PriceService') private readonly priceService: PriceService) {}

  @Get()
  async getPrices(@Query('ids') ids = 'solana,the-open-network') {
    const idList = ids.split(',').map(s => s.trim());
    return this.priceService.getPrices(idList);
  }
}
