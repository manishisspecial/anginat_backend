const LeadService = require('../services/LeadService');
const Institution = require('../models/Institution');
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");

class LeadController {
    async createLead(req, res) {
        try {
            const leadData = req.body;
            const institution = await Institution.findOne({ domainName: req.body.institutionDomain });
            console.log(institution);

            if (!institution) {
                return sendErrorResponse(res, 'Institution not found', 404);
            }

            const newLead = {
                ...leadData,
                institution: institution._id
            };

            const lead = await LeadService.createLead(newLead);
            return sendSuccessResponse(res, 'Lead created successfully', { lead });

        } catch (error) {
            console.error("Create Lead Error:", { message: error.message, stack: error.stack });
            return sendErrorResponse(res, 'Error creating lead', 500, error.message);
        }
    }

    async getLeads(req, res) {
        try {
            const userRole = req.user.role;
            const userInstitution = req.user.institution;
            let query = {};

            if (userRole === 'admin') {
                query = { institution: userInstitution};
            }

            const leads = await LeadService.getLeads(query);
            return sendSuccessResponse(res, 'Leads retrieved successfully', { leads });

        } catch (error) {
            console.error("Get Leads Error:", { message: error.message, stack: error.stack });
            return sendErrorResponse(res, 'Error retrieving leads', 500, error.message);
        }
    }

    async updateLeadStatus(req, res) {
        try {
            const { leadId, status } = req.body;
            const updatedLead = await LeadService.updateLeadStatus(leadId, status);

            return sendSuccessResponse(res, 'Lead status updated successfully', { updatedLead });

        } catch (error) {
            console.error("Update Lead Status Error:", { message: error.message, stack: error.stack });
            return sendErrorResponse(res, 'Error updating lead status', 500, error.message);
        }
    }

    async updateBulkStatus(req, res) {
        try {
            const { leadIds, status } = req.body;
            await LeadService.updateBulkStatus(leadIds, status);

            return sendSuccessResponse(res, 'Lead statuses updated successfully');

        } catch (error) {
            console.error("Update Bulk Status Error:", { message: error.message, stack: error.stack });
            return sendErrorResponse(res, 'Error updating lead statuses', 500, error.message);
        }
    }
}

module.exports = new LeadController();
