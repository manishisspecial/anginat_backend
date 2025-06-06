const mongoose = require("mongoose");
const { Schema } = mongoose;

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const AttendanceSessionSchema = new Schema(
  {
    timetable: {
      type: Schema.Types.ObjectId,
      ref: "Timetable",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (userId) {
          const User = mongoose.model("User");
          const user = await User.findById(userId);
          return user && user.role === "instructor";
        },
        message: 'Instructor must be a user with role "instructor"',
      },
    },
    academicClass: {
      type: Schema.Types.ObjectId,
      ref: "AcademicClass",
      required: true,
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    scheduleDetail: {
      day: {
        type: String,
        enum: daysOfWeek,
        required: true,
      },
      startTime: {
        type: String,
        required: true,
        match: /^([01][0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM
      },
      endTime: {
        type: String,
        required: true,
        match: /^([01][0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM
      },
    },
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    isSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

AttendanceSessionSchema.index({ instructor: 1 });
AttendanceSessionSchema.index({ academicClass: 1 });
AttendanceSessionSchema.index({ subject: 1 });
AttendanceSessionSchema.index(
  { section: 1, subject: 1, date: 1, "scheduleDetail.startTime": 1 },
  { unique: true }
);

AttendanceSessionSchema.virtual("attendanceRecords", {
  ref: "Attendance",
  localField: "_id",
  foreignField: "session",
  justOne: false,
});

AttendanceSessionSchema.pre("save", async function (next) {
  try {
    const [academicClass, section, subject, timetable, instructor] =
      await Promise.all([
        mongoose.model("AcademicClass").findById(this.academicClass),
        mongoose.model("Section").findById(this.section),
        mongoose.model("Subject").findById(this.subject),
        mongoose.model("Timetable").findById(this.timetable),
        mongoose.model("User").findById(this.instructor),
      ]);
    if (!academicClass || !section || !subject || !timetable || !instructor) {
      return next(new Error("Invalid reference in AttendanceSession"));
    }
    console.log("References found:", {
      "academicClass Inst id": academicClass.institution,
      "subject Inst id": subject.institution,
      "timetable Inst id": timetable.institution,
      "instructor Inst id": instructor.institutionId,
    });

    // Check for missing institution fields
    if (
      !academicClass.institution ||
      !subject.institution ||
      !section.institution ||
      !timetable.institution ||
      !instructor.institutionId ||
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
      subject.institution,
      section.institution,
      timetable.institution,
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

module.exports =
  mongoose.models.AttendanceSession ||
  mongoose.model("AttendanceSession", AttendanceSessionSchema);
