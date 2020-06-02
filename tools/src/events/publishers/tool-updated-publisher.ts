import { Publisher , Subjects, ToolUpdatedEvent } from '@reloto/common';

export class ToolUpdatedPublisher extends Publisher<ToolUpdatedEvent> {
    subject: Subjects.ToolUpdated = Subjects.ToolUpdated;
}