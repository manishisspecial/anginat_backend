// repositories/LeadRepository.js
const Lead = require('../models/Lead');

class LeadRepository {
    async createLead(data) {
        return await Lead.create(data);
    }

    async getLeads(query = {}) {
        return await Lead.find(query).populate('institutionDomain'); // populates with institution details
    }

    async updateLeadStatus(leadId, status) {
        return await Lead.findByIdAndUpdate(leadId, { status }, { new: true });
    }

    async updateBulkStatus(leadIds, status) {
        return await Lead.updateMany({ _id: { $in: leadIds } }, { status });
    }
}

module.exports = new LeadRepository();
