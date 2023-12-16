import { Context } from "telegraf";
import { getSession, setSession } from "../controllers/session.controller";
import { ACTIONS } from "../statics/actions.enum";
import { loginWithCode } from "./register.action";
import { getUserById } from "../controllers/user.controller";

export const cancelAction = async (ctx: Context) => {
  const userId = ctx["match"][1];
  const userState = await getSession(userId);
  if (!!userState) {
    switch (userState.action) {
      case ACTIONS.GET_PASSWORD:
        const user = await getUserById(userId);
        setSession(userId, ACTIONS.GET_LOGIN_CODE);
        await loginWithCode(userId, user, ctx);
        break;
    }
  }
};
