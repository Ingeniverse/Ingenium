const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "inspire",
  description: "Get motivational quote",
  defer: true,
  async execute(interaction) {
    const res = await fetch("https://zenquotes.io/api/random");
    const data = await res.json();

    const quote = data[0].q + " -" + data[0].a;

    const embed = new EmbedBuilder()
      .setTitle("Inspirational Quote")
      .setDescription(quote)
      .setColor(0x00ff00);

    await interaction.editReply({ embeds: [embed] });
  },
};
