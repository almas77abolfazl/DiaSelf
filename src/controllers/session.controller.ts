import { UserState } from "../db/models/user-state-schema";
import { ACTIONS } from "../statics/actions.enum";

export async function getSession(userId: number) {
  return await UserState.findOne({ userId }).lean();
}

export async function setSession(
  userId: number,
  action: ACTIONS,
  data: any = null
): Promise<void> {
  try {
    const userState = await getSession(userId);
    if (!!userState) {
      await UserState.findOneAndUpdate(
        { userId: userId },
        { $set: { action, date: new Date(), data } }
      );
    } else {
      const newUserState = new UserState({
        userId,
        action,
        date: new Date(),
        data,
      });
      await newUserState.save();
    }
  } catch (error) {
    console.log(error);
  }
}

export async function clearSession(userId: number): Promise<void> {
  await UserState.deleteOne({ userId });
}
