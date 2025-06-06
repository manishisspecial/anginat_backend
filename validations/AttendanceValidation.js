const Joi = require("joi");

const attendanceSessionSchema = Joi.object({
  timetable: Joi.string().required().messages({
    "string.empty": "Timetable is required",
    "any.required": "Timetable is required",
  }),
  date: Joi.date().required().messages({
    "date.base": "Date must be a valid date",
    "any.required": "Date is required",
  }),
  instructor: Joi.string().required().messages({
    "string.empty": "Instructor is required",
    "any.required": "Instructor is required",
  }),
  academicClass: Joi.string().required().messages({
    "string.empty": "Academic class is required",
    "any.required": "Academic class is required",
  }),
  section: Joi.string().required().messages({
    "string.empty": "Section is required",
    "any.required": "Section is required",
  }),
  subject: Joi.string().required().messages({
    "string.empty": "Subject is required",
    "any.required": "Subject is required",
  }),
  scheduleDetail: Joi.object({
    day: Joi.string()
      .valid(
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      )
      .required()
      .messages({
        "string.empty": "Day is required",
        "any.only":
          "Day must be one of the following: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
        "any.required": "Day is required",
      }),
    startTime: Joi.string()
      .pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        "string.empty": "Start time is required",
        "string.pattern.base": "Start time must be in HH:MM format",
        "any.required": "Start time is required",
      }),
    endTime: Joi.string()
      .pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        "string.empty": "End time is required",
        "string.pattern.base": "End time must be in HH:MM format",
        "any.required": "End time is required",
      }),
  })
    .required()
    .messages({
      "object.base": "Schedule detail must be an object",
      "any.required": "Schedule detail is required",
    }),
});

const attendanceArraySchema = Joi.array().items(
  Joi.object({
    session: Joi.string().required().messages({
      "string.empty": "Session is required",
      "any.required": "Session is required",
    }),
    student: Joi.string().required().messages({
      "string.empty": "Student is required",
      "any.required": "Student is required",
    }),
    status: Joi.string()
      .valid("PRESENT", "ABSENT", "LATE", "EXCUSED")
      .required()
      .messages({
        "any.only": "Status must be one of PRESENT, ABSENT, LATE, EXCUSED",
        "any.required": "Status is required",
      }),
    remarks: Joi.string().max(200).optional().allow("").messages({
      "string.max": "Remarks cannot exceed 200 characters",
    }),
  })
);

module.exports = { attendanceSessionSchema, attendanceArraySchema };
