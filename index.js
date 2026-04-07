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
  ws: {
    large_threshold: 50,
  },
  rest: {
    timeout: 60000,
  },
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

client.on("debug", (info) => {
  if (
    info.includes("Connecting") ||
    info.includes("connect") ||
    info.includes("Gateway") ||
    info.includes("Session") ||
    info.includes("Heartbeat") ||
    info.includes("READY") ||
    info.includes("error") ||
    info.includes("Error") ||
    info.includes("close") ||
    info.includes("destroy")
  ) {
    console.log(`[Discord Debug] ${info}`);
  }
});

client.on("error", (error) => {
  console.error("[Discord Error]", error);
});

client.on("warn", (warning) => {
  console.warn("[Discord Warn]", warning);
});

async function start() {
  const token = process.env.TOKEN?.trim();

  if (!token) {
    console.error("❌ No TOKEN found in environment variables!");
    process.exit(1);
  }

  console.log(`🔍 Token length: ${token.length}`);
  console.log(`🔍 Token preview: ${token.substring(0, 10)}...`);

  // ═══════════════════════════════════════
  // PASO 1: Login — con retry SOLO si login falla
  // ═══════════════════════════════════════
  let loginAttempts = 0;
  const maxAttempts = 3;

  while (loginAttempts < maxAttempts) {
    try {
      loginAttempts++;
      console.log(`🔑 Login attempt ${loginAttempts}/${maxAttempts}...`);

      await client.login(token);
      console.log(`✅ Logged in as ${client.user.tag}`);
      break; // ← Login exitoso, salir del loop

    } catch (loginError) {
      console.error(`❌ Login attempt ${loginAttempts} failed: ${loginError.message}`);

      if (loginAttempts >= maxAttempts) {
        console.error("❌ All login attempts failed. Exiting.");
        process.exit(1);
      }

      console.log(`🔄 Retrying in 5 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // ═══════════════════════════════════════
  // PASO 2: Player — SEPARADO del login
  // Si falla, el bot sigue vivo pero sin música
  // ═══════════════════════════════════════
  try {
    console.log("🎵 Initializing player...");
    const setupPlayer = require("./features/player.js");
    await setupPlayer(client);
    console.log("🎵 Bot is fully ready!");
  } catch (playerError) {
    // Player falló, pero el bot SIGUE funcionando
    // NO hacer otro login — eso crea doble conexión
    console.error("❌ Player initialization failed:", playerError.message);
    console.error("⚠️ Bot is running but music features may not work.");
    console.error("⚠️ Fix the player error and redeploy.");
  }
}

start();