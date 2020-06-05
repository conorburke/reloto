import { Subjects, Publisher, ExpirationCompleteEvent } from '@reloto/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}