import { Publisher , Subjects, ToolDeletedEvent } from '@reloto/common';

export class ToolDeletedPublisher extends Publisher<ToolDeletedEvent> {
    subject: Subjects.ToolDeleted = Subjects.ToolDeleted;
}