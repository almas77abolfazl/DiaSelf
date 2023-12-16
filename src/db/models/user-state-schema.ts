import mongoose from "mongoose";
import { ACTIONS } from "../../statics/actions.enum";

const userStateSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true, unique: true },
    action: { type: Number, enum: ACTIONS, required: true },
    data: { type: Object },
    date: { type: Date },
    // دیگر فیلدهای مورد نیاز
  },
  { timestamps: true }
);

export const UserState = mongoose.model("UserState", userStateSchema);
