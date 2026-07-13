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
};
