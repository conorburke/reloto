import { Publisher , Subjects, ToolCreatedEvent } from '@reloto/common';

export class ToolCreatedPublisher extends Publisher<ToolCreatedEvent> {
    subject: Subjects.ToolCreated = Subjects.ToolCreated;
}