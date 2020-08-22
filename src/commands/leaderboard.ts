import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const leaderboardEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Leaderboard',
        },
        color: message.guild?.me?.displayHexColor,
    });

    const sendLeaderboard = async (dataname: string, lbname: string, prefix = '', suffix = ''): Promise<Message> => {
        const allData = await database.all('economy');
        const sortedData: any = allData.sort((a: any, b: any) => {
            if (a.data[dataname] > b.data[dataname] || (a.data[dataname] && !b.data[dataname])) return -1;
            if (a.data[dataname] < b.data[dataname] || (b.data[dataname] && !a.data[dataname])) return 1;
            return 0;
        });
        const leaderboardData = [];

        const page = !isNaN(Number(args[1])) ? Number(args[1]) : 1;
        if (sortedData.length < (page - 1) * 10) return message.channel.send(leaderboardEmbed.setDescription(`${emojis.tickNo} That page doesn't exist!`));

        const length = page * (sortedData.length > 10 ? 10 : sortedData.length);

        for (let i = (page - 1) * 10; i < length; i++) {
            if (!sortedData[i]?.data[dataname]) break;

            const user = await utils.getUser(sortedData[i].userid, client);
            const userData = sortedData[i].data[dataname];

            leaderboardData.push(`${i + 1}. ${user?.tag || 'unknown#0000'} - **${prefix}${Number(userData).toLocaleString()} ${suffix}**\n`);
        }

        let position = sortedData.findIndex((lbData: any) => lbData.userid === message.author.id) + 1;
        if (position <= 0) position = sortedData.length + 1;
        if (leaderboardData.length < 1) return message.channel.send(leaderboardEmbed.setDescription(`${emojis.tickNo} There's no data for that leaderboard!`));

        leaderboardEmbed.setAuthor(`${lbname} Leaderboard`, client.user?.displayAvatarURL());
        leaderboardEmbed.setDescription(leaderboardData.join(''));
        leaderboardEmbed.setFooter(`${message.author.username}'s Position: #${position}`, message.author.displayAvatarURL());

        return message.channel.send(leaderboardEmbed);
    };

    if (args[0] === 'bank') {
        sendLeaderboard('balance', 'Bank', '$');
    } else if (args[0] === 'networth') {
        sendLeaderboard('networth', 'Networth', '$');
    } else if (args[0] === 'streak') {
        sendLeaderboard('streak', 'Streak', '', 'days streak');
    } else if (args[0] === 'winnings' || args[0] === 'winning') {
        sendLeaderboard('winnings', 'Winnings', '$');
    }
};

export const help = {
    aliases: ['leaderboard', 'lb'],
    name: 'Leaderboard',
    description: 'View the leaderboard',
    usage: 'leaderboard <leaderboard name>',
    example: 'leaderboard bank\nleaderboard networth\nleaderboard streak\nleaderboard winnings',
};

export const config = {
    args: 1,
    module: 'economy',
};
