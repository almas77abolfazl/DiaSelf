import { Context } from "telegraf";
import { getSession } from "./session.controller";
import { ACTIONS } from "../statics/actions.enum";
import {
  getApiHash,
  getApiId,
  getLoginCode,
  getPassword,
  getPhoneNumber,
} from "../actions/register.action";

export async function onMessages(ctx: Context) {
  const userId = ctx.from.id;
  const userState = await getSession(userId);
  if (!!userState) {
    switch (userState.action) {
      case ACTIONS.GET_PHONE_NUMBER:
        await getPhoneNumber(ctx);
        break;
      case ACTIONS.GET_API_ID:
        await getApiId(ctx);
        break;
      case ACTIONS.GET_API_HASH:
        await getApiHash(ctx);
        break;
      case ACTIONS.GET_PASSWORD:
        await getPassword(ctx);
        break;
      case ACTIONS.GET_LOGIN_CODE:
        await getLoginCode(ctx);
        break;

      default:
        break;
    }
  }
}
