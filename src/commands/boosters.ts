import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[], prefix: string): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client, message.guild!)) || message.author;
    const boosterEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (user.bot) return message.channel.send(boosterEmbed.setDescription(`${emojis.tickNo} Bots don't have boosters!`));

    const userBoosters: { name: string; endTime: number }[] = (await database.getProp('economy', user.id, 'boosters')) || [];

    boosterEmbed.setAuthor(`${user.id === message.author.id ? 'Your' : `${user.username}'s`} Boosters`, user.displayAvatarURL({ dynamic: true }));

    const allBoostersWithCaps = {
        xp: 'XP',
    };

    const getTimeInWords = (endTime: number) => {
        const remainingTime = endTime - Date.now();
        const time = remainingTime > 1000 ? prettyMs(remainingTime, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingTime / 1000).toFixed(1)} seconds`;

        return time;
    };

    const totalBoosterList = userBoosters.filter((booster) => booster.endTime > Date.now()).map((booster) => `Remaining Time: **${getTimeInWords(booster.endTime)}**`);

    if (totalBoosterList.length === 0) return message.channel.send(boosterEmbed.setDescription(`${emojis.tickNo} ${user.id === message.author.id ? "You don't" : `${user.username} doesn't`} have any boosters! ${user.id === message.author.id ? `Use \`${prefix}booster shop\` to view all the booster you can buy!` : ''}`));

    for (let i = 0; i < userBoosters.length; i++) {
        boosterEmbed.addField(`${(allBoostersWithCaps as any)[userBoosters[i].name]} Booster`, totalBoosterList[i]);
    }

    message.channel.send(boosterEmbed);
};

export const help = {
    aliases: ['boosters', 'booster'],
    name: 'Boosters',
    description: 'View all the booster you got',
    usage: 'booster [user]',
    example: 'booster\nbooster @Conor#0751',
};

export const config = {
    args: 0,
    category: 'economy',
};
