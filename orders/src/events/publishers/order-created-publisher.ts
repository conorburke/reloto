import { Publisher, OrderCreatedEvent, Subjects } from '@reloto/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}