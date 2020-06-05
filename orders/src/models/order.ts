import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { OrderStatus } from '@reloto/common';

import { ToolDoc } from './tool';

interface OrderAttrs {
    customerId: string;
    status: OrderStatus;
    expiresAt: Date;
    tool: ToolDoc;
}

// we have these two interface, above and below, because attributes that are used to create an order could be different 
// that those that end up on an order
interface OrderDoc extends mongoose.Document {
    customerId: string;
    status: OrderStatus;
    expiresAt: Date;
    tool: ToolDoc;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
    customerId: {
        // mongo String, not ts string
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        // default is not necessary but doesn't hurt
        default: OrderStatus.Created
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date
    },
    tool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tool'
    }
}, {
    // change the _id of mongo to just id
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs);
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order , OrderStatus };

