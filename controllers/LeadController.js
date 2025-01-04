const LeadService = require("../services/LeadService");
const Institution = require("../models/Institution");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const wsManager = require("../socket/websocketServer");
class LeadController {
  async createLead(req, res) {
    try {
      const leadData = req.body;
      const institution = await Institution.findOne({
        domainName: req.body.institutionDomain,
      });

      if (!institution) {
        return sendErrorResponse(res, "Institution not found", 404);
      }

      const newLead = {
        ...leadData,
        institution: institution._id,
      };

      const lead = await LeadService.createLead(newLead);

      wsManager.broadcast({ type: "NEW_LEAD", data: newLead });

      return sendSuccessResponse(res, "Lead created successfully", { lead });
    } catch (error) {
      console.error("Create Lead Error:", {
        message: error.message,
        stack: error.stack,
      });

      return sendErrorResponse(res, "Error creating lead", 500, error.message);
    }
  }
  async getLeads(req, res) {
    try {
      const userRole = req.user.role;
      const userInstitution = req.user.institution;
      let query = {};
      switch (userRole) {
        case "super-admin":
          break;
        case "admin":
          query = { institution: userInstitution };
          break;
        default:
          return sendErrorResponse(
            res,
            "Unauthorized access",
            403,
            "You do not have permission to view leads"
          );
      }
      const leads = await LeadService.getLeads(query);
      const responseData = {
        leads,
      };
      return sendSuccessResponse(
        res,
        "Leads retrieved successfully",
        responseData
      );
    } catch (error) {
      console.error("Get Leads Error:", {
        message: error.message,
        stack: error.stack,
        user: {
          role: req.user.role,
          institution: req.user.institution,
        },
      });
      return sendErrorResponse(
        res,
        "Error retrieving leads",
        500,
        error.message
      );
    }
  }
  async updateLead(req, res) {
    try {
      const { leadId, updateData } = req.body;
      const userRole = req.user.role;
      if (userRole !== "admin" && userRole !== "super-admin") {
        return sendErrorResponse(res, "Permission denied", 403);
      }
      const allowedFields = [
        "course",
        "applicantName",
        "phoneNumber",
        "email",
        "status",
      ];
      const invalidFields = Object.keys(updateData).filter(
        (field) => !allowedFields.includes(field)
      );

      if (invalidFields.length > 0) {
        return sendErrorResponse(
          res,
          `Invalid fields: ${invalidFields.join(", ")}`,
          400
        );
      }
      const updatedLead = await LeadService.updateLead(leadId, updateData);
      return sendSuccessResponse(res, "Lead updated successfully", {
        updatedLead,
      });
    } catch (error) {
      console.error("Update Lead Error:", {
        message: error.message,
        stack: error.stack,
      });
      return sendErrorResponse(res, "Error updating lead", 500, error.message);
    }
  }
  async updateBulkStatus(req, res) {
    try {
      const { leadIds, status } = req.body;
      await LeadService.updateBulkStatus(leadIds, status);
      return sendSuccessResponse(res, "Lead statuses updated successfully");
    } catch (error) {
      console.error("Update Bulk Status Error:", {
        message: error.message,
        stack: error.stack,
      });
      return sendErrorResponse(
        res,
        "Error updating lead statuses",
        500,
        error.message
      );
    }
  }
}
module.exports = new LeadController();
