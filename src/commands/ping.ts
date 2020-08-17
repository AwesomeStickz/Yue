import { Client, Message } from 'discord.js';

export const run = async (message: Message, client: Client) => {
    const pingMessage = await message.channel.send('<a:typing:393848431413559296> Pinging...');
    pingMessage.edit(`Pong! Latency is ${pingMessage.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
};

export const help = {
    aliases: ['ping'],
    name: 'Ping',
    description: 'Checks the ping to the discord api and the bot',
    usage: 'g.ping',
};

export const config = {
    args: 0,
    restricted: false,
};
