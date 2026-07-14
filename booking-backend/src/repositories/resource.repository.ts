import { IResource, Resource } from '../models/Resource';

type ResourceCreateData = Pick<
    IResource,
    'name' | 'description' | 'category' | 'location' | 'capacity' | 'requiresApproval' | 'isActive'
> & { createdBy: string };

type ResourceUpdateData = Partial<
    Pick<IResource, 'name' | 'description' | 'category' | 'location' | 'capacity' | 'requiresApproval' | 'isActive'>
>;

export const resourceRepository = {
    create(data: ResourceCreateData) {
        return Resource.create(data);
    },

    findById(id: string) {
        return Resource.findById(id);
    },

    list() {
        return Resource.find();
    },

    updateById(id: string, data: ResourceUpdateData) {
        return Resource.findByIdAndUpdate(id, data, { new: true });
    },

    deleteById(id: string) {
        return Resource.findByIdAndDelete(id);
    },
};
