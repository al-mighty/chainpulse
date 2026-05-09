import { Controller, Get, Param, HttpException, HttpStatus, Inject } from '@nestjs/common';
import type { PortfolioService } from '@chainpulse/sdk';

@Controller('portfolio')
export class PortfolioController {
  constructor(@Inject('PortfolioService') private readonly portfolioService: PortfolioService) {}

  @Get(':address')
  async getPortfolio(@Param('address') address: string) {
    try {
      return await this.portfolioService.getPortfolio(address);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed to fetch portfolio', HttpStatus.BAD_REQUEST);
    }
  }
}
