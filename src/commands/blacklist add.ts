import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = await utils.getUser(args[0], client, message.guild!);
    const blacklistAddEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (!user) return message.channel.send(blacklistAddEmbed.setDescription(`${emojis.tickNo} I couldn't find that user!`));
    if (user.bot) return message.channel.send(blacklistAddEmbed.setDescription(`${emojis.tickNo} You can't blacklist bots!`));

    await database.set('blacklist', user.id, args.slice(1).join(' '));

    blacklistAddEmbed.setAuthor(user.username, user.displayAvatarURL({ dynamic: true }));
    message.channel.send(blacklistAddEmbed.setDescription(`${emojis.tickYes} **${user.tag}** is blacklisted!`));
};

export const help = {
    aliases: ['blacklist add'],
    name: 'Blacklist Add',
    description: 'Add someone to blacklisted users list',
    usage: 'blacklist add <user> <reason>',
    example: 'blacklist add @Conor#0751 Alt',
};

export const config = {
    args: 0,
    owner: true,
    category: 'bot',
};
