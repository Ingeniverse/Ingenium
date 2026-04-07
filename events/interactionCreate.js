const { MessageFlags } = require("discord.js");

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);

    if (!command) {
      console.warn(`⚠️ | Command "/${interaction.commandName}" not found`);
      return;
    }

    console.log(
      `🔧 | ${interaction.user.tag} used /${interaction.commandName} in #${interaction.channel?.name ?? "unknown"}`
    );

    try {
      // ═══════════════════════════════════════
      // DEFER — con protección contra expiración
      // ═══════════════════════════════════════
      if (command.defer && !interaction.deferred && !interaction.replied) {
        try {
          await interaction.deferReply();
        } catch (deferError) {
          // Si el defer falla, la interacción ya expiró — no hay nada que hacer
          console.error(
            `⚠️ | Could not defer /${interaction.commandName}: ${deferError.message}`
          );
          return; // ← SALIR, no intentar ejecutar el comando
        }
      }

      await command.execute(interaction);
    } catch (error) {
      console.error(
        `❌ | Error executing /${interaction.commandName}:`,
        error
      );

      const errorMessage = {
        content: "❌ | An error occurred while executing this command.",
        flags: MessageFlags.Ephemeral,
      };

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      } catch (followUpError) {
        // Silenciar — la interacción ya expiró
        console.error(
          `⚠️ | Could not send error (interaction expired): ${followUpError.message}`
        );
      }
    }
  },
};