module.exports = {
  name: "messageCreate",

  async execute(message, client) {
    if (message.author.bot) return;

    const prefix = "$";

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = client.prefixCommands.get(commandName);

    if (!command) return;

    console.log(
      `🔧 | ${message.author.tag} used 
$$
{commandName} in #${message.channel?.name ?? "unknown"}`
    );

    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(`❌ | Error executing
$$
{commandName}:`, error);

      try {
        await message.reply("❌ | An error occurred executing the command.");
      } catch (replyError) {
        console.error("❌ | Failed to send error message:", replyError);
      }
    }
  },
};