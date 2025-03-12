const mongoose = require("mongoose");

const ContactLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);
 
module.exports = mongoose.model("ContactLead", ContactLeadSchema);
 


