import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client)) || message.author;
    if (user.bot) return message.channel.send(`${emojis.tickNo} Bots don't have bank accounts!`);

    const winnings = (await database.getProp('economy', user.id, 'winnings')) || 0;

    const winningsEmbed = embed({
        author: {
            image: user.displayAvatarURL(),
            name: user.username,
        },
        color: message.guild?.me?.displayHexColor,
        desc: `${user.id === message.author.id ? 'Your' : 'Their'} winnings: **$${winnings.toLocaleString()}**`,
    });

    message.channel.send(winningsEmbed);
};

export const help = {
    aliases: ['winnings'],
    name: 'winnings',
    description: 'Sends your winnings',
    usage: 'winnings <user>',
    example: 'winnings\nwinnings @*',
};

export const config = {
    args: 0,
    owner: false,
};
