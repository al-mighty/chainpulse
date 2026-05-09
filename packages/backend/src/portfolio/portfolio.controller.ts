import { Controller, Get, Param, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Container } from 'inversify';
import { TYPES } from '@chainpulse/sdk';
import type { PortfolioService, IChainProvider, NFTAsset } from '@chainpulse/sdk';

@Controller('portfolio')
export class PortfolioController {
  constructor(
    @Inject('PortfolioService') private readonly portfolioService: PortfolioService,
    @Inject('SDK_CONTAINER') private readonly container: Container,
  ) {}

  @Get(':address')
  async getPortfolio(@Param('address') address: string) {
    try {
      return await this.portfolioService.getPortfolio(address);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed to fetch portfolio', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':address/nfts')
  async getNFTs(@Param('address') address: string) {
    const providers = this.container.getAll<IChainProvider>(TYPES.ChainProvider);
    const results = await Promise.allSettled(
      providers
        .filter((p: IChainProvider) => p.isValidAddress(address))
        .map((p: IChainProvider) => p.getNFTs(address)),
    );
    return results
      .filter((r): r is PromiseFulfilledResult<NFTAsset[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);
  }
}
