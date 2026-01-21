// const LeadService = require("../services/LeadService");
// const Institution = require("../models/Institution");
// const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
// const wsManager = require("../socket/websocketServer");
// const { sendEmail } = require("../services/SendgridService");
// const contactUsTemplate = require("../utils/contactUsTemplate");
// const { preferences } = require("joi");
// const scheduleDemoTemplate = require("../utils/scheduleDemoTemplate");
// require("dotenv").config();

// class LeadController {
//   async createLead(req, res) {
//     try {
//       console.log('Create Lead req.body:', req.body); // Log the request body
//       const leadData = req.body;
//       const institution = await Institution.findOne({
//         domainName: req.body.institutionDomain,
//       });

//       if (!institution) {
//         return sendErrorResponse(res, "Institution not found", 404);
//       }

//       // Set default country code if not provided
//       if (!leadData.countryCode) {
//         leadData.countryCode = '+91';
//       }

//       const newLead = {
//         ...leadData,
//         institution: institution._id,
//       };

//       console.log('newLead:', newLead);
//       const lead = await LeadService.createLead(newLead);
//       console.log('lead from DB:', lead);

//       wsManager.broadcast({ type: "NEW_LEAD", data: newLead });

//       return sendSuccessResponse(res, "Lead created successfully", { lead });
//     } catch (error) {
//       console.error("Create Lead Error:", {
//         message: error.message,
//         stack: error.stack,
//       });

//       return sendErrorResponse(res, "Error creating lead", 500, error.message);
//     }
//   }

//   async getLeads(req, res) {
//     try {
//       const userRole = req.user.role;
//       const userInstitution = req.user.institutionId;
//       let query = {};
//       switch (userRole) {
//         case "super-admin":
//           break;
//         case "admin":
//           query = { institution: userInstitution };
//           break;
//         default:
//           return sendErrorResponse(
//             res,
//             "Unauthorized access",
//             403,
//             "You do not have permission to view leads"
//           );
//       }
//       const leads = await LeadService.getLeads(query);
//       const responseData = {
//         leads,
//       };
//       return sendSuccessResponse(
//         res,
//         "Leads retrieved successfully",
//         responseData
//       );
//     } catch (error) {
//       console.error("Get Leads Error:", {
//         message: error.message,
//         stack: error.stack,
//         user: {
//           role: req.user.role,
//           institution: req.user.institution,
//         },
//       });
//       return sendErrorResponse(
//         res,
//         "Error retrieving leads",
//         500,
//         error.message
//       );
//     }
//   }

//   async updateLead(req, res) {
//     try {
//       const { leadId, updateData } = req.body;
//       const userRole = req.user.role;
//       if (userRole !== "admin" && userRole !== "super-admin") {
//         return sendErrorResponse(res, "Permission denied", 403);
//       }
//       const allowedFields = [
//         "course",
//         "applicantName",
//         "phoneNumber",
//         "countryCode",
//         "email",
//         "status",
//       ];
//       const invalidFields = Object.keys(updateData).filter(
//         (field) => !allowedFields.includes(field)
//       );

//       if (invalidFields.length > 0) {
//         return sendErrorResponse(
//           res,
//           `Invalid fields: ${invalidFields.join(", ")}`,
//           400
//         );
//       }
//       // If countryCode is missing in updateData, fetch it from DB and add it
//       if (!('countryCode' in updateData)) {
//         const existingLead = await LeadService.getLeadById(leadId);
//         if (existingLead && existingLead.countryCode) {
//           updateData.countryCode = existingLead.countryCode;
//         } else {
//           updateData.countryCode = '+91'; // fallback default
//         }
//       }

//       await LeadService.updateLead(leadId, updateData);
//       // Fetch the updated lead from DB to ensure all fields (including countryCode) are included
//       const updatedLead = await LeadService.getLeadById(leadId);
//       return sendSuccessResponse(res, "Lead updated successfully", {
//         updatedLead,
//       });

//     } catch (error) {
//       console.error("Update Lead Error:", {
//         message: error.message,
//         stack: error.stack,
//       });
//       return sendErrorResponse(res, "Error updating lead", 500, error.message);
//     }
//   }
//   async updateBulkStatus(req, res) {
//     try {
//       const { leadIds, status } = req.body;
//       await LeadService.updateBulkStatus(leadIds, status);
//       return sendSuccessResponse(res, "Lead statuses updated successfully");
//     } catch (error) {
//       console.error("Update Bulk Status Error:", {
//         message: error.message,
//         stack: error.stack,
//       });
//       return sendErrorResponse(
//         res,
//         "Error updating lead statuses",
//         500,
//         error.message
//       );
//     }
//   }

//   async createInstituteContactUs(req, res) {
//     const data = req.body

//     if (!data.email || !data.receiverEmail) {
//       return sendErrorResponse(
//         res,
//         `email is required`,
//         400
//       );
//     }

//     if (!data.name || !data.message || !data.phoneNumber) {
//       return sendErrorResponse(
//         res,
//         `Name, phone number and message field is required`,
//         400
//       );
//     }

//     try {

//       await sendEmail({
//         recipientEmail: data.receiverEmail,
//         subject: "Contact Us Lead",
//         text: "Contact Us Lead",
//         html: contactUsTemplate({
//           name: data.firstName + " " + data.lastName,
//           email: data.email,
//           message: data.message,
//           phoneNumber: data.phoneNumber,
//         })
//       });

//       return sendSuccessResponse(res, "Contact Us Form Submitted");
//     } catch (error) {
//       return sendErrorResponse(
//         res,
//         "Error Submitting contact us form",
//         500,
//         error.message
//       );
//     }
//   }

//   async createEventsContactUs(req, res) {
//     const data = req.body

//     if (!data.email) {
//       return sendErrorResponse(
//         res,
//         `email is required`,
//         400
//       );
//     }

//     if (!data.name || !data.message) {
//       return sendErrorResponse(
//         res,
//         `Name and message field is required`,
//         400
//       );
//     }

//     try {

//       await sendEmail({
//         recipientEmail: "events@anginat.com",
//         subject: "Contact Us Lead",
//         text: "Contact Us Lead",
//         html: contactUsTemplate({
//           name: data.firstName + " " + data.lastName,
//           email: data.email,
//           message: data.message,
//           phoneNumber: data.phoneNumber,
//         })
//       });

//       return sendSuccessResponse(res, "Contact Us Form Submitted");
//     } catch (error) {
//       return sendErrorResponse(
//         res,
//         "Error Submitting contact us form",
//         500,
//         error.message
//       );
//     }
//   }

//   async createScheduleDemoRequest(req, res) {
//     const data = req.body;

//     // Validate compulsory fields
//     const requiredFields = [
//       "name",
//       "email",
//       "phoneNumber",
//       "eventType",
//       "preferredDate",
//       "preferredTime"
//     ];
//     for (const field of requiredFields) {
//       if (!data[field]) {
//         return sendErrorResponse(
//           res,
//           `${field} is required`,
//           400
//         );
//       }
//     }

//     // Build lead object
//     const lead = {
//       name: data.name,
//       email: data.email,
//       company: data.company,
//       phoneNumber: data.phoneNumber,
//       eventType: data.eventType,
//       preferredDate: data.preferredDate,
//       preferredTime: data.preferredTime,
//       expectedAttendees: data.expectedAttendees,
//       message: data.message
//     };

//     try {
//       // You can save the lead to DB here if needed

//       // Send email notification (customize as needed)
//       await sendEmail({
//         recipientEmail: "info@anginat.com",
//         subject: "Schedule Demo Request",
//         text: "Schedule Demo Request",
//         html: scheduleDemoTemplate({
//           name: data.name,
//           email: data.email,
//           message: data.message,
//           phoneNumber: data.phoneNumber,
//           company: data.company,
//           eventType: data.eventType,
//           preferredDate: data.preferredDate,
//           preferredTime: data.preferredTime,
//           expectedAttendees: data.expectedAttendees
//         })
//       });

//       return sendSuccessResponse(res, "Schedule Demo Request Submitted");
//     } catch (error) {
//       return sendErrorResponse(
//         res,
//         "Error Submitting schedule demo request",
//         500,
//         error.message
//       );
//     }
//   }

//   async createContactLead(req, res) {
//     const data = req.body;

//     if (!data.email || !data.name) {
//       return sendErrorResponse(
//         res,
//         `Email and name field is required`,
//         400
//       );
//     }

//     try {


//       await sendEmail({
//         recipientEmail: process.env.OTP_EMAIL,
//         subject: "Contact Us Lead",
//         text: "Contact Us Lead",
//         html: contactUsTemplate({
//           name: data.name,
//           email: data.email,
//           message: data.message
//         }),
//       });
//       return sendSuccessResponse(res, "Contact Us Form Submitted", lead);
//     } catch (error) {
//       return sendErrorResponse(
//         res,
//         "Error Submitting contact us form",
//         500,
//         error.message
//       );
//     }
//   }
// }
// module.exports = new LeadController();
const LeadService = require("../services/LeadService");
const Institution = require("../models/Institution");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const wsManager = require("../socket/websocketServer");
const { sendEmail } = require("../services/SendgridService");
const contactUsTemplate = require("../utils/contactUsTemplate");
const { preferences } = require("joi");
const scheduleDemoTemplate = require("../utils/scheduleDemoTemplate");
const EmailService = require("../services/EmailService");
require("dotenv").config();

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

      // Enhanced country code handling
      if (!leadData.countryCode ||
        leadData.countryCode.toString().trim() === '' ||
        leadData.countryCode === null ||
        leadData.countryCode === undefined) {

        leadData.countryCode = '+91';
      } else {
        // Ensure it's a string and trim any whitespace
        leadData.countryCode = leadData.countryCode.toString().trim();
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
      const userInstitution = req.user.institutionId;
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
        "countryCode",
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

      // Enhanced country code handling for updates
      if (!('countryCode' in updateData) ||
        !updateData.countryCode ||
        updateData.countryCode.toString().trim() === '') {

        const existingLead = await LeadService.getLeadById(leadId);

        if (existingLead && existingLead.countryCode && existingLead.countryCode.trim() !== '') {
          updateData.countryCode = existingLead.countryCode;
        } else {
          updateData.countryCode = '+91'; // fallback default
        }
      } else {
        // Ensure it's a string and trim any whitespace
        updateData.countryCode = updateData.countryCode.toString().trim();
      }

      await LeadService.updateLead(leadId, updateData);

      // Fetch the updated lead from DB to ensure all fields are included
      const updatedLead = await LeadService.getLeadById(leadId);

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

  async createInstituteContactUs(req, res) {
    const data = req.body

    if (!data.email || !data.receiverEmail) {
      return sendErrorResponse(
        res,
        `email is required`,
        400
      );
    }

    if (!data.name || !data.message || !data.phoneNumber) {
      return sendErrorResponse(
        res,
        `Name, phone number and message field is required`,
        400
      );
    }

    try {
      await sendEmail({
        recipientEmail: data.receiverEmail,
        subject: "Contact Us Lead",
        text: "Contact Us Lead",
        html: contactUsTemplate({
          name: data.firstName + " " + data.lastName,
          email: data.email,
          message: data.message,
          phoneNumber: data.phoneNumber,
        })
      });

      return sendSuccessResponse(res, "Contact Us Form Submitted");
    } catch (error) {
      return sendErrorResponse(
        res,
        "Error Submitting contact us form",
        500,
        error.message
      );
    }
  }

  async createEventsContactUs(req, res) {
    const data = req.body

    if (!data.email) {
      return sendErrorResponse(
        res,
        `email is required`,
        400
      );
    }

    if (!data.name || !data.message) {
      return sendErrorResponse(
        res,
        `Name and message field is required`,
        400
      );
    }

    try {
      await EmailService.sendEmail({
        from: data.email,
        subject: `Contact Us Lead from ${data.name} `,
        body: contactUsTemplate({
          name: data.name,
          email: data.email,
          message: data.message,
          phoneNumber: data.phoneNumber,
          company: data.company,
          inquiryType: data.inquiryType
        })
      });

      return sendSuccessResponse(res, "Contact Us Form Submitted");
    } catch (error) {
      return sendErrorResponse(
        res,
        "Error Submitting contact us form",
        500,
        error.message
      );
    }
  }

  async createScheduleDemoRequest(req, res) {
    const data = req.body;

    // Validate compulsory fields
    const requiredFields = [
      "name",
      "email",
      "phoneNumber",
      "eventType",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return sendErrorResponse(
          res,
          `${field} is required`,
          400
        );
      }
    }

    // Build lead object
    const lead = {
      name: data.name,
      email: data.email,
      company: data.company,
      phoneNumber: data.phoneNumber,
      eventType: data.eventType,
      expectedAttendees: data.attendees,
      message: data.message
    };

    try {
      // You can save the lead to DB here if needed

      // Send email notification (customize as needed)
      await EmailService.sendEmail({
        from: data.email,
        subject: `Schedule Demo Request from ${data.name}`,
        body: scheduleDemoTemplate({
          name: data.name,
          email: data.email,
          message: data.message,
          phoneNumber: data.phoneNumber,
          company: data.company,
          eventType: data.eventType,
          expectedAttendees: data.attendees
        })
      });

      return sendSuccessResponse(res, "Schedule Demo Request Submitted");
    } catch (error) {
      return sendErrorResponse(
        res,
        "Error Submitting schedule demo request",
        500,
        error.message
      );
    }
  }

  async createContactLead(req, res) {
    const data = req.body;

    if (!data.email || !data.name) {
      return sendErrorResponse(
        res,
        `Email and name field is required`,
        400
      );
    }

    try {
      await sendEmail({
        recipientEmail: process.env.OTP_EMAIL,
        subject: "Contact Us Lead",
        text: "Contact Us Lead",
        html: contactUsTemplate({
          name: data.name,
          email: data.email,
          message: data.message
        }),
      });

      return sendSuccessResponse(res, "Contact Us Form Submitted");
    } catch (error) {
      return sendErrorResponse(
        res,
        "Error Submitting contact us form",
        500,
        error.message
      );
    }
  }
}

module.exports = new LeadController();