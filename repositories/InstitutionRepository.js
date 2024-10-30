const Institution = require('../models/Institution');
const User = require("../models/User");
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
    async findByInstitutionEmail(email) {
        try {
            console.log(`Attempting to find institution by email: ${email}`);
            const institution = await Institution.findOne({ email });
            if (!institution) {
                console.error(`No institution found with email: ${email}`);
                return null;
            }
            console.log(`Institution found: ${JSON.stringify(institution)}`);
            return institution;
        } catch (error) {
            console.error(`Error occurred while finding institution by email: ${email}`, error);
            throw new Error('Error finding user by email');
        }
    }

    async createInstitution(institutionData) {
        const institution = new Institution(institutionData);
        return await institution.save();
    }
}

module.exports = new InstitutionRepository();
