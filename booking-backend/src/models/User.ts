import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../config';

export interface IUser extends Document {
    fullName: string;
    email: string;
    username: string;
    password: string;
    role: 'user' | 'admin';
    phoneNumber: string;
    mfaEnabled: boolean;
    mfaSecret?: string;
    failedLoginAttempts: number;
    lockoutUntil: Date | null;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        username: { type: String, required: true, unique: true, trim: true, index: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        phoneNumber: { type: String, required: true, trim: true },
        mfaEnabled: { type: Boolean, default: false },
        mfaSecret: { type: String, select: false },
        failedLoginAttempts: { type: Number, default: 0 },
        lockoutUntil: { type: Date, default: null },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
    return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        Reflect.deleteProperty(ret, 'password');
        Reflect.deleteProperty(ret, 'mfaSecret');
        Reflect.deleteProperty(ret, '__v');
        return ret;
    },
});

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
