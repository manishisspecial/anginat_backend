const UserRepository = require('../repositories/UserRepository');
const bcrypt = require('bcryptjs');

class UserService {
    async createUser(userData, options = {}) {
        try {
            // Validate name for instructors
            if (userData.role === 'instructor' && !userData.name) {
                throw new Error('Name is required for instructors');
            }
            // Validate institutionId for specific roles
            if (['instructor', 'admin', 'super-admin'].includes(userData.role) && !userData.institutionId) {
                throw new Error('Institution ID is required for this role');
            }
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashedPassword;
            return await UserRepository.createUser(userData, options);
        } catch (error) {
            console.error("Error creating user:", error.message || error);
            throw error; // Let controller handle specific error messages
        }
    }

    async findById(id) {
        try {
            return await UserRepository.findById(id);
        } catch (error) {
            console.error("Error finding user by id:", error.message || error);
            throw new Error('Error finding user by id');
        }
    }

    async updatePassword(email, newPassword) {
        try {
            const user = await UserRepository.findByEmail(email);
            if (!user) {
                throw new Error("User not found");
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            // Use runValidators: false to avoid validation issues for existing users
            return await UserRepository.updatePassword(email, { password: hashedPassword }, { runValidators: false });
        } catch (error) {
            console.error("Error updating password:", error.message || error);
            throw error;
        }
    }

    async login(emailOrUsername, password) {
        try {
            const user = await UserRepository.findByEmail(emailOrUsername) ||
                await UserRepository.findByUsername(emailOrUsername);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return null;
            }
            return user;
        } catch (error) {
            console.error("Error during login:", error.message || error);
            throw new Error('Error during login');
        }
    }

    async findByEmail(email) {
        try {
            return await UserRepository.findByEmail(email);
        } catch (error) {
            console.error("Error finding user by email:", error.message || error);
            throw new Error('Error finding user by email');
        }
    }

    async findByUsername(username) {
        try {
            return await UserRepository.findByUsername(username);
        } catch (error) {
            console.error("Error finding user by username:", error.message || error);
            throw new Error('Error finding user by username');
        }
    }

    async findByPhone(phoneNumber) {
        try {
            return await UserRepository.findByPhone(phoneNumber);
        } catch (error) {
            console.error("Error finding user by phone:", error.message || error);
            throw new Error('Error finding user by phone');
        }
    }
}

module.exports = new UserService();