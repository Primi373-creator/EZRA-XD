const { SUDO } = require("../config");
const { command, isPrivate } = require("../lib");
const Config = require("../config");
const Heroku = require("heroku-client");
const heroku = new Heroku({ token: Config.HEROKU_API_KEY });
const baseURI = "/apps/" + Config.HEROKU_APP_NAME;
command(
  { 
    pattern: "setsudo ?(.*)", 
    fromMe: isPrivate, 
    desc: "set new sudo", 
    type: "heroku" },
  async (message, mm) => {
    var newSudo = (message.reply_message ? message.reply_message.jid : "" || mm).split(
      "@"
    )[0];
    if (!newSudo)
      return await message.sendMessage("*Need reply/number*", { quoted: message });
    var setSudo = (SUDO + "," + newSudo).replace(/,,/g, ",");
    setSudo = setSudo.startsWith(",") ? setSudo.replace(",", "") : setSudo;
    await message.sendMessage("```New sudo numbers are: ```" + setSudo, {
      quoted: message,
    });
    await message.sendMessage("*Restarting🔄*", { quoted: message });
    await heroku
      .patch(baseURI + "/config-vars", { body: { SUDO: setSudo } })
      .then(async (app) => {});
  }
);

command(
  {
    pattern: "delsudo ?(.*)",
    fromMe: isPrivate,
    desc: "delete sudo number",
    type: "heroku",
  },
  async (message, mm) => {
    var newSudo = (message.reply_message ? message.reply_message.jid : "" || mm).split(
      "@"
    )[0];
    if (!newSudo) return await message.sendMessage("*Need reply/number*");
    var setSudo = SUDO.replace(newSudo, "").replace(/,,/g, ",");
    setSudo = setSudo.startsWith(",") ? setSudo.replace(",", "") : setSudo;
    await message.sendMessage("```New sudo numbers are: ```" + setSudo, {
      quoted: message,
    });
    await message.sendMessage("*Restarting🔄*", { quoted: message });
    await heroku
      .patch(baseURI + "/config-vars", { body: { SUDO: setSudo } })
      .then(async (app) => {});
  }
);


command(
  { 
    pattern: "getsudo ?(.*)", 
    fromMe: true, 
    desc: "shows sudo", 
    type: "user" },
  async (message) => {
    await message.reply("👉🏼" +`*SUDO NUMBER ARE : ${config.SUDO}*`  +  "  ");
  }
);
