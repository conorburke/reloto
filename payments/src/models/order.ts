import mongoose from 'mongoose';
// this import makes sure we process events in correct order
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@reloto/common';

interface OrderAttrs {
    id: string;
    version: number;
    customerId: string;
    price: number;
    status: OrderStatus;
};

interface OrderDoc extends mongoose.Document {
    version: number;
    customerId: string;
    price: number;
    status: OrderStatus;
};

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
};

const orderSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus)
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

// these are used to make sure events happen in correct order based on the 'version' property
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        price: attrs.price,
        customerId: attrs.customerId,
        status: attrs.status
    })
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };