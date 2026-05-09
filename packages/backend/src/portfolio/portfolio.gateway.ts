import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Subscription } from 'rxjs';
import type { StreamService } from '@chainpulse/sdk';

@WebSocketGateway({ cors: true, namespace: '/portfolio' })
export class PortfolioGateway {
  private subs = new Map<string, Subscription>();

  constructor(@Inject('StreamService') private readonly streamService: StreamService) {}

  @SubscribeMessage('subscribe')
  handleSubscribe(@MessageBody() address: string, @ConnectedSocket() client: Socket) {
    // Clean up existing sub for this client
    this.subs.get(client.id)?.unsubscribe();

    const sub = this.streamService.portfolioStream(address).subscribe({
      next: (portfolio) => client.emit('portfolio:update', portfolio),
      error: (err) => client.emit('portfolio:error', err.message),
    });

    this.subs.set(client.id, sub);
    return { event: 'subscribed', data: address };
  }

  handleDisconnect(client: Socket) {
    this.subs.get(client.id)?.unsubscribe();
    this.subs.delete(client.id);
  }
}
