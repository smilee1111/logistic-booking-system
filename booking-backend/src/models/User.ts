import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../config';

export interface IUser extends Document {
    fullName: string;
    email: string;
    username: string;
    password?: string;
    role: 'user' | 'admin';
    phoneNumber?: string;
    authProvider: 'local' | 'google';
    googleId?: string;
    mfaEnabled: boolean;
    mfaSecret?: string;
    mfaBackupCodeHashes: string[];
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
        // Required for local accounts, absent for Google-only accounts — enforced in
        // the register validator/service, not the schema, since Mongoose can't express
        // "required unless authProvider is google" declaratively.
        password: { type: String, select: false },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        phoneNumber: { type: String, trim: true },
        authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
        // sparse: only Google-linked accounts have this, so it can't collide on null.
        googleId: { type: String, unique: true, sparse: true, select: false },
        mfaEnabled: { type: Boolean, default: false },
        mfaSecret: { type: String, select: false },
        mfaBackupCodeHashes: { type: [String], default: [], select: false },
        failedLoginAttempts: { type: Number, default: 0 },
        lockoutUntil: { type: Date, default: null },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
    if (!this.password) return Promise.resolve(false);
    return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        Reflect.deleteProperty(ret, 'password');
        Reflect.deleteProperty(ret, 'mfaSecret');
        Reflect.deleteProperty(ret, 'mfaBackupCodeHashes');
        Reflect.deleteProperty(ret, '__v');
        return ret;
    },
});

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
