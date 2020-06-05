import { Publisher, OrderCancelledEvent, Subjects } from '@reloto/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}