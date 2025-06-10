const Institution = require("../models/Institution");
const User = require("../models/User");
const UserRepository = require("./UserRepository");
class InstitutionRepository {
  async generateInstitutionCode() {
    const currentYear = new Date().getFullYear();
    const currentYearSuffix = currentYear % 100;
    const lastInstitution = await Institution.findOne({
      institutionCode: { $regex: `^AL_${currentYearSuffix}_` },
    })
      .sort({ institutionCode: -1 })
      .limit(1);
    let newCode = "";
    if (lastInstitution) {
      const lastCode = lastInstitution.institutionCode;
      const match = lastCode.match(/^AL_(\d{2})_(\d{4})$/);
      if (match) {
        const yearSuffix = match[1];
        const lastNumber = match[2];
        if (parseInt(yearSuffix, 10) === currentYearSuffix) {
          const incrementedNumber = (parseInt(lastNumber, 10) + 1)
            .toString()
            .padStart(4, "0");
          newCode = `AL_${currentYearSuffix}_${incrementedNumber}`;
        } else {
          newCode = `AL_${currentYearSuffix}_0001`;
        }
      } else {
        newCode = `AL_${currentYearSuffix}_0001`;
      }
    } else {
      newCode = `AL_${currentYearSuffix}_0001`;
    }
    return newCode;
  }

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
      const institution = await Institution.findOne({ email });
      return institution;
    } catch (error) {
      console.error(
        `Error occurred while finding institution by email: ${email}`,
        error
      );
      throw new Error("Error finding user by email");
    }
  }

  async createInstitution(institutionData) {
    const institution = new Institution(institutionData);
    return await institution.save();
  }

  async updateInstituteDetails(id, institutionData) {
    try {
      const institution = await Institution.findOneAndUpdate(
        { _id: id },
        institutionData,
        { new: true }
      );
      if (!institution) {
        return null;
      }

      if (institutionData.email) {
        const updatedUser = await UserRepository.updateDetails(id, {
          email: institution.email,
        });
        console.log("Updated User", updatedUser)
      }
      if (institution.phoneNumber) {
        await UserRepository.updateDetails(id, {
          phoneNumber: institution.phoneNumber,
        });
      }

      return institution;
    } catch (error) { }
  }
}

module.exports = new InstitutionRepository();
