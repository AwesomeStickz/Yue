import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, client: Client) => {
    const pingEmbed = embed({
        author: {
            image: client.user?.displayAvatarURL({ dynamic: true }),
            name: 'Ping',
        },
        color: message.guild?.me?.displayHexColor,
    });
    const pingMessage = await message.channel.send(pingEmbed.setDescription(`${emojis.typing} Pinging...`));
    pingMessage.edit(pingEmbed.setDescription(`Pong! Latency is ${pingMessage.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`));
};

export const help = {
    aliases: ['ping'],
    name: 'Ping',
    description: 'Checks the ping to the discord api and the bot',
    usage: 'g.ping',
};

export const config = {
    args: 0,
    category: 'bot',
};
