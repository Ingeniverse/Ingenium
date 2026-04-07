const { Player } = require("discord-player");
const {
  SpotifyExtractor,
  SoundCloudExtractor,
  AppleMusicExtractor,
  AttachmentExtractor,
} = require("@discord-player/extractor");
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { DeezerExtractor } = require("discord-player-deezer"); // ← NUEVO

module.exports = async (client) => {
  const player = new Player(client, {
    ytdlOptions: {
      highWaterMark: 1 << 25,
    },
  });
  client.player = player;

  // ═══════════════════════════════════════════
  // 1. YOUTUBE — OAuth (más estable que cookies)
  // ═══════════════════════════════════════════
  try {
    const { YoutubeiExtractor } = require("discord-player-youtubei");

    // Determinar tipo de autenticación
    let authConfig = {};

    if (process.env.YT_CREDENTIALS) {
      // OAuth (recomendado)
      try {
        const credentials = JSON.parse(process.env.YT_CREDENTIALS);
        authConfig = {
          authentication: credentials,
        };
        console.log("🔑 [YouTube] Using OAuth credentials");
      } catch (parseError) {
        console.error("❌ [YouTube] Failed to parse YT_CREDENTIALS JSON");
      }
    } else if (process.env.YT_COOKIES) {
      // Cookies (fallback)
      authConfig = {
        authentication: process.env.YT_COOKIES,
      };
      console.log("🍪 [YouTube] Using cookies");
    } else {
      console.warn("⚠️ [YouTube] No authentication provided!");
    }

    await player.extractors.register(YoutubeiExtractor, {
      ...authConfig,
      streamOptions: {
        useClient: "ANDROID_MUSIC",
        highWaterMark: 1 << 25,
      },
      overrideBridgeMode: "yt",
    });
    console.log("✅ [Extractor] YouTubei registered");
  } catch (error) {
    console.error(`❌ [Extractor] YouTubei failed: ${error.message}`);
  }

  // ═══════════════════════════════════════════
  // 2. SPOTIFY
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
  // 3. DEEZER
  // ═══════════════════════════════════════════
  try {
    await player.extractors.register(DeezerExtractor, {});
    console.log("✅ [Extractor] Deezer registered");
  } catch (error) {
    console.error(`❌ [Extractor] Deezer failed: ${error.message}`);
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

  console.log("\n📦 Loaded extractors (priority order):");
  let i = 1;
  player.extractors.store.forEach((ext, key) => {
    console.log(`   ${i}. ${key}`);
    i++;
  });
  console.log("");

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
    queue.metadata.channel.send(
      `❌ | Error al reproducir **${track?.title}**: ${error.message}`,
    );
  });

  player.events.on("error", (queue, error) => {
    console.error(`[Queue Error] [${queue.guild.name}]: ${error.message}`);
  });

  player.events.on("playerStart", (queue, track) => {
    console.log(`[Player] ▶️ ${track.title} | Source: ${track.source}`);
    queue.metadata.channel.send(
      `🎶 | Reproduciendo: **${track.title}** en **${queue.channel.name}**!\n` +
        `📡 Fuente: \`${track.source}\``,
    );
  });

  player.events.on("audioTrackAdd", (queue, track) => {
    queue.metadata.channel.send(`🎶 | **${track.title}** añadido a la cola!`);
  });

  player.events.on("disconnect", (queue) => {
    queue.metadata.channel.send("❌ | Desconectado, limpiando cola!");
  });

  player.events.on("emptyChannel", (queue) => {
    queue.metadata.channel.send("❌ | Canal vacío, saliendo...");
  });

  player.events.on("emptyQueue", (queue) => {
    queue.metadata.channel.send("✅ | Cola terminada!");
  });

  player.events.on("playerSkip", (queue, track) => {
    console.warn(`[Player] ⏭️ Skipped "${track.title}" (${track.source})`);
    queue.metadata.channel.send(
      `⚠️ | Saltando **${track.title}** — no se pudo reproducir.`,
    );
  });

  console.log("✅ Player initialized successfully!\n");
};
