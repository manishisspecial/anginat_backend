const RoleRepository = require('../repositories/RoleRepository');

class RoleService {
    async create(data) {
        const existing = await RoleRepository.findByName(data.name, data.institutionId);
        if (existing) {
            throw new Error('A role with this name already exists');
        }
        return await RoleRepository.create(data);
    }

    async findAll(institutionId) {
        return await RoleRepository.findAll(institutionId);
    }

    async findById(id) {
        return await RoleRepository.findById(id);
    }

    async update(id, data) {
        const role = await RoleRepository.findById(id);
        if (!role) throw new Error('Role not found');
        if (data.name && data.name !== role.name) {
            const existing = await RoleRepository.findByName(data.name, role.institutionId);
            if (existing) throw new Error('A role with this name already exists');
        }
        return await RoleRepository.update(id, data);
    }

    async delete(id) {
        const role = await RoleRepository.findById(id);
        if (!role) throw new Error('Role not found');
        return await RoleRepository.delete(id);
    }
}

module.exports = new RoleService();
