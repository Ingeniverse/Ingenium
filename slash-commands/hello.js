module.exports = {
  name: "hello",
  description: "Say hello world",

  async execute(interaction) {
    await interaction.editReply("Hello World!");
  },
};
