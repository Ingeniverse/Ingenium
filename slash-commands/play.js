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
    const player = useMainPlayer();
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      return interaction.followUp({
        content: "❌ | You need to be in a voice channel to play music!",
        ephemeral: MessageFlags.Ephemeral,
      });
    }

    const botVoiceChannelId =
      interaction.guild?.members?.me?.voice?.channelId;
    if (botVoiceChannelId && voiceChannel.id !== botVoiceChannelId) {
      return interaction.followUp({
        content: "❌ | I'm already playing in a different voice channel!",
        ephemeral: MessageFlags.Ephemeral,
      });
    }

    const query = interaction.options.getString("query");

    if (query.includes("discord.com/channels/")) {
      return interaction.followUp({
        content:
          "❌ | That's a Discord message link, not a media URL!\n" +
          "💡 Please provide a YouTube/Spotify/SoundCloud URL or a search term.\n" +
          "Example: `/play Never Gonna Give You Up` or `/play https://youtube.com/watch?v=...`",
      });
    }

    try {
      console.log(`[Play] Searching for: "${query}"`);

      const result = await player.play(voiceChannel, query, {
        nodeOptions: {
          metadata: {
            channel: interaction.channel,
          },
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

      console.log(`[Play] Found: ${result.track.title} | Source: ${result.track.source}`);

      const isPlaylist = result.searchResult.hasPlaylist();

      return interaction.followUp({
        content: isPlaylist
          ? `🎶 | Queued **${result.searchResult.playlist.title}** playlist with ${result.searchResult.tracks.length} tracks!`
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