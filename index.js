require("dotenv").config();

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
  console.log(
    `   - ${event.name} (${file}) ${event.once ? "[once]" : "[on]"}`
  );

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

async function start() {
  try {
    const token = process.env.TOKEN;
    console.log(`🔍 Token length: ${token?.length}`);
    console.log(`🔍 Token preview: ${token?.substring(0, 10)}...`);

    console.log("🔑 Logging in to Discord...");

    const loginPromise = client.login(token);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Login timed out after 30s")),
        30000
      )
    );

    await Promise.race([loginPromise, timeoutPromise]);
    console.log(`✅ Logged in as ${client.user.tag}`);

    console.log("🎵 Initializing player...");
    const setupPlayer = require("./features/player.js");
    await setupPlayer(client);
    console.log("🎵 Bot is fully ready!");
  } catch (error) {
    console.error("❌ Failed to start:", error.message);
    console.error("❌ Full error:", error);
  }
}

start();