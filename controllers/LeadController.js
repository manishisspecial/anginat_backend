// controllers/LeadController.js
const LeadService = require('../services/LeadService');
const Institution = require('../models/Institution');
class LeadController {
    async createLead(req, res) {
        try {
            const leadData = req.body;
            const institution = await Institution.findOne({ domain: req.body.institutionDomain });
            if (!institution) {
                throw new Error('Institution not found');
            }
            const newLead = {
                ...leadData,
                institution: institution._id
            };
            const lead = await LeadService.createLead(newLead);
            res.status(201).json(lead);
        } catch (error) {
            res.status(500).json({ message: 'Error creating lead', error });
        }
    }

    async getLeads(req, res) {
        try {
            const userRole = req.user.role;
            const userInstitution = req.user.institution;
            let query = {};
            if (userRole === 'admin') {
                query = { institution: userInstitution, status: 'active' };
            }
            const leads = await LeadService.getLeads(query);
            res.status(200).json(leads);

        } catch (error) {
            res.status(500).json({ message: 'Error retrieving leads', error: error.message });
        }
    }


    async updateLeadStatus(req, res) {
        try {
            const { leadId, status } = req.body;
            const updatedLead = await LeadService.updateLeadStatus(leadId, status);
            res.status(200).json(updatedLead);
        } catch (error) {
            res.status(500).json({ message: 'Error updating lead status', error });
        }
    }

    async updateBulkStatus(req, res) {
        try {
            const { leadIds, status } = req.body;
            await LeadService.updateBulkStatus(leadIds, status);
            res.status(200).json({ message: 'Lead statuses updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating lead statuses', error });
        }
    }
}

module.exports = new LeadController();
