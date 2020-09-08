import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const boosterShopEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL({ dynamic: true }),
            name: 'Boosters',
        },
        color: message.guild?.me?.displayHexColor,
        desc: 'Boosters are a good way to boost things',
        fields: [{ name: 'XP Booster', value: 'Cost: $1,000\nDescription: Boost your xp by 1.5 times for 1 hour using XP Booster', inline: true }],
        footer: 'Use >booster buy to buy booster',
    });

    message.channel.send(boosterShopEmbed);
};

export const help = {
    aliases: ['booster shop', 'boosters shop', 'shop booster', 'shop boosters'],
    name: 'Booster Shop',
    description: 'View the booster shop where you can buy boosters',
    usage: 'booster shop',
    example: 'booster shop',
};

export const config = {
    args: 0,
    category: 'economy',
};
