const InstitutionService = require("../services/InstitutionService");
const { sendErrorResponse, sendSuccessResponse } = require("../utils/response");

class InstituteController {
  async getInstituteDetails(req, res) {
    try {
      const { instituteId } = req.params;
      console.log("Institute ID", instituteId);
      const instituteData = await InstitutionService.findById(instituteId);

      if (!instituteData) {
        return sendErrorResponse(res, "Institute Not Found", 400);
      }

      return sendSuccessResponse(
        res,
        "User and institution registered successfully.",
        {
          institute: instituteData,
        }
      );
    } catch (error) {
      return sendErrorResponse(
        res,
        "Internal Server Error",
        500,
        error.message || error
      );
    }
  }
}
module.exports = new InstituteController();
