import { Client, Message } from 'discord.js';
import { db } from '../database';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, client: Client, args: string[], prefix: string): Promise<Message | void> => {
    const commandStatsEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL({ dynamic: true }),
            name: 'Command Stats',
        },
        color: message.guild?.me?.displayHexColor,
    });

    let lastEdited = 0;
    const editCooldown = 1000;
    let currentPageUsed = 0;

    const editCommandStatsMessage = async (currentPage: number, messageToDelete?: Message, commandStatsEmbedMessage?: Message): Promise<Message | void> => {
        if (Date.now() - lastEdited >= editCooldown) {
            lastEdited = Date.now();

            const commandStats = await db.query(`
                    SELECT command_name AS commandname, SUM(command_uses) AS commanduses
                    FROM command_stats
                    GROUP BY (command_name)
                    ORDER BY commandUses DESC;
                `);

            const totalCommandsUsed = await db.query(`
                SELECT SUM(command_uses) as totaluses
                FROM command_stats;
            `);

            if (!commandStatsEmbedMessage) {
                currentPage = !isNaN(Number(args[0])) && args[0] ? Number(args[0]) : 1;
            }

            let pageNotExist = false;
            const totalPages = Math.ceil(commandStats.rowCount / 10);
            if (currentPage > totalPages || isNaN(currentPage)) currentPage = 1;
            if (currentPage < 1) currentPage = totalPages;

            if (commandStats.rowCount < (currentPage - 1) * 10) {
                commandStatsEmbed.setDescription(`${emojis.tickNo} That page doesn't exist!`);

                if (!commandStatsEmbedMessage) return message.channel.send(commandStatsEmbed);
                else {
                    pageNotExist = true;
                    commandStatsEmbedMessage?.edit(commandStatsEmbed);
                }
            }

            if (!pageNotExist) {
                const length = currentPage * (commandStats.rowCount > 10 ? 10 : commandStats.rowCount);
                const leaderboardData = [];

                for (let i = (currentPage - 1) * 10; i < length; i++) {
                    if (!commandStats.rows[i]) break;

                    leaderboardData.push(`**${i + 1}**. ${commandStats.rows[i].commandname} - \`${Number(commandStats.rows[i].commanduses).toLocaleString()}\`\n`);
                }

                commandStatsEmbed.setDescription(leaderboardData.join(''));
                commandStatsEmbed.setFooter(`Total Commands Used: ${totalCommandsUsed.rows[0].totaluses.toLocaleString()}`);
                commandStatsEmbed.setAuthor(`Command Stats (Page ${currentPage}/${totalPages})`, client.user?.displayAvatarURL({ dynamic: true }));

                if (currentPageUsed !== currentPage) {
                    currentPageUsed = currentPage;
                    if (commandStatsEmbedMessage) {
                        await commandStatsEmbedMessage.edit(commandStatsEmbed);
                        try {
                            await messageToDelete?.delete();
                        } catch (_) {}
                    } else {
                        commandStatsEmbedMessage = await message.channel.send(commandStatsEmbed);
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
                { max: 1, time: 15000, errors: ['time'] }
            )
            .then(async (collected) => {
                const response = collected.first()?.content.toLowerCase();
                if (forwardPageValidResponses.includes(response as string)) {
                    return editCommandStatsMessage(currentPage + 1, collected.first(), commandStatsEmbedMessage);
                } else if (backPageValidResponses.includes(response as string)) {
                    return editCommandStatsMessage(currentPage - 1, collected.first(), commandStatsEmbedMessage);
                } else if (response?.startsWith('go to')) {
                    return editCommandStatsMessage(Number(response.slice(6)), collected.first(), commandStatsEmbedMessage);
                } else if (help.aliases.filter((alias) => response!.slice(prefix.length).startsWith(alias)).length > 0) return;
            })
            .catch((_) => _);
    };

    editCommandStatsMessage(1);
};

export const help = {
    aliases: ['command stats'],
    name: 'Command Stats',
    description: 'View how many times each command has been used',
    usage: 'command stats',
    example: 'command stats',
};

export const config = {
    args: 0,
    category: 'bot',
};
