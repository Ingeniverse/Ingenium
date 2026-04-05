module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);

    if (!command) {
      console.warn(
        `⚠️ | Command "/${interaction.commandName}" not found in slashCommands map`
      );
      return;
    }

    console.log(
      `🔧 | ${interaction.user.tag} used /${interaction.commandName} in #${interaction.channel?.name ?? "unknown"}`
    );

    try {
      if (command.defer && !interaction.deferred && !interaction.replied) {
        await interaction.deferReply();
      }

      await command.execute(interaction);
    } catch (error) {
      console.error(
        `❌ | Error executing /${interaction.commandName}:`,
        error
      );

      const errorMessage = {
        content: "❌ | An error occurred while executing this command.",
        ephemeral: true,
      };

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      } catch (followUpError) {
        console.error(
          "❌ | Failed to send error message to user:",
          followUpError
        );
      }
    }
  },
};