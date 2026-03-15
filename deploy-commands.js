const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('inspire')
    .setDescription('Get a motivational quote'),

  new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Say hello')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands }
).then(() => console.log("Slash commands registered"));