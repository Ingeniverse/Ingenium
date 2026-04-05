module.exports = {
  name: "hello",
  description: "Say hello world",
  defer: true,

  async execute(interaction) {
    await interaction.editReply("Hello World!");
  },
};
