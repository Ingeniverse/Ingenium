const { ApplicationCommandOptionType, MessageFlags } = require("discord.js");
const { useMainPlayer } = require("discord-player");

module.exports = {
  name: "play",
  description: "Play a song in your voice channel",
  options: [
    {
      name: "query",
      description: "Song name or URL (YouTube, Spotify, SoundCloud, etc.)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  defer: true,

  async execute(interaction) {
    // ═══════════════════════════════════════
    // Si llegamos aquí, deferReply YA se hizo
    // Solo usar followUp()
    // ═══════════════════════════════════════
    const player = useMainPlayer();
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      return interaction.followUp({
        content: "❌ | You need to be in a voice channel to play music!",
        flags: MessageFlags.Ephemeral,
      });
    }

    const botVoiceChannelId = interaction.guild?.members?.me?.voice?.channelId;
    if (botVoiceChannelId && voiceChannel.id !== botVoiceChannelId) {
      return interaction.followUp({
        content: "❌ | I'm already playing in a different voice channel!",
        flags: MessageFlags.Ephemeral,
      });
    }

    const query = interaction.options.getString("query");

    if (query.includes("discord.com/channels/")) {
      return interaction.followUp({
        content:
          "❌ | That's a Discord message link, not a media URL!\n" +
          "💡 Provide a URL or search term.\n" +
          "Example: `/play Never Gonna Give You Up`",
      });
    }

    try {
      console.log(`[Play] Searching for: "${query}"`);

      // Intentar primero con Deezer directamente
      const searchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: "deezer", // ← Forzar Deezer primero
      });

      // Si Deezer no encuentra, buscar con auto
      const finalResult = searchResult.hasTracks()
        ? searchResult
        : await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: "auto",
          });

      if (!finalResult.hasTracks()) {
        return interaction.followUp({
          content: `❌ | No results for: **${query}**`,
        });
      }

      const result = await player.play(voiceChannel, finalResult, {
        nodeOptions: {
          metadata: { channel: interaction.channel },
          bufferingTimeout: 15000,
          leaveOnStop: true,
          leaveOnStopCooldown: 5000,
          leaveOnEnd: true,
          leaveOnEndCooldown: 15000,
          leaveOnEmpty: true,
          leaveOnEmptyCooldown: 300000,
          selfDeaf: true,
        },
        requestedBy: interaction.user,
      });

      console.log(
        `[Play] Found: ${result.track.title} | Source: ${result.track.source}`,
      );

      const isPlaylist = result.searchResult.hasPlaylist();

      return interaction.followUp({
        content: isPlaylist
          ? `🎶 | Queued **${result.searchResult.playlist.title}** with ${result.searchResult.tracks.length} tracks!`
          : `🎶 | Loading **${result.track.title}**...`,
      });
    } catch (error) {
      console.error("[Play] Error:", error);
      return interaction.followUp({
        content: `❌ | Something went wrong: ${error.message}`,
      });
    }
  },
};
