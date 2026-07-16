import mongoose from 'mongoose';
import { LOCAL_DATABASE_URI } from '../src/config';

export async function connectTestDb(): Promise<void> {
    await mongoose.connect(LOCAL_DATABASE_URI);
}

export async function disconnectTestDb(): Promise<void> {
    await mongoose.connection.close();
}

export async function clearTestDb(): Promise<void> {
    const { collections } = mongoose.connection;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}
