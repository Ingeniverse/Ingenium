const { EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
  name: "queue",
  description: "Show the current music queue",
  defer: true,

  async execute(interaction) {
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      return interaction.followUp({
        content: "❌ | You need to be in a voice channel!",
        ephemeral: true,
      });
    }

    const botVoiceChannelId =
      interaction.guild?.members?.me?.voice?.channelId;
    if (botVoiceChannelId && voiceChannel.id !== botVoiceChannelId) {
      return interaction.followUp({
        content: "❌ | You are not in my voice channel!",
        ephemeral: true,
      });
    }

    const queue = useQueue(interaction.guildId);

    if (!queue || !queue.isPlaying()) {
      return interaction.followUp({
        content: "❌ | No music is being played!",
      });
    }

    const currentTrack = queue.currentTrack;

    const tracks = queue.tracks.toArray().slice(0, 10);

    const trackList = tracks
      .map(
        (track, i) =>
          `**${i + 1}.** [${track.title}](${track.url}) — \`${track.duration}\` | Requested by: ${track.requestedBy}`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🎶 Music Queue")
      .setDescription(
        `**Now Playing:**\n` +
          `[${currentTrack.title}](${currentTrack.url}) — \`${currentTrack.duration}\`\n` +
          `Requested by: ${currentTrack.requestedBy}\n\n` +
          `**Up Next:**\n${trackList || "The queue is empty."}`
      )
      .setThumbnail(currentTrack.thumbnail)
      .setColor(0x00ff00)
      .setFooter({
        text: `${queue.tracks.size} song(s) in queue | Total queue size: ${queue.estimatedDuration > 0 ? formatDuration(queue.estimatedDuration) : "N/A"}`,
      });

    return interaction.followUp({ embeds: [embed] });
  },
};

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}