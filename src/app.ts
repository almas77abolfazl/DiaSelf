import { config } from "dotenv";
import { connectToDb } from "./db/DB";
import { Telegraf } from "telegraf";
import { startCommand } from "./commands/start.command";
import cron from "node-cron";
import { clients, registerAction } from "./actions/register.action";
import { onMessages } from "./controllers/message.controller";
import { Api } from "telegram";
import { cancelAction } from "./actions/cancel.action";
import { StringSession } from "telegram/sessions";

config();
connectToDb();

export const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", startCommand);
// bot.command("register", startCommand);
bot.on("message", async (ctx) => {
  await onMessages(ctx);
});

bot.action(/REGISTER:(.+)/, registerAction);
bot.action(/CANCEL:(.+)/, cancelAction);

bot.launch();

// اجرای تابع هر 1 دقیقه
cron.schedule("*/1 * * * *", async () => {});

setInterval(() => {
  console.log("hey");
  updateBio().then();
}, 5000);

async function updateBio() {
  const newBioText = "Hello, I'm using this amazing Telegram bot!";
  const client = clients["422389483"];
  if (!client) {
    return;
  }
  await client.sendMessage("me", { message: "Hello!" });
  // const result = await client.invoke(
  //   new Api.account.UpdateProfile({
  //     firstName: "some string here",
  //     lastName: "some string here",
  //     about: newBioText,
  //   })
  // );
  // console.log(result);
}
