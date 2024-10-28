const LeadRepository = require('../repositories/LeadRepository');

class LeadService {
    async createLead(data) {
        return await LeadRepository.createLead(data);
    }

    async getLeads(query) {
        return await LeadRepository.getLeads(query);
    }

    async updateLeadStatus(leadId, status) {
        return await LeadRepository.updateLeadStatus(leadId, status);
    }

    async updateBulkStatus(leadIds, status) {
        return await LeadRepository.updateBulkStatus(leadIds, status);
    }
}

module.exports = new LeadService();
