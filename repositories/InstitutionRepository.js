const Institution = require('../models/Institution');
class InstitutionRepository {
    async findByName(email) {
        return await Institution.findOne({ email });
    }
    async findById(id) {
        return await Institution.findById(id);
    }

    async findByDomain(domainName) {
        return await Institution.findOne({ domainName });
    }

    async createInstitution(institutionData) {
        const institution = new Institution(institutionData);
        return await institution.save();
    }
}

module.exports = new InstitutionRepository();
