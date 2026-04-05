const { useMainPlayer, useQueue } = require("discord-player");

module.exports = {
  name: "skip",
  description: "Skip the current song",
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

    try {
      queue.node.skip();

      return interaction.followUp({
        content: `⏭️ | Skipped **${currentTrack.title}**!`,
      });
    } catch (error) {
      console.error(error);
      return interaction.followUp({
        content: "❌ | Something went wrong trying to skip!",
      });
    }
  },
};