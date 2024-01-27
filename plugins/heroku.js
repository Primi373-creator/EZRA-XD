const got = require("got");
const Heroku = require("heroku-client");
const { command, isPrivate, tiny } = require("../lib/");
const Config = require("../config");
const heroku = new Heroku({ token: Config.HEROKU_API_KEY });
const baseURI = "/apps/" + Config.HEROKU_APP_NAME;
const simpleGit = require("simple-git");
const { secondsToDHMS } = require("../lib");
const git = simpleGit();
const exec = require("child_process").exec;

/* Copyright (C) 2022 X-Electra.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
X-Asena - X-Electra
*/

command(
  {
    pattern: "restart",
    fromMe: true,
    type: "heroku",
    desc: "Restart Dyno",
    type: "heroku",
  },
  async (message) => {
    await message.sendMessage(`_Restarting_`);
    await heroku.delete(baseURI + "/dynos").catch(async (error) => {
      await message.sendMessage(`HEROKU : ${error.body.message}`);
    });
  }
);

/* Copyright (C) 2022 X-Electra.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
X-Asena - X-Electra
*/

command(
  {
    pattern: "shutdown",
    fromMe: true,
    type: "heroku",
    desc: "Dyno off",
    type: "heroku",
  },
  async (message) => {
    await heroku
      .get(baseURI + "/formation")
      .then(async (formation) => {
        await message.sendMessage(`_Shutting down._`);
        await heroku.patch(baseURI + "/formation/" + formation[0].id, {
          body: {
            quantity: 0,
          },
        });
      })
      .catch(async (error) => {
        await message.sendMessage(`HEROKU : ${error.body.message}`);
      });
  }
);

/* Copyright (C) 2022 X-Electra.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
X-Asena - X-Electra
*/

command(
  {
    pattern: "dyno",
    fromMe: isPrivate,
    desc: "Show Quota info",
    type: "heroku",
  },
  async (message) => {
    try {
      heroku
        .get("/account")
        .then(async (account) => {
          const url = `https://api.heroku.com/accounts/${account.id}/actions/get-quota`;
          headers = {
            "User-Agent": "Chrome/80.0.3987.149 Mobile Safari/537.36",
            Authorization: "Bearer " + Config.HEROKU_API_KEY,
            Accept: "application/vnd.heroku+json; version=3.account-quotas",
          };
          const res = await got(url, { headers });
          const resp = JSON.parse(res.body);
          const total_quota = Math.floor(resp.account_quota);
          const quota_used = Math.floor(resp.quota_used);
          const remaining = total_quota - quota_used;
          const quota = `Total Quota : ${secondsToDHMS(total_quota)}
Used  Quota : ${secondsToDHMS(quota_used)}
Remaning    : ${secondsToDHMS(remaining)}`;
          await message.sendMessage("```" + quota + "```");
        })
        .catch(async (error) => {
          return await message.sendMessage(`HEROKU : ${error.body.message}`);
        });
    } catch (error) {
      await message.sendMessage(error);
    }
  }
);

/* Copyright (C) 2022 X-Electra.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
X-Asena - X-Electra
*/

command(
  {
    pattern: "setvar ",
    fromMe: true,
    type: "heroku",
    desc: "Set heroku env",
    type: "heroku",
  },
  async (message, match) => {
    if (!match)
      return await message.sendMessage(`_Example: .setvar SUDO:918113921898_`);
    const [key, value] = match.split(":");
    if (!key || !value)
      return await message.sendMessage(`_Example: .setvar SUDO:918113921898_`);
    heroku
      .patch(baseURI + "/config-vars", {
        body: {
          [key.toUpperCase()]: value,
        },
      })
      .then(async () => {
        await message.sendMessage(`_${key.toUpperCase()}: ${value}_`);
      })
      .catch(async (error) => {
        await message.sendMessage(`HEROKU : ${error.body.message}`);
      });
  }
);

/* Copyright (C) 2022 X-Electra.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
X-Asena - X-Electra
*/

command(
  {
    pattern: "delvar ",
    fromMe: true,
    type: "heroku",
    desc: "Delete Heroku env",
    type: "heroku",
  },
  async (message, match) => {
    if (!match) return await message.sendMessage(`_Example: delvar sudo_`);
    heroku
      .get(baseURI + "/config-vars")
      .then(async (vars) => {
        const key = match.trim().toUpperCase();
        if (vars[key]) {
          await heroku.patch(baseURI + "/config-vars", {
            body: {
              [key]: null,
            },
          });
          return await message.sendMessage(`_Deleted ${key}_`);
        }
        await message.sendMessage(`_${key} not found_`);
      })
      .catch(async (error) => {
        await message.sendMessage(`HEROKU : ${error.body.message}`);
      });
  }
);

/* Copyright (C) 2022 X-Electra.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
X-Asena - X-Electra
*/

command(
  {
    pattern: "getvar ",
    fromMe: true,
    type: "heroku",
    desc: "Show heroku env",
    type: "heroku",
  },
  async (message, match) => {
    if (!match) return await message.sendMessage(`_Example: getvar sudo_`);
    const key = match.trim().toUpperCase();
    heroku
      .get(baseURI + "/config-vars")
      .then(async (vars) => {
        if (vars[key]) {
          return await message.sendMessage(
            "_{} : {}_".replace("{}", key).replace("{}", vars[key])
          );
        }
        await message.sendMessage(`${key} not found`);
      })
      .catch(async (error) => {
        await message.sendMessage(`HEROKU : ${error.body.message}`);
      });
  }
);

/* Copyright (C) 2022 X-Electra.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
X-Asena - X-Electra
*/

command(
  {
    pattern: "allvar",
    fromMe: true,
    type: "heroku",
    desc: "Heroku all env",
    type: "heroku",
  },
  async (message) => {
    let msg = "```Here your all Heroku vars\n\n\n";
    heroku
      .get(baseURI + "/config-vars")
      .then(async (keys) => {
        for (const key in keys) {
          msg += `${key} : ${keys[key]}\n\n`;
        }
        return await message.sendMessage(msg + "```");
      })
      .catch(async (error) => {
        await message.sendMessage(`HEROKU : ${error.body.message}`);
      });
  }
);

/* Copyright (C) 2022 X-Electra.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
X-Asena - X-Electra
*/


const { SUDO } = require("../config");
const { command, isPrivate } = require("../lib");
const Config = require("../config");
const Heroku = require("heroku-client");
const heroku = new Heroku({ token: Config.HEROKU_API_KEY });
const baseURI = "/apps/" + Config.HEROKU_APP_NAME;
command(
  { pattern: "setsudo ?(.*)", fromMe: isPrivate, desc: "set new sudo", type: "heroku" },
  async (message, mm) => {
    var newSudo = (message.reply_message ? message.reply_message.jid : "" || mm).split(
      "@"
    )[0];
    if (!newSudo)
      return await message.sendMessage("*Need reply/mention/number*", { quoted: message });
    var setSudo = (SUDO + "," + newSudo).replace(/,,/g, ",");
    setSudo = setSudo.startsWith(",") ? setSudo.replace(",", "") : setSudo;
    await message.sendMessage("```new sudo numbers are: ```" + setSudo, {
      quoted: message,
    });
    await message.sendMessage("*It takes 30 seconds to make effect*", { quoted: message });
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
    if (!newSudo) return await message.sendMessage("*Need reply/mention/number*");
    var setSudo = SUDO.replace(newSudo, "").replace(/,,/g, ",");
    setSudo = setSudo.startsWith(",") ? setSudo.replace(",", "") : setSudo;
    await message.sendMessage("```new sudo numbers are: ```" + setSudo, {
      quoted: message,
    });
    await message.sendMessage("*It takes 30 seconds to make effect*", { quoted: message });
    await heroku
      .patch(baseURI + "/config-vars", { body: { SUDO: setSudo } })
      .then(async (app) => {});
  }
);

command(
  { pattern: "getsudo ?(.*)", 
    fromMe: isPrivate, 
    desc: "shows sudo numbers", 
    type: "heroku" 
  },
  async (message, match) => {
    const vars = await heroku
      .get(baseURI + "/config-vars")
      .catch(async (error) => {
        return await message.send("HEROKU : " + error.body.message);
      });
    await message.sendMessage("```" + `SUDO number are : ${config.SUDO}` + "```");
  }
);
