import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = await utils.getUser(args[0], client, message.guild!);
    const blacklistEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (!user) return message.channel.send(blacklistEmbed.setDescription(`${emojis.tickNo} I couldn't find that user!`));
    if (user.bot) return message.channel.send(blacklistEmbed.setDescription(`${emojis.tickNo} You can't blacklist bots!`));

    await database.set('blacklist', user.id, args.slice(1).join(' '));

    blacklistEmbed.setAuthor(user.username, user.displayAvatarURL({ dynamic: true }));
    message.channel.send(blacklistEmbed.setDescription(`${emojis.tickYes} **${user.tag}** is blacklisted!`));
};

export const help = {
    aliases: ['blacklist'],
    name: 'Blacklist',
    description: 'Blacklist someone',
    usage: 'blacklist <user> <reason>',
    example: 'blacklist @Conor#0751 Violating rules',
};

export const config = {
    args: 0,
    owner: true,
    category: 'bot',
};
