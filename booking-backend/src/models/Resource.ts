import mongoose, { Document, Model, Schema } from 'mongoose';

export type ResourceCategory = 'lab' | 'equipment' | 'room';

export interface IResource extends Document {
    name: string;
    description: string;
    category: ResourceCategory;
    location: string;
    capacity: number;
    requiresApproval: boolean;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        category: { type: String, enum: ['lab', 'equipment', 'room'], required: true },
        location: { type: String, required: true, trim: true },
        capacity: { type: Number, required: true, min: 1 },
        requiresApproval: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export const Resource: Model<IResource> = mongoose.model<IResource>('Resource', resourceSchema);
