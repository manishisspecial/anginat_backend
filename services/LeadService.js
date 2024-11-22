const LeadRepository = require('../repositories/LeadRepository');

class LeadService {
    async createLead(data) {
        return await LeadRepository.createLead(data);
    }

    async getLeads(query) {
        return await LeadRepository.getLeads(query);
    }

    async updateLead(leadId, updateData) {
        try {
            const updatedLead = await LeadRepository.updateLead(leadId, updateData);
            return updatedLead;
        } catch (error) {
            throw new Error('Failed to update lead');
        }
    }

    async updateBulkStatus(leadIds, status) {
        return await LeadRepository.updateBulkStatus(leadIds, status);
    }
}

module.exports = new LeadService();
