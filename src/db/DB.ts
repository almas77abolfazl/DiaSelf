import mongoose from "mongoose";

connectToDb().catch((err) => console.log(err));

export async function connectToDb() {
  await mongoose.connect("mongodb://127.0.0.1:27017/DiaSelf");
}
