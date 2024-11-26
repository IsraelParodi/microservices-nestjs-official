import { Module } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inbox } from './entities/inbox.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Inbox])],
  providers: [InboxService],
  exports: [TypeOrmModule, InboxService],
})
export class InboxModule {}
