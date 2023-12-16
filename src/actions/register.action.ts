import { Context } from "telegraf";
import { ACTIONS } from "../statics/actions.enum";
import { setSession } from "../controllers/session.controller";
import { User } from "../db/models/user.schema";
import { getUserById } from "../controllers/user.controller";
import { TelegramClient } from "telegram";
import { Subject, take, tap } from "rxjs";
import { StringSession } from "telegram/sessions";
import { getCancelButtonKeyboard } from "../statics/keyboards.static";

let codeSubjects: { [userId: string]: Subject<string> } = {};
export let clients: { [userId: string]: TelegramClient } = {};

export const registerAction = async (ctx: Context) => {
  const userId = ctx["match"][1];
  const user = await getUserById(userId);

  if (!user.phoneNumber) {
    setSession(userId, ACTIONS.GET_PHONE_NUMBER);
    ctx.reply("Enter Your Phone Number:");
  } else if (!user.api_id) {
    setSession(userId, ACTIONS.GET_API_ID);
    ctx.reply("Enter Your API Id:");
  } else if (!user.api_hash) {
    setSession(userId, ACTIONS.GET_API_HASH);
    ctx.reply("Enter Your API HASH:");
  } else if (!user.password) {
    setSession(userId, ACTIONS.GET_PASSWORD);
    ctx.reply("Enter your two-step password if exist:", {
      reply_markup: { inline_keyboard: getCancelButtonKeyboard(userId) },
    });
  } else {
    if (!user.registered) {
      setSession(userId, ACTIONS.GET_LOGIN_CODE);
      await loginWithCode(userId, user, ctx);
    } else {
      await loginWithSession(user);
    }
  }
};

const updateUser = async (ctx: Context, field: string) => {
  try {
    const value: string = ctx.message["text"];
    const userId = ctx.from.id;

    // validation
    await User.findOneAndUpdate({ userId }, { $set: { [field]: value } });

    switch (field) {
      case "phoneNumber":
        setSession(userId, ACTIONS.GET_API_ID);
        ctx.reply("Enter Your API Id:");
        break;

      case "api_id":
        setSession(userId, ACTIONS.GET_API_HASH);
        ctx.reply("Enter Your API HASH:");
        break;

      case "api_hash":
        setSession(userId, ACTIONS.GET_PASSWORD);
        ctx.reply("Enter your two-step password if exist:", {
          reply_markup: { inline_keyboard: getCancelButtonKeyboard(userId) },
        });
        break;

      case "password":
        setSession(userId, ACTIONS.GET_LOGIN_CODE);
        const user = await getUserById(userId);
        await loginWithCode(userId, user, ctx);
        break;

      default:
        break;
    }
  } catch (error) {}
};

export const getPhoneNumber = (ctx: Context) => updateUser(ctx, "phoneNumber");
export const getApiId = (ctx: Context) => updateUser(ctx, "api_id");
export const getApiHash = (ctx: Context) => updateUser(ctx, "api_hash");
export const getPassword = (ctx: Context) => updateUser(ctx, "password");

export async function getLoginCode(ctx: Context) {
  try {
    let loginCode: string = ctx.message["text"];
    const userId = ctx.from.id;
    codeSubjects[userId].next(loginCode);
    User.findOneAndUpdate({ userId }, { $set: { registered: true } });
  } catch (error) {}
}

export async function loginWithCode(userId: any, user, ctx) {
  const codeSubject$: Subject<string> = new Subject();
  codeSubjects[userId] = codeSubject$;
  ctx.reply("Enter Your Code:");
  await sendCode(user);
}

async function sendCode(user) {
  try {
    const userId = user.userId.toString();
    const client = new TelegramClient(userId, user.api_id, user.api_hash, {
      connectionRetries: 5,
    });

    client
      .start({
        phoneNumber: () => user.phoneNumber,
        phoneCode: async () => {
          return codeSubjects[user.userId].pipe(take(1)).toPromise();
        },
        onError: (err) => {
          console.log(err);
          delete clients[user.userId];
        },
      })
      .then(async (x) => {
        const sessionString = client.session.save();
        await User.findOneAndUpdate(
          { userId: user.userId },
          { $set: { sessionString } }
        );
        console.log("You should now be connected.");
        clients[user.userId] = client;
      });
  } catch (err) {
    console.error(err);
  }
}

async function loginWithSession(user): Promise<void> {
  const userId = user.userId.toString();
  const client = new TelegramClient(userId, user.api_id, user.api_hash, {
    connectionRetries: 5,
  });
  await client.connect();
  const sessionString = client.session.save();
  await User.findOneAndUpdate(
    { userId: user.userId },
    { $set: { sessionString } }
  );
  console.log("You should now be connected without entering the code again.");
  clients[user.userId] = client;
}
