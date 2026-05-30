import mongoose from "mongoose";

const registeredParticipantsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hackathons",
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teams",
    default: null
  },
  // Dynamic form fields (like frontend registration form)
  name: {
    type: String,
    // required: true
  },
  contactNumber: {
    type: String,
    // required: true
  },
  email:{
    type : String,
    // required : true
  },
  college:{
    type : String,
  },
  gender : {
    type : String,
  },
  currentYearOfStudy : {
    type : String
  },
  city: {
    type: String
  },
  state:{
    type : String
  },
  yearsOfExperience: {
    type: String
  },
  workEmailAddress:{
    type : String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RegisteredParticipantsModel = mongoose.model(
  "registeredParticipants",
  registeredParticipantsSchema
);

export default RegisteredParticipantsModel;
