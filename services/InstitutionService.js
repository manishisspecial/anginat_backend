// services/InstitutionService.js
const InstitutionRepository = require('../repositories/InstitutionRepository');
class InstitutionService {
    async findOrCreateInstitution(institutionData) {
        let institution = await InstitutionRepository.findByName(institutionData.email);
        if (!institution) {
            institution = await InstitutionRepository.createInstitution(institutionData);
        }
        return institution;
    }
    async findById(id) {
        try {
            const institution = await InstitutionRepository.findById(id);
            return institution && institution.status === 'active' ? institution : null;
        } catch (error) {
            console.error("Error finding institution by ID:", error.message || error);
            throw new Error('Error finding institution');
        }
    }
}

module.exports = new InstitutionService();
