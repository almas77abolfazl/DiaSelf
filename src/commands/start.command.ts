import { Context } from "telegraf";
import { getMainKeyboardButtons } from "../statics/keyboards.static";
import { getUserById, saveUser } from "../controllers/user.controller";

export const startCommand = async (ctx: Context) => {
  const userId = ctx.from.id;
  const existingUser = await getUserById(userId);
  if (existingUser) {
    ctx.reply("Welcome back!", {
      reply_markup: { inline_keyboard: getMainKeyboardButtons(userId) },
    });
  } else {
    await saveUser(userId, ctx.from.username);
    ctx.reply("Welcome! What would you like to do?", {
      reply_markup: { inline_keyboard: getMainKeyboardButtons(userId) },
    });
  }
};
