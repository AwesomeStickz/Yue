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
    if (user.bot) return message.channel.send(blacklistAddEmbed.setDescription(`${emojis.tickNo} You can't unblacklist bots!`));

    await database.delete('blacklist', user.id);

    blacklistAddEmbed.setAuthor(user.username, user.displayAvatarURL({ dynamic: true }));
    message.channel.send(blacklistAddEmbed.setDescription(`${emojis.tickYes} **${user.tag}** is unblacklisted!`));
};

export const help = {
    aliases: ['blacklist remove'],
    name: 'Blacklist Remove',
    description: 'Remove someone from blacklisted users list',
    usage: 'blacklist remove <user>',
    example: 'blacklist remove @Conor#0751',
};

export const config = {
    args: 0,
    owner: true,
    category: 'bot',
};
