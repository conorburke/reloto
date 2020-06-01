import mongoose, { Mongoose } from 'mongoose';
import { Password } from '../services/password';

// describes properties that are required for a new user
interface UserAttrs {
    email: string;
    password: string;
}

// describes what a user model has, get typescript to work with statics.build below
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

// describes the properties that a user document has
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    // remove the _v, password, and _ from id
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id
            delete ret.password;
            delete ret.__v;
        }
    }
});

// isModified works for first time as well, as mongoose considers it to be modified
userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}; 

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// new User({
//     email: 'test',
//     password: 'pass'
// })

// const buildUser = (attrs: userAttrs) => {
//     return new User(attrs)
// }

// export { User , buildUser };
export { User };