const Role = require('../models/Role');

class RoleRepository {
    async create(data) {
        const role = new Role(data);
        return await role.save();
    }

    async findAll(institutionId) {
        return await Role.find({ institutionId }).sort({ createdAt: -1 }).lean();
    }

    async findById(id) {
        return await Role.findById(id).lean();
    }

    async update(id, data) {
        return await Role.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    }

    async delete(id) {
        return await Role.findByIdAndDelete(id);
    }

    async findByName(name, institutionId) {
        return await Role.findOne({ name: new RegExp(`^${name}$`, 'i'), institutionId }).lean();
    }
}

module.exports = new RoleRepository();
