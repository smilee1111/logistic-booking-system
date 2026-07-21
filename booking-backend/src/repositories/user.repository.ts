import { IUser, User } from '../models/User';

export const userRepository = {
    existsByEmailOrUsername(email: string, username: string) {
        return User.exists({ $or: [{ email }, { username }] });
    },

    existsByUsername(username: string) {
        return User.exists({ username });
    },

    create(data: Pick<IUser, 'fullName' | 'email' | 'username' | 'password' | 'phoneNumber'>) {
        return User.create(data);
    },

    findByEmail(email: string) {
        return User.findOne({ email });
    },

    createGoogleUser(data: Pick<IUser, 'fullName' | 'email' | 'username' | 'googleId'>) {
        return User.create({ ...data, authProvider: 'google' });
    },

    linkGoogleId(id: string, googleId: string) {
        return User.findByIdAndUpdate(id, { googleId }, { new: true });
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

    findByIdWithMfaSecrets(id: string) {
        return User.findById(id).select('+mfaSecret +mfaBackupCodeHashes');
    },

    setMfaSecret(id: string, encryptedSecret: string) {
        return User.findByIdAndUpdate(id, { mfaSecret: encryptedSecret }, { new: true });
    },

    enableMfa(id: string, backupCodeHashes: string[]) {
        return User.findByIdAndUpdate(id, { mfaEnabled: true, mfaBackupCodeHashes: backupCodeHashes }, { new: true });
    },

    updateBackupCodeHashes(id: string, hashes: string[]) {
        return User.findByIdAndUpdate(id, { mfaBackupCodeHashes: hashes });
    },
};
