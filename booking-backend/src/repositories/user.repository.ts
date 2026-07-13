import { IUser, User } from '../models/User';

export const userRepository = {
    existsByEmailOrUsername(email: string, username: string) {
        return User.exists({ $or: [{ email }, { username }] });
    },

    create(data: Pick<IUser, 'fullName' | 'email' | 'username' | 'password' | 'phoneNumber'>) {
        return User.create(data);
    },

    findByEmailWithSecrets(email: string) {
        return User.findOne({ email }).select('+password');
    },

    findById(id: string) {
        return User.findById(id);
    },

    updateById(id: string, data: Partial<Pick<IUser, 'fullName' | 'phoneNumber'>>) {
        return User.findByIdAndUpdate(id, data, { new: true });
    },

    list() {
        return User.find();
    },

    updateRole(id: string, role: 'user' | 'admin') {
        return User.findByIdAndUpdate(id, { role }, { new: true });
    },
};
