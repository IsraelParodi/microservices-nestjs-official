import { Inject, Injectable, Logger } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { WORKFLOWS_SERVICE } from '../buildings/constants';
import { ClientProxy, RmqRecord } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Outbox } from './entities/outbox.entity';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly outboxService: OutboxService,
    @Inject(WORKFLOWS_SERVICE)
    private readonly workflowsService: ClientProxy,
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutboxMessage() {
    this.logger.debug(`Processing outbox messages`);
    const messages = await this.outboxService.getUnprocessedMessages({
      target: WORKFLOWS_SERVICE.description,
      take: 100,
    });

    await Promise.all(
      messages.map(async (message) => {
        await this.dispatchWorkflowEvent(message);
        await this.outboxRepository.delete(message.id);
      }),
    );
  }

  async dispatchWorkflowEvent(outbox: Outbox) {
    const rmqRecord = new RmqRecord(outbox.payload, {
      messageId: `${outbox.id}`,
    });
    await lastValueFrom(this.workflowsService.emit(outbox.type, rmqRecord));
  }
}
