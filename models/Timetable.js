const { type } = require("@hapi/joi/lib/extend");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const TimetableSchema = new Schema(
  {
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: [true, "Institution is required"],
    },
    academicClass: {
      type: Schema.Types.ObjectId,
      ref: "AcademicClass",
      required: [true, "AcademicClass is required"],
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Section is required"],
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },
    degree: {
      type: Schema.Types.ObjectId,
      ref: "Degree",
      // Optional, for degree-specific timetables
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      //optional, for degree-specific timetables
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
      validate: {
        validator: async function (id) {
          const user = await mongoose.model("User").findById(id);
          return user && user.role === "instructor" && user.status === "active";
        },
        message: 'Instructor must be an active user with role "instructor"',
      },
    },
    weeklyHours: {
      type: Number,
      required: [true, "Weekly hours is required"],
      min: [1, "Weekly hours must be at least 1"],
      max: [20, "Weekly hours cannot exceed 20"],
    },
    scheduleDetails: [
      {
        day: {
          type: String,
          enum: {
            values: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            message: "{VALUE} is not a valid day",
          },
          required: [true, "Day is required"],
        },
        startTime: {
          type: String,
          required: [true, "Start time is required"],
          match: [
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Start time must be in HH:MM format",
          ],
        },
        endTime: {
          type: String,
          required: [true, "End time is required"],
          match: [
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "End time must be in HH:MM format",
          ],
        },
        room: {
          type: String,
          trim: true,
          maxlength: [50, "Room cannot exceed 50 characters"],
        },
      },
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: [200, "Notes cannot exceed 200 characters"],
    },
  },
  { timestamps: true }
);


TimetableSchema.index(
  {
    institution: 1,
    academicClass: 1,
    degree: 1,
    section: 1,
    semester: 1,
    subject: 1,
    instructor: 1,
  },
  { unique: true }
);
// Index for common queries
TimetableSchema.index({ institution: 1, academicClass: 1, semester: 1 });
TimetableSchema.index({ institution: 1, section: 1, semester: 1 });
TimetableSchema.index({ institution: 1, instructor: 1, semester: 1 });



TimetableSchema.pre("save", async function (next) {
  try {
    const [
      institution,
      academicClass,
      section,
      subject,
      instructor,
      degree,
      semester,
    ] = await Promise.all([
      mongoose.model("Institution").findById(this.institution),
      mongoose.model("AcademicClass").findById(this.academicClass),
      mongoose.model("Section").findById(this.section),
      mongoose.model("Subject").findById(this.subject),
      mongoose.model("User").findById(this.instructor),
      mongoose.model("Degree").findById(this.degree),
      mongoose.model("Semester").findById(this.semester),
    ]);

    if (
      !institution ||
      !academicClass ||
      !section ||
      !subject ||
      !instructor ||
      !degree ||
      !semester
    ) {
      return next(new Error("Invalid reference in Timetable"));
    }

    // Check for missing institution fields
    if (
      !academicClass.institution ||
      !section.institution ||
      !subject.institution ||
      !instructor.institutionId ||
      !degree.institution ||
      !semester.institution ||
      !this.institution
    ) {
      return next(
        new Error(
          "One or more referenced documents are missing institution field"
        )
      );
    }

    const institutionIds = [
      academicClass.institution,
      section.institution,
      subject.institution,
      degree.institution,
      semester.institution,
      instructor.institutionId,
      this.institution,
    ].map((id) => id.toString());

    if (!institutionIds.every((id) => id === institutionIds[0])) {
      return next(
        new Error("All references must belong to the same institution")
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Prevent OverwriteModelError
module.exports =
  mongoose.models.Timetable || mongoose.model("Timetable", TimetableSchema);
