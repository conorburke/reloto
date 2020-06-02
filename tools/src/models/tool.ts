import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface ToolAttrs {
    title: string;
    category: string;
    description: string;
    price: number;
    address1: string;
    address2: string;
    city: string;
    region: string;
    zipcode: string;
    ownerId: string;
}

// the document has fields added by mongoose, such as __v and createdat
// we added version to account for the fact that we are using that field name instead of __v
interface ToolDoc extends mongoose.Document {
    version: number;
    title: string;
    category: string;
    description: string;
    price: number;
    address1: string;
    address2: string;
    city: string;
    region: string;
    zipcode: string;
    ownerId: string;
    orderId?: string;
}

interface ToolModel extends mongoose.Model<ToolDoc>{
    build(attrs: ToolAttrs): ToolDoc;
}

const toolSchema = new mongoose.Schema({
    title: {
        // this is mongoose string, not ts string
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    address1: {
        type: String,
        required: true
    },
    address2: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        required: true
    },
    ownerId: {
        type: String,
        required: true
    },

    //TODO check how to handle this
    orderId: {
        type: String
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
});

// use versioning control to handle concurrency issues for updates
// also, use key 'version' instead of default '__v'
toolSchema.set('versionKey', 'version')
toolSchema.plugin(updateIfCurrentPlugin);

toolSchema.statics.build = (attrs: ToolAttrs) => {
    return new Tool(attrs);
}

const Tool = mongoose.model<ToolDoc, ToolModel>('Ticket', toolSchema);

export { Tool };



