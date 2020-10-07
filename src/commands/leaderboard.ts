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

    const sendLeaderboard = async (dataname: string, sortname: string, lbname: string, prefix = '', suffix = ''): Promise<Message | void> => {
        const allData = await database.all('economy');
        const sortedData: any = allData.sort((a: any, b: any) => {
            if (lodash.get(a.data, sortname) > lodash.get(b.data, sortname) || (lodash.get(a.data, sortname) && !lodash.get(b.data, sortname))) return -1;
            if (lodash.get(a.data, sortname) < lodash.get(b.data, sortname) || (lodash.get(b.data, sortname) && !lodash.get(a.data, sortname))) return 1;
            return 0;
        });

        let lastEdited = 0;
        const editCooldown = 1000;
        let currentPageUsed = 0;

        const editLeaderboardMessage = async (currentPage: number, messageToDelete?: Message, leaderboardEmbedMessage?: Message): Promise<Message | void> => {
            if (Date.now() - lastEdited >= editCooldown) {
                lastEdited = Date.now();

                if (!leaderboardEmbedMessage) {
                    currentPage = !isNaN(Number(args[1])) && args[1] ? Number(args[1]) : 1;
                }

                let pageNotExist = false;
                const totalPages = Math.ceil(sortedData.filter((economy: any) => lodash.get(economy.data, dataname)).length / 10);
                if (currentPage > totalPages || isNaN(currentPage)) currentPage = 1;
                if (currentPage < 1) currentPage = totalPages;

                if (sortedData.length < (currentPage - 1) * 10) {
                    leaderboardEmbed.setDescription(`${emojis.tickNo} That page doesn't exist!`);

                    if (!leaderboardEmbedMessage) return message.channel.send(leaderboardEmbed);
                    else {
                        pageNotExist = true;
                        leaderboardEmbedMessage?.edit(leaderboardEmbed);
                    }
                }

                if (!pageNotExist) {
                    const length = currentPage * (sortedData.length > 10 ? 10 : sortedData.length);
                    const leaderboardData = [];

                    for (let i = (currentPage - 1) * 10; i < length; i++) {
                        if (!lodash.get(sortedData[i]?.data, dataname)) break;

                        let user = client.users.cache.get(sortedData[i].userid);
                        if (!user) user = await client.users.fetch(sortedData[i].userid);

                        const userData = lodash.get(sortedData[i].data, dataname);

                        leaderboardData.push(`**${i + 1}**. ${user?.tag || 'unknown#0000'} - \`${prefix}${Number(userData).toLocaleString()}${suffix}\`\n`);
                    }

                    let position = sortedData.findIndex((lbData: any) => lbData.userid === message.author.id) + 1;
                    if (!lodash.get(sortedData.find((lbData: any) => lbData.userid === message.author.id)?.data, dataname)) position = sortedData.filter((lbData: any) => lodash.get(lbData.data, dataname)).length + 1;
                    if (leaderboardData.length < 1) return message.channel.send(leaderboardEmbed.setDescription(`${emojis.tickNo} There's no data for that leaderboard!`));

                    leaderboardEmbed.setDescription(leaderboardData.join(''));
                    leaderboardEmbed.setFooter(`${message.author.username}'s Position: #${position}`, message.author.displayAvatarURL({ dynamic: true }));
                    leaderboardEmbed.setAuthor(`${lbname} Leaderboard (Page ${currentPage}/${totalPages})`, client.user?.displayAvatarURL({ dynamic: true }));

                    if (currentPageUsed !== currentPage) {
                        currentPageUsed = currentPage;
                        if (leaderboardEmbedMessage) {
                            await leaderboardEmbedMessage.edit(leaderboardEmbed);
                            if (messageToDelete?.deletable) await messageToDelete?.delete();
                        } else {
                            leaderboardEmbedMessage = await message.channel.send(leaderboardEmbed);
                        }
                    }
                }
            }

            const forwardPageValidResponses = ['next', 'forward'];
            const backPageValidResponses = ['previous', 'prev', 'back'];

            message.channel
                .awaitMessages(
                    (msg: Message) =>
                        !msg.author.bot && msg.author.id === message.author.id && (forwardPageValidResponses.includes(msg.content?.toLowerCase()) || backPageValidResponses.includes(msg.content?.toLowerCase()) || msg.content?.toLowerCase().startsWith('go to') || help.aliases.filter((alias) => msg.content?.toLowerCase().slice(prefix.length).startsWith(alias)).length > 0),
                    { max: 1, time: 30000, errors: ['time'] }
                )
                .then(async (collected) => {
                    const response = collected.first()?.content.toLowerCase();
                    if (forwardPageValidResponses.includes(response as string)) {
                        return editLeaderboardMessage(currentPage + 1, collected.first(), leaderboardEmbedMessage);
                    } else if (backPageValidResponses.includes(response as string)) {
                        return editLeaderboardMessage(currentPage - 1, collected.first(), leaderboardEmbedMessage);
                    } else if (response?.startsWith('go to')) {
                        return editLeaderboardMessage(Number(response.slice(6)), collected.first(), leaderboardEmbedMessage);
                    } else if (help.aliases.filter((alias) => response!.slice(prefix.length).startsWith(alias)).length > 0) return;
                })
                .catch((_) => _);
        };

        editLeaderboardMessage(1);
    };

    switch (args[0]) {
        case 'bank':
            sendLeaderboard('balance', 'balance', 'Bank', '$');
            break;
        case 'rank':
        case 'level':
        case 'levels':
            sendLeaderboard('level.level', 'level.totalXp', 'Level', '', ' level');
            break;
        case 'networth':
            sendLeaderboard('networth', 'networth', 'Networth', '$');
            break;
        case 'rep':
        case 'reps':
            sendLeaderboard('rep', 'rep', 'Rep', '', ' reps');
            break;
        case 'streak':
            sendLeaderboard('streak', 'streak', 'Streak', '', ' days streak');
            break;
        case 'winning':
        case 'winnings':
            sendLeaderboard('winnings', 'winnings', 'Winnings', '$');
            break;
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
