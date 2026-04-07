const { Player } = require("discord-player");
const {
  SpotifyExtractor,
  SoundCloudExtractor,
  AppleMusicExtractor,
  AttachmentExtractor,
} = require("@discord-player/extractor");

module.exports = async (client) => {
  // ═══════════════════════════════════════════
  // PLAYER
  // ═══════════════════════════════════════════
  const player = new Player(client);
  client.player = player;
  console.log("✅ [Player] Instance created");

  player.on("error", (error) => {
    console.error(`[Player Base Error]: ${error.message}`);
  });

  // ═══════════════════════════════════════════
  // 1. YOUTUBE
  // ═══════════════════════════════════════════
  try {
    const { YoutubeiExtractor } = require("discord-player-youtubei");

    const clients = [
      {
        name: "ANDROID_MUSIC",
        config: {
          streamOptions: {
            useClient: "ANDROID_MUSIC",
            highWaterMark: 1 << 25,
          },
          overrideBridgeMode: "yt",
        },
      },
      {
        name: "ANDROID",
        config: {
          streamOptions: {
            useClient: "ANDROID",
            highWaterMark: 1 << 25,
          },
          overrideBridgeMode: "yt",
        },
      },
      {
        name: "TV_EMBEDDED",
        config: {
          streamOptions: {
            useClient: "TV_EMBEDDED",
            highWaterMark: 1 << 25,
          },
          overrideBridgeMode: "yt",
        },
      },
      {
        name: "IOS",
        config: {
          streamOptions: {
            useClient: "IOS",
            highWaterMark: 1 << 25,
          },
          overrideBridgeMode: "yt",
        },
      },
    ];

    let registered = false;

    for (const option of clients) {
      try {
        await player.extractors.register(YoutubeiExtractor, option.config);
        console.log(`✅ [Extractor] YouTubei registered (${option.name}) — NO AUTH`);
        registered = true;
        break;
      } catch (err) {
        console.warn(`⚠️ [Extractor] YouTubei ${option.name} failed: ${err.message}`);
      }
    }

    if (!registered) {
      console.error("❌ [Extractor] YouTubei could not be registered with any client");
    }
  } catch (importError) {
    console.error(`❌ [Extractor] YouTubei import failed: ${importError.message}`);
  }

  // ═══════════════════════════════════════════
  // 2. DEEZER
  // ═══════════════════════════════════════════
  try {
    const { DeezerExtractor } = require("discord-player-deezer");
    await player.extractors.register(DeezerExtractor, {});
    console.log("✅ [Extractor] Deezer registered (FALLBACK streamer)");
  } catch (error) {
    console.error(`❌ [Extractor] Deezer failed: ${error.message}`);
  }

  // ═══════════════════════════════════════════
  // 3. SPOTIFY
  // ═══════════════════════════════════════════
  try {
    await player.extractors.register(SpotifyExtractor, {
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
    });
    console.log("✅ [Extractor] Spotify registered");
  } catch (error) {
    console.error(`❌ [Extractor] Spotify failed: ${error.message}`);
  }

  // ═══════════════════════════════════════════
  // 4. APPLE MUSIC
  // ═══════════════════════════════════════════
  try {
    await player.extractors.register(AppleMusicExtractor, {});
    console.log("✅ [Extractor] Apple Music registered");
  } catch (error) {
    console.error(`❌ [Extractor] Apple Music failed: ${error.message}`);
  }

  // ═══════════════════════════════════════════
  // 5. SOUNDCLOUD
  // ═══════════════════════════════════════════
  try {
    await player.extractors.register(SoundCloudExtractor, {});
    console.log("✅ [Extractor] SoundCloud registered");
  } catch (error) {
    console.error(`❌ [Extractor] SoundCloud failed: ${error.message}`);
  }

  // ═══════════════════════════════════════════
  // 6. ATTACHMENTS
  // ═══════════════════════════════════════════
  try {
    await player.extractors.register(AttachmentExtractor, {});
    console.log("✅ [Extractor] Attachment registered");
  } catch (error) {
    console.error(`❌ [Extractor] Attachment failed: ${error.message}`);
  }

  // ═══════════════════════════════════════════
  // Log extractors
  // ═══════════════════════════════════════════
  console.log("\n📦 Loaded extractors:");
  let i = 1;
  player.extractors.store.forEach((ext, key) => {
    console.log(`   ${i}. ${key}`);
    i++;
  });

  if (player.extractors.store.size === 0) {
    console.error("⚠️ WARNING: No extractors loaded!");
  }
  console.log("");

  // ═══════════════════════════════════════════
  // Event Handlers
  // ═══════════════════════════════════════════

  player.on("debug", (message) => {
    if (
      message.includes("Lag Monitor") ||
      message.includes("[NW]") ||
      message.includes("[WS]")
    )
      return;
    console.log(`[Player Debug] ${message}`);
  });

  player.events.on("debug", (queue, message) => {
    if (
      message.includes("[NW]") ||
      message.includes("[WS]") ||
      message.includes("Lag Monitor")
    )
      return;
    console.log(`[Queue Debug] ${message}`);
  });

  player.events.on("playerError", (queue, error, track) => {
    console.error(`[Player Error] "${track?.title}":`, error.message);
    queue.metadata?.channel
      ?.send(`❌ | Error al reproducir **${track?.title}**: ${error.message}`)
      .catch(() => {});
  });

  player.events.on("error", (queue, error) => {
    console.error(`[Queue Error] [${queue?.guild?.name}]: ${error.message}`);
  });

  player.events.on("playerStart", (queue, track) => {
    console.log(`[Player] ▶️ ${track.title} | Source: ${track.source}`);
    queue.metadata?.channel
      ?.send(
        `🎶 | Reproduciendo: **${track.title}** en **${queue.channel.name}**!\n` +
          `📡 Fuente: \`${track.source}\``
      )
      .catch(() => {});
  });

  player.events.on("audioTrackAdd", (queue, track) => {
    queue.metadata?.channel
      ?.send(`🎶 | **${track.title}** añadido a la cola!`)
      .catch(() => {});
  });

  player.events.on("disconnect", (queue) => {
    queue.metadata?.channel?.send("❌ | Desconectado!").catch(() => {});
  });

  player.events.on("emptyChannel", (queue) => {
    queue.metadata?.channel
      ?.send("❌ | Canal vacío, saliendo...")
      .catch(() => {});
  });

  player.events.on("emptyQueue", (queue) => {
    queue.metadata?.channel?.send("✅ | Cola terminada!").catch(() => {});
  });

  player.events.on("playerSkip", (queue, track) => {
    console.warn(`[Player] ⏭️ Skipped "${track.title}" (${track.source})`);
    queue.metadata?.channel
      ?.send(`⚠️ | Saltando **${track.title}** — no se pudo reproducir.`)
      .catch(() => {});
  });

  console.log("✅ Player initialized successfully!\n");
};