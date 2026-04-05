const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
process.env.FFMPEG_PATH = ffmpegPath;
console.log(`✅ FFmpeg path: ${ffmpegPath}`);

const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const keepAlive = require("./server");

const slashCommandFiles = fs
  .readdirSync("./slash-commands")
  .filter((file) => file.endsWith(".js") && file !== "deploy-commands.js");
const prefixCommandFiles = fs
  .readdirSync("./prefix-commands")
  .filter((file) => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./events");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.slashCommands = new Map();
client.prefixCommands = new Map();

for (const file of slashCommandFiles) {
  const command = require(`./slash-commands/${file}`);
  client.slashCommands.set(command.name, command);
}

for (const file of prefixCommandFiles) {
  const command = require(`./prefix-commands/${file}`);
  client.prefixCommands.set(command.name, command);
}

for (const file of eventFiles) {
  const event = require(`./events/${file}`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

const setupPlayer = require("./features/player.js");
setupPlayer(client).catch(console.error);

keepAlive();
client.login(process.env.TOKEN);
