module.exports = {
  name: "inspire",
  description: "Get motivational quote",

  async execute(interaction) {

    const res = await fetch("https://zenquotes.io/api/random");
    const data = await res.json();

    const quote = data[0].q + " -" + data[0].a;

    await interaction.reply(quote);
  }
};