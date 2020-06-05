import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

import { Order, OrderStatus } from './order';

interface ToolAttrs {
    id: string;
    title: string;
    price: number;
}

export interface ToolDoc extends mongoose.Document {
    version: number;
    title: string;
    price: number;
    isReserved(): Promise<boolean>;
}

interface ToolModel extends mongoose.Model<ToolDoc> {
    build(attrs: ToolAttrs): ToolDoc;
    // could be named findByIdAndPreviousEvent
    findByEvent(event: { id: string, version: number }): Promise<ToolDoc | null>;
}

const toolSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

toolSchema.set('versionKey', 'version');
toolSchema.plugin(updateIfCurrentPlugin);

// statics is where you add class methods
toolSchema.statics.build = (attrs: ToolAttrs) => {
    // have to do attributes one be one to set id correctly
    // return new Tool(attrs);
    return new Tool({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
}

toolSchema.statics.findByEvent = (event: { id: string, version: number}) => {
    return Tool.findOne({
        _id: event.id,
        version: event.version - 1
    });
}


toolSchema.methods.isReserved = async function() {
    // this  is the tool document that we called 'isReserved' on
    
    const existingOrder = await Order.findOne({
        tool: this,
        status: {
            $in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete]
        }
    })

    // bang bang to return boolean
    return !!existingOrder;
}

// the 'Tool' string is the name of the collection
const Tool = mongoose.model<ToolDoc, ToolModel>('Tool', toolSchema);

export { Tool };