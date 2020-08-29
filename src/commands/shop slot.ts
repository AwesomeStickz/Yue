import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const shopEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Slots',
        },
        color: message.guild?.me?.displayHexColor,
        desc: 'Buy slots for your houses, navigators, shop, workers from the shop using money',
        fields: [
            { name: 'House Slot', value: '$75', inline: true },
            { name: 'Navigator Slot', value: '$150', inline: true },
            { name: 'Shop Slot', value: '$150', inline: true },
            { name: 'Worker Slot', value: '$150', inline: true },
        ],
        footer: 'Use >slots buy to buy slots',
    });

    message.channel.send(shopEmbed);
};

export const help = {
    aliases: ['shop slot', 'shop slots'],
    name: 'Shop Slots',
    description: 'View the list of slots you can buy from shop',
    usage: 'shop slots',
    example: 'shop slots',
};

export const config = {
    args: 0,
    category: 'economy',
};
