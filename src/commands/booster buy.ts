import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, _client: Client, args: string[]): Promise<Message | void> => {
    const boosterBuyEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const userEconomyData = (await database.get('economy', message.author.id)) || {};
    const userBalance = userEconomyData.balance || 0;
    const userBoosters: { name: string; endTime: number }[] = userEconomyData.boosters || [];

    const boosterName = args.join(' ').toLowerCase();

    const allBoosters = {
        xp: 1000,
    };
    const allBoosterWithCaps = {
        xp: 'XP',
    };

    let validItem = false;

    for (const [booster, boosterPrice] of Object.entries(allBoosters)) {
        if (boosterName.startsWith(booster)) {
            if (userBalance < boosterPrice) return message.channel.send(boosterBuyEmbed.setDescription(`${emojis.tickNo} You don't have enough balance to buy **${(allBoosterWithCaps as any)[booster]} Booster**!`));
            if (userBoosters.find((boosterInfo) => boosterInfo.name === booster) && userBoosters.filter((boosterInfo) => boosterInfo.endTime > Date.now()).length > 0) return message.channel.send(boosterBuyEmbed.setDescription(`${emojis.tickNo} You already have  **${(allBoosterWithCaps as any)[booster]} Booster**!`));

            userBoosters.push({ name: booster, endTime: Date.now() + 3600000 });

            await database.subtractProp('economy', message.author.id, boosterPrice, 'balance');
            await database.setProp('economy', message.author.id, userBoosters, 'boosters');

            validItem = true;
            message.channel.send(boosterBuyEmbed.setDescription(`${emojis.tickYes} You've successfully bought **${(allBoosterWithCaps as any)[booster]} Booster**!`));
            break;
        }
    }

    if (!validItem) return message.channel.send(boosterBuyEmbed.setDescription(`${emojis.tickNo} That's not a valid booster!`));
};

export const help = {
    aliases: ['booster buy', 'boosters buy'],
    name: 'Booster Buy',
    description: 'Buy a booster from booster shop',
    usage: 'booster buy <booster name>',
    example: 'booster buy xp',
};

export const config = {
    args: 1,
    category: 'economy',
};
