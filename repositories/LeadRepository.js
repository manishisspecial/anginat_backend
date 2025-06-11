const Lead = require('../models/Lead');

class LeadRepository {
    async createLead(data) {
        return await Lead.create(data);
    }

    async getLeads(query = {}) {
        return await Lead.find(query).populate('institution');
    }

    async updateLead(leadId, updateData) {
        try {
            const updatedLead = await Lead.findByIdAndUpdate(leadId, updateData, { new: true });
            return updatedLead;
        } catch (error) {
            throw new Error('Error updating lead in repository');
        }
    }
    
    async updateBulkStatus(leadIds, status) {
        return await Lead.updateMany({ _id: { $in: leadIds } }, { status });
    }
}

module.exports = new LeadRepository();