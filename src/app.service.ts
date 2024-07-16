import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@Inject('NATS') private readonly client: ClientProxy) {}

  async sendResetPasswordEmail(email: string) {
    return this.client
      .send<string, { email: string }>('mail/send-reset-password', { email })
      .toPromise();
  }
}
