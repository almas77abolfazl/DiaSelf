import { User } from "../db/models/user.schema";

export async function saveUser(userId: number, username: string) {
  const newUser = new User({ userId, username });
  await newUser.save();
}

export async function getUserById(userId: number) {
  return await User.findOne({ userId });
}
