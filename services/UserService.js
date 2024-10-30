// services/UserService.js
const UserRepository = require('../repositories/UserRepository');
const bcrypt = require('bcryptjs');

class UserService {
    async createUser(userData) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashedPassword;
            return await UserRepository.createUser(userData);
        } catch (error) {
            console.error("Error creating user:", error.message || error);
            throw new Error('Error creating user');
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
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return UserRepository.updatePassword(email, { password: hashedPassword });
    }

    async login(emailOrUsername, password) {
        const user = await UserRepository.findByEmail(emailOrUsername) ||
            await UserRepository.findByUsername(emailOrUsername);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return null;
        }
        return user;
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
            console.error("Error finding user by usernname:", error.message || error);
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
