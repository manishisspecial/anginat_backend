const InstitutionService = require("../services/InstitutionService");
const imagekit = require("../utils/imageKit");
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

  async updateInstituteDetails(req, res) {
    try {
      const { instituteId } = req.params;
      const updateInstitute = req.body;
      const updateData = await InstitutionService.findAndUpdateInstitute(
        instituteId,
        updateInstitute
      );

      return sendSuccessResponse(res, "institution updated successfully.", {
        institute: updateData,
      });
    } catch (error) {
      return sendErrorResponse(
        res,
        "Internal Server Error",
        500,
        error.message || error
      );
    }
  }

  async uploadFile(req, res) {
    try {
      const { instituteId } = req.params;

      const institute = await InstitutionService.findById(instituteId);

      if (!institute) {
        return sendErrorResponse(res, "Institute Not Found", 400);
      }
      // Check if file is uploaded
      if (!req.file) {
        return sendErrorResponse(res, "No file uploaded", 400);
      }

      const fileSize = req.file.size;

      // File size validation (500KB limit)
      if (fileSize > 500 * 1024) {
        return sendErrorResponse(res, "File size must not exceed 500KB", 400);
      }

      // Determine file type (logo or profile)
      const fileType = req.body.type;

      // Ensure a valid file type is provided (either 'profile' or 'logo')
  
      
      // Perform specific actions based on the file type
      if (fileType === "profile") {
        const uploadResponse = await imagekit.upload({
          file: req.file.buffer,
          fileName: `profile-${Date.now()}.${req.file.mimetype.split("/")[1]}`,
          folder: `/${institute.institutionCode}`,
        });

        if (!uploadResponse || !uploadResponse.url) {
          return sendErrorResponse(
            res,
            "Failed to upload file to ImageKit",
            400,
            parseError
          );
        }

        const updatedData = await InstitutionService.findAndUpdateInstitute(
          instituteId,
          {
            profileUrl: uploadResponse.url,
          }
        );
        
        // Respond with success
        return res.status(200).json({
          message: `${
            fileType.charAt(0).toUpperCase() + fileType.slice(1)
          } image uploaded successfully`,
          institute: updatedData,
        });
      } else if (fileType === "logo") {
        const uploadResponse = await imagekit.upload({
          file: req.file.buffer,
          fileName: `logo-${Date.now()}.${req.file.mimetype.split("/")[1]}`,
          folder: `/${institute.institutionCode}`,
        });

        if (!uploadResponse || !uploadResponse.url) {
          return sendErrorResponse(
            res,
            "Failed to upload file to ImageKit",
            400,
            parseError
          );
        }

        const updatedData = await InstitutionService.findAndUpdateInstitute(
          instituteId,
          {
            logoUrl: uploadResponse.url,
          }
        );


        // Respond with success
        return res.status(200).json({
          message: `${
            fileType.charAt(0).toUpperCase() + fileType.slice(1)
          } image uploaded successfully`,
          institute: updatedData
        });
      }
    } catch (error) {
      console.log(res);
      return sendErrorResponse(
        res,
        "Internal Server Error",
        500,
        error.message || error
      );
    }
  }


  async getInstituteByDomain(req, res) {
    try {
      const { instituteDomain } = req.body;
      const instituteData = await InstitutionService.findByDomain(instituteDomain);

      if (!instituteData) {
        return sendErrorResponse(res, "Institute Not Found", 400);
      }

      return sendSuccessResponse(
        res,
        "Institution found successfully",
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
