import { Subjects, Publisher, PaymentCreatedEvent } from '@reloto/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}