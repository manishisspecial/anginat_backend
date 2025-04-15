// services/InstitutionService.js
const InstitutionRepository = require('../repositories/InstitutionRepository');
const UserRepository = require("../repositories/UserRepository");
class InstitutionService {
    async findOrCreateInstitution(institutionData) {
        let institution = await InstitutionRepository.findByName(institutionData.email);
        if (!institution) {
            const institutionCode = await this.generateInstitutionCode();
            institutionData.institutionCode = institutionCode;
            institution = await InstitutionRepository.createInstitution(institutionData);
        }
        return institution;
    }
    async generateInstitutionCode() {
        try {
            return await InstitutionRepository.generateInstitutionCode();
        } catch (error) {
            console.error("Error finding user by institution:", error.message || error);
            throw new Error('Error finding user by institution');
        }
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

    async findByDomain(domain) {
        try {
            return await InstitutionRepository.findByDomain(domain);
        } catch (error) {
            console.error("Error finding user by usernname:", error.message || error);
            throw new Error('Error finding user by username');
        }
    }
    async findByInstitutionEmail(email) {
        try {
            return await InstitutionRepository.findByInstitutionEmail(email);
        } catch (error) {
            console.error("Error finding user by institution:", error.message || error);
            throw new Error('Error finding user by institution');
        }
    }

    async findAndUpdateInstitute(id,institutionData){
        try {
            const institute = await InstitutionRepository.findById(id)
            if(!institute){
                throw new Error("Institute Not Found")
            }
            
            return await InstitutionRepository.updateInstituteDetails(id,institutionData)
        } catch (error) {
            throw new Error('Error updating instituion');
        }
    }
} 

module.exports = new InstitutionService();
