const { command , isPrivate , getBuffer} = require("../lib");
const fetch = require("node-fetch");
const { SPARKY_API, CAPTION } = require("../config");



command(
    {
        pattern: "insta",
        fromMe: isPrivate,
        desc: "Instagram Video/Photo Downloader",
        type: "downloader",
    },
    async (message, match) => {
    	
    	
   if (!match.includes("https://www.instagram"))return message.reply(`*Need instagram link!*`)
      var ig = await (await fetch(`${SPARKY_API}/downloader/igdl?url=${match}`)).json();
     var igdl = ig;
    let res = await getBuffer(`${igdl.data.data[0].url}`)
    let mtype = igdl.data.data[0].type;
      if(mtype == "video"){
       await message.client.sendMessage(message.jid, { video :res ,  mimetype:"video/mp4", caption: (CAPTION)}, {quoted: message })
      } else if(mtype == "image"){
      await message.client.sendMessage(message.jid, { image :res ,  mimetype:"image/jpeg",caption: (CAPTION)}, {quoted: message })
}
             
});
