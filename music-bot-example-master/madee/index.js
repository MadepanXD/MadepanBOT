const { Client, Util, MessageEmbed, Activity } = require("discord.js");
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
require("dotenv").config();
require("./server.js");

const bot = new Client({
    disableMentions: "all"
});

const PREFIX = process.env.PREFIX;
const youtube = new YouTube(process.env.YTAPI_KEY);
const queue = new Map();

bot.on("warn", console.warn);
bot.on("error", console.error);
bot.on('ready', () => {
    console.log('Your Bot is Online Now.');
    bot.user.setActivity(`Bokep Japanese HD ${bot.guilds.size} servers.`, { url: 'https://www.twitch.tv/harutohiroki', type: 'STREAMING' });
  });
bot.on("shardDisconnect", (event, id) => console.log(`[SHARD] Shard ${id} disconnected (${event.code}) ${event}, trying to reconnect...`));
bot.on("shardReconnecting", (id) => console.log(`[SHARD] Shard ${id} reconnecting...`));

bot.on("message", async (message) => { // eslint-disable-line
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.split(" ");
    const searchString = args.slice(1).join(" ");
    const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
    const serverQueue = queue.get(message.guild.id);

    let command = message.content.toLowerCase().split(" ")[0];
    command = command.slice(PREFIX.length);

    if (command === "help" || command === "cmd") {
        const helpembed = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor(bot.user.tag, bot.user.displayAvatarURL())
            .setDescription(`
__**Command list**__
> \`play\` > **\`play [title/url]\`**
> \`search\` > **\`search [title]\`**
> \`skip\`, \`stop\`,  \`pause\`, \`resume\`
> \`nowplaying\`, \`queue\`, \`volume\`
> \`avatar\`, \`wallpaper\`, \`vote []\`
> \`amjoke []\`, \`colorsearch[]\`, \`cuddle []\`
> \`serverinfo\`, \`kiss []\`, \`kitsune\`
> \`hentai\`, \`lockdown\``)
            .setFooter("©️ MadepanHD Production", "https://api.zhycorp.xyz/assets/images/icon.jpg");
        message.channel.send(helpembed);
    }
    if (command === "playsysysys" || command === "psysysysys") {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send("I'm sorry, but you need to be in a voice channel to play a music!");
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT")) {
            return message.channel.send("Sorry, but I need a **`CONNECT`** permission to proceed!");
        }
        if (!permissions.has("SPEAK")) {
            return message.channel.send("Sorry, but I need a **`SPEAK`** permission to proceed!");
        }
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
                await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
            }
            return message.channel.send(`✅  **|**  Playlist: **\`${playlist.title}\`** has been added to the queue`);
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    var video = await youtube.getVideoByID(videos[0].id);
                    if (!video) return message.channel.send("🆘  **|**  I could not obtain any search results");
                } catch (err) {
                    console.error(err);
                    return message.channel.send("🆘  **|**  I could not obtain any search results");
                }
            }
            return handleVideo(video, message, voiceChannel);
        }
    }
    if (command === "search" || command === "sc") {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send("I'm sorry, but you need to be in a voice channel to play a music!");
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT")) {
            return message.channel.send("Sorry, but I need a **`CONNECT`** permission to proceed!");
        }
        if (!permissions.has("SPEAK")) {
            return message.channel.send("Sorry, but I need a **`SPEAK`** permission to proceed!");
        }
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
                await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
            }
            return message.channel.send(`✅  **|**  Playlist: **\`${playlist.title}\`** has been added to the queue`);
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    let index = 0;
                    let embedPlay = new MessageEmbed()
                        .setColor("BLUE")
                        .setAuthor("Search results", message.author.displayAvatarURL())
                        .setDescription(`${videos.map(video2 => `**\`${++index}\`  |**  ${video2.title}`).join("\n")}`)
                        .setFooter("Please choose one of the following 10 results, this embed will auto-deleted in 15 seconds");
                    // eslint-disable-next-line max-depth
                    message.channel.send(embedPlay).then(m => m.delete({
                        timeout: 15000
                    }))
                    try {
                        var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
                            max: 1,
                            time: 15000,
                            errors: ["time"]
                        });
                    } catch (err) {
                        console.error(err);
                        return message.channel.send("The song selection time has expired in 15 seconds, the request has been canceled.");
                    }
                    const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                } catch (err) {
                    console.error(err);
                    return message.channel.send("🆘  **|**  I could not obtain any search results");
                }
            }
            response.delete();
            return handleVideo(video, message, voiceChannel);
        }

    } else if (command === "skip") {
        if (!message.member.voice.channel) return message.channel.send("I'm sorry, but you need to be in a voice channel to skip a music!");
        if (!serverQueue) return message.channel.send("There is nothing playing that I could skip for you");
        serverQueue.connection.dispatcher.end("[runCmd] Skip command has been used");
        return message.channel.send("⏭️  **|**  I skip this song for you");

    } else if (command === "stop") {
        if (!message.member.voice.channel) return message.channel.send("I'm sorry but you need to be in a voice channel to play music!");
        if (!serverQueue) return message.channel.send("There is nothing playing that I could stop for you");
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end("[runCmd] Stop command has been used");
        return message.channel.send("⏹️  **|**  Deleting queues and leaving voice channel...");

    } else if (command === "volume" || command === "vol") {
        if (!message.member.voice.channel) return message.channel.send("I'm sorry, but you need to be in a voice channel to set a volume!");
        if (!serverQueue) return message.channel.send("There is nothing playing");
        if (!args[1]) return message.channel.send(`The current volume is: **\`${serverQueue.volume}%\`**`);
        if (isNaN(args[1]) || args[1] > 100) return message.channel.send("Volume only can be set in a range of **\`1\`** - **\`100\`**");
        serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolume(args[1] / 100);
        return message.channel.send(`I set the volume to: **\`${args[1]}%\`**`);

    } else if (command === "nowplaying" || command === "np") {
        if (!serverQueue) return message.channel.send("There is nothing playing");
        return message.channel.send(`🎶  **|**  Now Playing: **\`${serverQueue.songs[0].title}\`**`);

    } else if (command === "queue" || command === "q") {
        if (!serverQueue) return message.channel.send("There is nothing playing");
        let embedQueue = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor("Song queue", message.author.displayAvatarURL())
            .setDescription(`${serverQueue.songs.map(song => `**-** ${song.title}`).join("\n")}`)
            .setFooter(`• Now Playing: ${serverQueue.songs[0].title}`);
        return message.channel.send(embedQueue);

    } else if (command === "pause") {
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return message.channel.send("⏸  **|**  Paused the music for you");
        }
        return message.channel.send("There is nothing playing");

    } else if (command === "resume") {
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return message.channel.send("▶  **|**  Resumed the music for you");
        }
        return message.channel.send("There is nothing playing");
    } else if (command === "loop") {
        if (serverQueue) {
            serverQueue.loop = !serverQueue.loop;
            return message.channel.send(`🔁  **|**  Loop is **\`${serverQueue.loop === true ? "enabled" : "disabled"}\`**`);
        };
        return message.channel.send("There is nothing playing");
    }
});

async function handleVideo(video, message, voiceChannel, playlist = false) {
    const serverQueue = queue.get(message.guild.id);
    const song = {
        id: video.id,
        title: Util.escapeMarkdown(video.title),
        url: `https://www.youtube.com/watch?v=${video.id}`
    };
    if (!serverQueue) {
        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 100,
            playing: true,
            loop: false
        };
        queue.set(message.guild.id, queueConstruct);
        queueConstruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            play(message.guild, queueConstruct.songs[0]);
        } catch (error) {
            console.error(`[ERROR] I could not join the voice channel, because: ${error}`);
            queue.delete(message.guild.id);
            return message.channel.send(`I could not join the voice channel, because: **\`${error}\`**`);
        }
    } else {
        serverQueue.songs.push(song);
        if (playlist) return;
        else return message.channel.send(`✅  **|**  **\`${song.title}\`** has been added to the queue`);
    }
    return;
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        return queue.delete(guild.id);
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url))
        .on("finish", () => {
            const shiffed = serverQueue.songs.shift();
            if (serverQueue.loop === true) {
                serverQueue.songs.push(shiffed);
            };
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolume(serverQueue.volume / 100);

    serverQueue.textChannel.send({
        embed: {
            color: "BLUE",
            description: `🎶  **|**  Start Playing: **\`${song.title}\`**`
        }
    });
}

bot.on('message', async message => {
    const prefix = "`";
  
    if(message.author.bot) return;
    if(!message.guild) return;
    if(!message.content.startsWith(prefix)) return;
  
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
  
    if (cmd === "avatar") {
        let avatar = message.mentions.users.size ? message.mentions.users.first().avatarURL({ format: 'png', dynamic: true, size: 2048 }) : message.author.avatarURL({ format: 'png', dynamic: true, size: 2048 });
        if (message.mentions.users.size > 0) {
          const embed = new MessageEmbed()
            .setColor("RANDOM")
            .setTitle(`Avatar for ${message.mentions.users.first().username}:`)
            .setImage(`${avatar}`)
            .setFooter(`© Avatar Code founded by XXMadpn`);
            message.channel.send({embed});
        } else {
          const embed = new MessageEmbed()
          .setColor("RANDOM")
          .setTitle(`Avatar for ${message.author.username}:`)
          .setImage(`${avatar + "?size=2048"}`)
          .setFooter(`© Avatar Code founded by XXMadpn`);
          message.channel.send({embed});
        }
    }

    const AlexAPI = require('alexflipnote.js')
    const AlexClient = new AlexAPI()

    if (cmd === "amjoke") {
        let avatar = message.mentions.users.size ? message.mentions.users.first().avatarURL({ format: 'png', dynamic: true, size: 2048 }) : message.author.avatarURL({ format: 'png', dynamic: true, size: 2048 });
        let link = await AlexClient.image.amiajoke({image: avatar})
        const embed = new MessageEmbed()
        .setColor("#ff9900")
        .setImage(link) 
        .setFooter(`© Cryptonix X Mod Bot by XXMadpn`);
         message.channel.send({embed});
    }

    if (cmd === "colorsearch") {
        if(!args[0] || args[0] === 'help') return message.reply("Please provide a valid hex code without the #")
        var isOk = /^[0-9A-F]{6}$/i.test(args[0])
        if (isOk === false) return message.reply("Please provide a valid hex code without the #")
  
        let body = await AlexClient.others.color(args[0])
  
        const embed = new MessageEmbed()
        .setColor("#ff9900")
        .setTitle(body.name)
        .setDescription("Hex: " + body.hex + '\n' + "RGB: " + body.rgb)
        .setImage(body.image) 
        .setFooter(`© Cryptonix X Mod Bot by XXMadpn`);
        message.channel.send({embed});
    }

    function checkDays(date) {
        let now = new Date();
        let diff = now.getTime() - date.getTime();
        let days = Math.floor(diff / 86400000);
        return days + (days == 1 ? " day" : " days") + " ago";
    };

    if (cmd === "serverinfo") {
        let verifLevels = ["None", "Low", "Medium", "(╯°□°）╯︵  ┻━┻", "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻"];
        let region = {
            "brazil": "Brazil",
            "eu-central": "Central Europe",
            "singapore": "Singapore",
            "us-central": "U.S. Central",
            "sydney": "Sydney",
            "us-east": "U.S. East",
            "us-south": "U.S. South",
            "us-west": "U.S. West",
            "eu-west": "Western Europe",
            "vip-us-east": "VIP U.S. East",
            "london": "London",
            "amsterdam": "Amsterdam",
            "hongkong": "Hong Kong"
        };

        var emojis;
        if (message.guild.emojis.cache.size === 0) {
            emojis = 'None';
        } else {
            emojis = message.guild.emojis.cache.size;
        }

        const embed = new MessageEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL() ? message.guild.iconURL() : client.user.displayAvatarURL())
        .setThumbnail(message.guild.iconURL())
        .setTimestamp()
        .addField("Created", `${message.guild.createdAt.toString().substr(0, 15)},\n(${checkDays(message.guild.createdAt)})`, true)
        .addField("ID", message.guild.id, true)
        .addField("Owner", `${message.guild.owner.user.username}#${message.guild.owner.user.discriminator}`, true)
        .addField("Region", region[message.guild.region], true)
        .addField("User Count", message.guild.memberCount, true)
        .addField("Member Count", message.guild.members.cache.filter(m => !m.user.bot).size, true)
        .addField("Bot Count", message.guild.members.cache.filter(m => m.user.bot).size, true)
        .addField("AFK Timeout", message.guild.afkTimeout / 60 + ' minutes', true)
        .addField("Roles", message.guild.roles.cache.size, true)
        .addField("Channels", message.guild.channels.cache.size, true)
        .addField("Emojis", `${emojis}/100`, true)
        .addField("Verification Level", message.guild.verificationLevel, true)
        .setColor(Math.floor(Math.random()*16777215))
        .setFooter(`© Cryptonix X Mod Bot by XXMadpn`);
        message.channel.send({embed});
    }

    const superagent = require('superagent');

    if (cmd === "wallpaper") {
        const { body } = await superagent
        .get("https://nekos.life/api/v2/img/wallpaper");
    
        const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Random Image for Wallpaper")
        .setImage(body.url) 
        .setFooter(`© Wallpaper Code founded by XXMadpn`)
        message.channel.send({embed})
    }

    if (cmd === "kiss") {
        if (!message.mentions.users.first()) return message.reply("You need to mention someone to kiss them :3");
        if (message.mentions.users.first().id == bot.user.id && message.author.id !== "242263403001937920") return message.reply("No kissing unless you're my Dev :<")
        if (message.mentions.users.first().id == message.author.id) return message.reply("Idk if thats possible chief")
        if (message.mentions.users.first().id == bot.user.id && message.author.id == "242263403001937920") return message.reply("B-Baka, it's not like I like it or anything >///<")
        const { body } = await superagent
        .get("https://nekos.life/api/kiss");
        
        const embed = new MessageEmbed()
        .setColor("#ff9900")
        .setTitle(`${message.author.username} kissed ${message.mentions.users.first().username} >:3`)
        .setImage(body.url) 
        .setFooter(`© Cryptonix X Mod Bot by XXMadpn`);
        message.channel.send({embed})
    }

    if (cmd === "cuddle") {

        if (!message.mentions.users.first()) return message.reply("You need to mention someone to cuddle them");
        if (message.mentions.users.first().id == bot.user.id && message.author.id !== "242263403001937920") return message.channel.send("Aww! *cuddles you* ")
        if (message.mentions.users.first().id == bot.user.id && message.author.id == "242263403001937920") return message.reply(">///< *cuddles dev-san*")
        const { body } = await superagent
        .get("https://nekos.life/api/v2/img/cuddle");
    
        const embed = new MessageEmbed()
        .setColor("#ff9900")
        .setTitle(`${message.author.username} cuddled ${message.mentions.users.first().username} OwO`)
        .setImage(body.url) 
        .setFooter(`© Cryptonix X Mod Bot by XXMadpn`);
        message.channel.send({embed})
    }

    if (cmd === "kitsune") {

        const { body } = await superagent
        .get("https://nekos.life/api/v2/img/fox_girl");
        
        const embed = new MessageEmbed()
        .setColor("#ff9900")
        .setTitle(`OwO, Here's your Fox Girl`)
        .setImage(body.url) 
        .setFooter(`© Cryptonix X Mod Bot by XXMadpn`);
        message.channel.send({embed})
    }

    if (cmd === "hentai") {

        const { body } = await superagent
        .get("https://nekos.life/api/v2/img/lewd");
        
        const embed = new MessageEmbed()
        .setColor("#ff9900")
        .setTitle(`OwO, Here's your Fox Girl`)
        .setImage(body.url) 
        .setFooter(`© Cryptonix X Mod Bot by XXMadpn`);
        message.channel.send({embed})
    }

    const ms = require('ms');

    if (cmd === "timer") {
            let Timer = args[0];
         if(isNaN(Timer)) return message.reply("heh, text time huh? How about **no**?")
         if (ms(Timer) > 2147483647) return message.reply("You dweeb how do you expect me to handle such a big number nerd!")
          if(ms(Timer) < 1) return message.reply("What's the point of that?")

         if(!args[0]){
           return message.channel.send(":x: " + "| Please Enter a time period followed by \"s or m or h\"");
         }

        if(args[0] <= 0){
         return message.channel.send(":x: " + "| Please Enter a time period followed by \"s or m or h\"");
         }

        message.channel.send(":white_check_mark: " + "| Timer Started for: " + `${ms(ms(Timer), {long: true})}`)

        setTimeout(function(){
         message.channel.send(`@${message.author.username} The Timer Has FINISHED!, it lasted: ${ms(ms(Timer), {long: true})}`)
        }, ms(Timer));
    }

    if (cmd === "lockdown") {
        if (!bot.lockit) bot.lockit = [];
        let time = args.join(' ');
        let validUnlocks = ['release', 'unlock'];
        //if (!message.member.hasPermission("MANAGE_CHANNELS")) return msg.reply("❌**Error:** You don't have the permission to do that!");
        if (!time) return message.reply('You must set a duration for the lockdown in either hours, minutes or seconds');
      
        if (validUnlocks.includes(time)) {
          message.channel.createOverwrite(message.guild.id, {
            SEND_MESSAGES: null
          }).then(() => {
            message.channel.send('Lockdown lifted.');
            clearTimeout(bot.lockit[message.channel.id]);
            delete bot.lockit[message.channel.id];
          }).catch(error => {
            console.log(error);
          });
        } else {
          message.channel.createOverwrite(message.guild.id, {
            SEND_MESSAGES: false
          }).then(() => {
            message.channel.send(`Damnn, **${message.author.username}** just locked the channel down for ${ms(ms(time), { long:true })}`).then(() => {
      
                bot.lockit[message.channel.id] = setTimeout(() => {
                message.channel.createOverwrite(message.guild.id, {
                  SEND_MESSAGES: null
                }).then(message.channel.send('Lockdown lifted. WEEEEEEEEEEEEEEEEEEEEEE, enjoy talking while you still can:wink:')).catch(console.error);
                delete bot.lockit[message.channel.id];
              }, ms(time));
      
            }).catch(error => {
              console.log(error);
            });
          });
        }
      };

    const agree    = "✅";
    const disagree = "❎";

    if (cmd === "vote") {
        if(!args || args[0] === 'help') return message.reply("Usage: vote <question>")
  // Number.isInteger(itime)
  //  if (e) return message.reply('please supply a valid time number in seconds')
  let question = message.content.split(" ").splice(1).join(" ")
  if(question.length < 1){
    let msg = await message.channel.send(`Vote now! (Vote time: 2min)`);
    await msg.react(agree);
    await msg.react(disagree);

    const reactions = await msg.awaitReactions(reaction => reaction.emoji.name === agree || reaction.emoji.name === disagree, {time: 120000});
    msg.delete();

    var NO_Count = reactions.get(disagree).count;
    var YES_Count = reactions.get(agree);

    if(YES_Count == undefined){
      var YES_Count = 1;
    }else{
      var YES_Count = reactions.get(agree).count;
    }

    var sumsum = new MessageEmbed()

              .addField("Voting Finished:", "----------------------------------------\n" +
                                            "Total votes (Yes): " + `${YES_Count-1}\n` +
                                            "Total votes (NO): " + `${NO_Count-1}\n` +
                                            "----------------------------------------", true)

              .setColor("0x#FF0000")
              .setFooter(`© Wallpaper Code founded by XXMadpn`);
    await message.channel.send({embed: sumsum});
  }else if(question.length > 1){
    let msg = await message.channel.send(`Question: ${question} \nVote now! (Vote time: 2min)`);
    await msg.react(agree);
    await msg.react(disagree);
    
    const reactions = await msg.awaitReactions(reaction => reaction.emoji.name === agree || reaction.emoji.name === disagree, {time: 120000});
    msg.delete();
    
    var NO_Count = reactions.get(disagree).count;
    var YES_Count = reactions.get(agree);
    
    if(YES_Count == undefined){
      var YES_Count = 1;
    }else{
      var YES_Count = reactions.get(agree).count;
    }
  
    var sumsum = new MessageEmbed()
    
              .addField("Voting Finished:", "----------------------------------------\n" +
                                            "Question: " + question + "\n" +
                                            "Total votes (Yes): " + `${YES_Count-1}\n` +
                                            "Total votes (NO): " + `${NO_Count-1}\n` +
                                            "----------------------------------------", true)
  
              .setColor("0x#FF0000")
              .setFooter(`© Wallpaper Code founded by XXMadpn`);
    await message.channel.send({embed: sumsum});
  }
    }
});

bot.login(process.env.BOT_TOKEN);