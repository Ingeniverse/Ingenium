const { Player } = require("discord-player");
const { DefaultExtractors } = require("@discord-player/extractor");
const { YoutubeiExtractor } = require("discord-player-youtubei");

module.exports = async (client) => {
  const player = new Player(client);
  client.player = player;

  await player.extractors.register(YoutubeiExtractor, {
    streamOptions: {
      useClient: "ANDROID",
    },
  });

  await player.extractors.loadMulti(DefaultExtractors, {
    YouTubeExtractor: false,
  });

  console.log("✅ Loaded extractors:");
  player.extractors.store.forEach((ext, key) => {
    console.log(`   - ${key}`);
  });

  player.on("debug", (message) => {
    if (
      message.includes("Lag Monitor") ||
      message.includes("[NW]") ||
      message.includes("[WS]")
    ) {
      return; 
    }
    console.log(`[Player Debug] ${message}`);
  });

  player.events.on("debug", (queue, message) => {
    if (
      message.includes("[NW]") ||
      message.includes("[WS]") ||
      message.includes("Lag Monitor")
    ) {
      return;
    }
    console.log(`[Queue Debug] ${message}`);
  });

  player.events.on("playerError", (queue, error, track) => {
    console.error(
      `[Player Error] Track "${track?.title}":`,
      error.message
    );
    queue.metadata.channel.send(
      `❌ | Error playing **${track?.title}**: ${error.message}`
    );
  });

  player.events.on("error", (queue, error) => {
    console.error(
      `[Queue Error] [${queue.guild.name}]: ${error.message}`
    );
  });

  player.events.on("playerStart", (queue, track) => {
    console.log(
      `[Player] ▶️ Now playing: ${track.title} | Source: ${track.source}`
    );
    queue.metadata.channel.send(
      `🎶 | Now playing: **${track.title}** in **${queue.channel.name}**!`
    );
  });

  player.events.on("audioTrackAdd", (queue, track) => {
    console.log(`[Player] ➕ Track added: ${track.title}`);
    queue.metadata.channel.send(
      `🎶 | Track **${track.title}** queued!`
    );
  });

  player.events.on("disconnect", (queue) => {
    console.log(`[Player] 🔌 Disconnected from ${queue.guild.name}`);
    queue.metadata.channel.send(
      "❌ | I was manually disconnected, clearing queue!"
    );
  });

  player.events.on("emptyChannel", (queue) => {
    console.log(`[Player] 👻 Empty channel in ${queue.guild.name}`);
    queue.metadata.channel.send(
      "❌ | Nobody is in the voice channel, leaving..."
    );
  });

  player.events.on("emptyQueue", (queue) => {
    console.log(`[Player] ✅ Queue ended in ${queue.guild.name}`);
    queue.metadata.channel.send("✅ | Queue finished!");
  });

  player.events.on("playerSkip", (queue, track) => {
    console.warn(`[Player] ⏭️ Skipped "${track.title}" — unplayable`);
    queue.metadata.channel.send(
      `⚠️ | Skipped **${track.title}** because it was unplayable.`
    );
  });

  console.log("✅ Player initialized successfully!");
};