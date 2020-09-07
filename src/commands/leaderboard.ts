import { Client, Message } from 'discord.js';
import lodash from 'lodash';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    args = args.join(' ').toLowerCase().split(' ');
    const leaderboardEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL({ dynamic: true }),
            name: 'Leaderboard',
        },
        color: message.guild?.me?.displayHexColor,
    });

    const sendLeaderboard = async (dataname: string, sortname: string, lbname: string, prefix = '', suffix = ''): Promise<Message> => {
        const allData = await database.all('economy');
        const sortedData: any = allData.sort((a: any, b: any) => {
            if (lodash.get(a.data, sortname) > lodash.get(b.data, sortname) || (lodash.get(a.data, sortname) && !lodash.get(b.data, sortname))) return -1;
            if (lodash.get(a.data, sortname) < lodash.get(b.data, sortname) || (lodash.get(b.data, sortname) && !lodash.get(a.data, sortname))) return 1;
            return 0;
        });
        const leaderboardData = [];

        const page = !isNaN(Number(args[1])) ? Number(args[1]) : 1;
        if (sortedData.length < (page - 1) * 10) return message.channel.send(leaderboardEmbed.setDescription(`${emojis.tickNo} That page doesn't exist!`));

        const length = page * (sortedData.length > 10 ? 10 : sortedData.length);

        for (let i = (page - 1) * 10; i < length; i++) {
            if (!lodash.get(sortedData[i]?.data, dataname)) break;

            let user = client.users.cache.get(sortedData[i].userid);
            if (!user) user = await client.users.fetch(sortedData[i].userid);

            const userData = lodash.get(sortedData[i].data, dataname);

            leaderboardData.push(`**${i + 1}**. ${user?.tag || 'unknown#0000'} - \`${prefix}${Number(userData).toLocaleString()}${suffix}\`\n`);
        }

        let position = sortedData.findIndex((lbData: any) => lbData.userid === message.author.id) + 1;
        if (!lodash.get(sortedData.find((lbData: any) => lbData.userid === message.author.id)?.data, dataname)) position = sortedData.filter((lbData: any) => lodash.get(lbData.data, dataname)).length + 1;
        if (leaderboardData.length < 1) return message.channel.send(leaderboardEmbed.setDescription(`${emojis.tickNo} There's no data for that leaderboard!`));

        leaderboardEmbed.setAuthor(`${lbname} Leaderboard`, client.user?.displayAvatarURL({ dynamic: true }));
        leaderboardEmbed.setDescription(leaderboardData.join(''));
        leaderboardEmbed.setFooter(`${message.author.username}'s Position: #${position}`, message.author.displayAvatarURL({ dynamic: true }));

        return message.channel.send(leaderboardEmbed);
    };

    if (args[0] === 'bank') {
        sendLeaderboard('balance', 'balance', 'Bank', '$');
    } else if (args[0] === 'level' || args[0] === 'levels' || args[0] === 'rank') {
        sendLeaderboard('level.level', 'level.totalXp', 'Level', '', ' level');
    } else if (args[0] === 'networth') {
        sendLeaderboard('networth', 'networth', 'Networth', '$');
    } else if (args[0] === 'rep' || args[0] === 'reps') {
        sendLeaderboard('rep', 'rep', 'Rep', '', ' reps');
    } else if (args[0] === 'streak') {
        sendLeaderboard('streak', 'streak', 'Streak', '', ' days streak');
    } else if (args[0] === 'winnings' || args[0] === 'winning') {
        sendLeaderboard('winnings', 'winnings', 'Winnings', '$');
    }
};

export const help = {
    aliases: ['leaderboard', 'lb'],
    name: 'Leaderboard',
    description: 'View the leaderboard',
    usage: 'leaderboard <leaderboard name>',
    example: 'leaderboard bank\nleaderboard level\nleaderboard networth\nleaderboard rep\nleaderboard streak\nleaderboard winnings',
};

export const config = {
    args: 1,
    category: 'economy',
};
