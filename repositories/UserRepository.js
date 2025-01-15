const User = require('../models/User');

class UserRepository {

    async findByPhone(phoneNumber) {
        return await User.findOne({ phoneNumber });
    }

    async findByEmail(email) {
        try {
            console.log(`Attempting to find user by email: ${email}`); // Log the email being queried

            // Query the database
            const user = await User.findOne({ email });

            if (!user) {
                console.error(`No user found with email: ${email}`);
                return null; // or handle this case according to your logic
            }

            console.log(`User found: ${JSON.stringify(user)}`); // Log the found user data for debugging
            return user;
        } catch (error) {
            console.error(`Error occurred while finding user by email: ${email}`, error); // Detailed error logging
            throw new Error('Error finding user by email'); // Pass a custom error up the call chain
        }
    }

    async findByUsername(username) {
        return await User.findOne({ username });
    }

    async findById(id) {
        return await User.findOne({ id });
    }

    async findByIdentifier(identifier) {
        return User.findOne({$or: [{email: identifier}, {username: identifier}]});
    }

    async updatePassword(email, updateData) {
        return User.findOneAndUpdate({email}, updateData, { new: true });
    }

    async createUser(userData) {
        const user = new User(userData);
        return await user.save();
    }
}

module.exports = new UserRepository();
