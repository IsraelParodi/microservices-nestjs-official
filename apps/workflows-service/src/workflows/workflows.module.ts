import { Module } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { Workflow } from './entities/workflow.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboxModule } from '../inbox/inbox.module';
import { WorkflowsInboxProcessor } from './workflows-inbox.processor';

@Module({
  imports: [TypeOrmModule.forFeature([Workflow]), InboxModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowsInboxProcessor],
})
export class WorkflowsModule {}
