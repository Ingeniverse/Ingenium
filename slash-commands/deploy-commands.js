const { REST, Routes, SlashCommandBuilder, ApplicationCommandOptionType } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commandsDir = path.join(__dirname);
const commandFiles = fs
  .readdirSync(commandsDir)
  .filter((file) => file.endsWith(".js") && file !== "deploy-commands.js");

const commands = [];

for (const file of commandFiles) {
  const command = require(path.join(commandsDir, file));

  if (!command.name || !command.description) {
    console.warn(`⚠️ | Skipping ${file}: missing name or description`);
    continue;
  }

  const builder = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description);

  if (command.options && Array.isArray(command.options)) {
    for (const option of command.options) {
      switch (option.type) {
        case ApplicationCommandOptionType.String:
          builder.addStringOption((opt) =>
            opt
              .setName(option.name)
              .setDescription(option.description)
              .setRequired(option.required ?? false)
          );
          break;
        case ApplicationCommandOptionType.Integer:
          builder.addIntegerOption((opt) =>
            opt
              .setName(option.name)
              .setDescription(option.description)
              .setRequired(option.required ?? false)
          );
          break;
        case ApplicationCommandOptionType.Boolean:
          builder.addBooleanOption((opt) =>
            opt
              .setName(option.name)
              .setDescription(option.description)
              .setRequired(option.required ?? false)
          );
          break;
        case ApplicationCommandOptionType.User:
          builder.addUserOption((opt) =>
            opt
              .setName(option.name)
              .setDescription(option.description)
              .setRequired(option.required ?? false)
          );
          break;
        case ApplicationCommandOptionType.Channel:
          builder.addChannelOption((opt) =>
            opt
              .setName(option.name)
              .setDescription(option.description)
              .setRequired(option.required ?? false)
          );
          break;
        default:
          console.warn(
            `⚠️ | Unknown option type ${option.type} in ${command.name}`
          );
      }
    }
  }

  commands.push(builder.toJSON());
}

if (!process.env.TOKEN || !process.env.CLIENT_ID) {
  console.error("❌ | Missing TOKEN or CLIENT_ID in environment variables!");
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`⏳ | Registering ${commands.length} slash commands...`);
    console.log("──────────────────────────────────");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`✅ | Successfully registered ${commands.length} commands:`);
    commands.forEach((cmd) => {
      const opts = cmd.options?.length
        ? ` [${cmd.options.map((o) => o.name).join(", ")}]`
        : "";
      console.log(`   /${cmd.name}${opts}`);
    });
    console.log("──────────────────────────────────");
  } catch (error) {
    console.error("❌ | Failed to register commands:", error);
  }
})();