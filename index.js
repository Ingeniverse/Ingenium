const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const keepAlive = require("./server");

const commandFiles = fs.readdirSync("./commands");
const eventFiles = fs.readdirSync("./events");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Map();



for (const file of commandFiles) {

  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);

}

for (const file of eventFiles) {

  const event = require(`./events/${file}`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }

}

keepAlive();
client.login(process.env.TOKEN);
