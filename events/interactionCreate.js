module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);

    if (!command) return;

    try {
      if (command.defer) {
        await interaction.deferReply();
      }

      await command.execute(interaction);
    } catch (error) {
      console.error("Error en comando:", error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "Ocurrió un error.",
          flags: { ephemeral: true },
        });
      } else {
        await interaction.reply({
          content: "Ocurrió un error.",
          flags: { ephemeral: true },
        });
      }
    }
  },
};
