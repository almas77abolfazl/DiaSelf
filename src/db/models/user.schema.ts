import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true, unique: true },
    username: { type: String },
    api_id: { type: Number },
    api_hash: { type: String },
    phoneNumber: { type: String },
    registered: { type: Boolean, default: false },
    sessionString: { type: String },
    password: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
