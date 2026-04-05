require("dotenv").config();
console.log(`🔍 TOKEN exists: ${!!process.env.TOKEN}`);
console.log(`🔍 CLIENT_ID exists: ${!!process.env.CLIENT_ID}`);
console.log(`🔍 PORT: ${process.env.PORT}`);

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
process.env.FFMPEG_PATH = ffmpegPath;
console.log(`✅ FFmpeg path: ${ffmpegPath}`);

const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const keepAlive = require("./server");

keepAlive();

const slashCommandFiles = fs
  .readdirSync("./slash-commands")
  .filter((file) => file.endsWith(".js") && file !== "deploy-commands.js");
const prefixCommandFiles = fs
  .readdirSync("./prefix-commands")
  .filter((file) => file.endsWith(".js"));
const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

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

console.log("📂 Loading events:");
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  console.log(`   - ${event.name} (${file}) ${event.once ? "[once]" : "[on]"}`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

const setupPlayer = require("./features/player.js");
setupPlayer(client)
  .then(() => {
    console.log("🔑 Logging in to Discord...");
    return client.login(process.env.TOKEN);
  })
  .catch((error) => {
    console.error("❌ Failed to initialize:", error);
    process.exit(1);
  });