const User = require('../models/User');

class UserRepository {
    async findByPhone(phoneNumber) {
        return await User.findOne({ phoneNumber });
    }

    async findByEmail(email) {


            // Query the database
            const user = await User.findOne({ email });

            return user;
 
    }

    async findByUsername(username) {
        return await User.findOne({ username });
    }

    async findById(id) {
        return await User.findById(id); // Fixed to use findById
    }

    async findByIdentifier(identifier) {
        return await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    }

    async updatePassword(email, updateData, options = {}) {
        return await User.findOneAndUpdate({ email }, updateData, { new: true, ...options });
    }

    async updateDetails(institutionId, updateData) {
        return await User.findOneAndUpdate({ institutionId }, updateData, { new: true });
    }

    async createUser(userData, options = {}) {
        const user = new User(userData);
        return await user.save(options);
    }
}

module.exports = new UserRepository();