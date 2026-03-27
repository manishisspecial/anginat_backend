const RoleService = require('../services/RoleService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');

class RoleController {
    async create(req, res) {
        try {
            const institutionId = req.user?.institutionId || req.user?.institution;
            if (!institutionId) {
                return sendErrorResponse(res, "Institution context missing", 401);
            }
            const { name, type, status } = req.body;
            if (!name) {
                return sendErrorResponse(res, "Role name is required", 400);
            }
            const role = await RoleService.create({
                name,
                type: type || name,
                status: (status || 'ACTIVE').toUpperCase(),
                institutionId,
                createdBy: req.user.id
            });
            return sendSuccessResponse(res, "Role created successfully", role);
        } catch (error) {
            const status = error.message.includes('already exists') ? 400 : 500;
            return sendErrorResponse(res, error.message, status);
        }
    }

    async getAll(req, res) {
        try {
            const institutionId = req.user?.institutionId || req.user?.institution;
            if (!institutionId) {
                return sendErrorResponse(res, "Institution context missing", 401);
            }
            const roles = await RoleService.findAll(institutionId);
            return sendSuccessResponse(res, "Roles fetched", roles);
        } catch (error) {
            return sendErrorResponse(res, "Error fetching roles", 500, error.message);
        }
    }

    async getById(req, res) {
        try {
            const role = await RoleService.findById(req.params.id);
            if (!role) return sendErrorResponse(res, "Role not found", 404);
            return sendSuccessResponse(res, "Role fetched", role);
        } catch (error) {
            return sendErrorResponse(res, "Error fetching role", 500, error.message);
        }
    }

    async update(req, res) {
        try {
            const { name, type, status } = req.body;
            const updateData = {};
            if (name) { updateData.name = name; updateData.type = type || name; }
            if (status) updateData.status = status.toUpperCase();
            const role = await RoleService.update(req.params.id, updateData);
            return sendSuccessResponse(res, "Role updated successfully", role);
        } catch (error) {
            const status = error.message.includes('not found') ? 404 :
                           error.message.includes('already exists') ? 400 : 500;
            return sendErrorResponse(res, error.message, status);
        }
    }

    async delete(req, res) {
        try {
            await RoleService.delete(req.params.id);
            return sendSuccessResponse(res, "Role deleted successfully");
        } catch (error) {
            const status = error.message.includes('not found') ? 404 : 500;
            return sendErrorResponse(res, error.message, status);
        }
    }
}

module.exports = new RoleController();
