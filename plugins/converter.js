const { toAudio } = require("../lib/media");
command(
  {
    pattern: "mp3",
    fromMe: true,
    desc: "converts video/audio/voice to mp3",
    type: "converter",
  },
  async (message, match, m) => {
    if (!message.reply_message || (!message.reply_message.video && !message.reply_message.audio)) return await message.reply('*Reply at audio/voice/video!*')  
    let buff = await m.quoted.download();
    buff = await toAudio(buff, "mp3");
     await message.sendMessage(buff, { mimetype: "audio/mpeg", quoted: message }, "audio");
  }
);
