import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client, message.guild!)) || message.author;
    const repsEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (user.bot) return message.channel.send(repsEmbed.setDescription(`${emojis.tickNo} Bots don't have reps!`));

    const reps = (await database.getProp('economy', user.id, 'rep')) || 0;

    repsEmbed.setAuthor(user.username, user.displayAvatarURL({ dynamic: true }));
    message.channel.send(repsEmbed.setDescription(`${user.id === message.author.id ? 'Your' : 'Their'} reps: **${reps.toLocaleString()}**`));
};

export const help = {
    aliases: ['reps', 'reputations'],
    name: 'Reps',
    description: 'View your reps',
    usage: 'reps [user]',
    example: 'reps\reps @Conor#0751',
};

export const config = {
    args: 0,
    category: 'economy',
};
