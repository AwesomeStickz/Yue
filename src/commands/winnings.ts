import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client, message.guild!)) || message.author;
    const winningsEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (user.bot) return message.channel.send(winningsEmbed.setDescription(`${emojis.tickNo} Bots don't have bank accounts!`));

    const winnings = (await database.getProp('economy', user.id, 'winnings')) || 0;

    winningsEmbed.setAuthor(user.username, user.displayAvatarURL());
    message.channel.send(winningsEmbed.setDescription(`${user.id === message.author.id ? 'Your' : 'Their'} winnings: **$${winnings.toLocaleString()}**`));
};

export const help = {
    aliases: ['winnings'],
    name: 'winnings',
    description: 'Sends your winnings',
    usage: 'winnings <user>',
    example: 'winnings\nwinnings @Conor#0751',
};

export const config = {
    args: 0,
};
