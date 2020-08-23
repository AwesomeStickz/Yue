import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client, message.guild!)) || message.author;
    const levelEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (user.bot) return message.channel.send(levelEmbed.setDescription(`${emojis.tickNo} Bots don't have levels!`));

    const userLevelData = (await database.getProp('economy', user.id, 'level')) || {};

    const userLevel = userLevelData.level || 0;
    const userXP = userLevelData.xp || 0;
    const userTotalXP = userLevelData.totalXp || 0;
    const nextLevelXP = userLevel == 0 ? 100 : Math.round(Math.pow(1.33, userLevel + 1) * 100);

    levelEmbed.setAuthor(user.username, user.displayAvatarURL());
    levelEmbed.setFooter(`${(nextLevelXP - userXP).toLocaleString()} more xp needed for next level up`);
    levelEmbed.addFields([
        { name: 'Level', value: userLevel.toLocaleString(), inline: true },
        { name: 'XP', value: `${userXP.toLocaleString()}/${userTotalXP.toLocaleString()}`, inline: true },
        { name: 'Total XP', value: userTotalXP.toLocaleString(), inline: true },
    ]);

    message.channel.send(levelEmbed);
};

export const help = {
    aliases: ['level', 'lvl', 'rank'],
    name: 'Level',
    description: 'Show your level',
    usage: 'level [user]',
    example: 'level\nlevel @Conor#0751',
};

export const config = {
    args: 0,
};
