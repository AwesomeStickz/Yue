import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const shopEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Shop',
        },
        color: message.guild?.me?.displayHexColor,
        fields: [
            { name: 'Shop Houses', value: '**Description:** It contains a list of houses you can buy from shop\n**Usage**: `shop houses`', inline: true },
            { name: 'Shop Navigators', value: '**Description:** It contains a list of navigators you can buy from shop\n**Usage**: `shop navigators`', inline: true },
            { name: 'Shop Shops', value: '**Description:** It contains a list of shops you can buy from shop\n**Usage**: `shop shops`', inline: true },
            { name: 'Shop Workers', value: '**Description:** It contains a list of workers you can buy from shop\n**Usage**: `shop workers`', inline: true },
        ],
        footer: 'Yue',
        timestamp: true,
    });

    message.channel.send(shopEmbed);
};

export const help = {
    aliases: ['shop'],
    name: 'Shop',
    description: 'View the list of all shops',
    usage: 'shop',
    example: 'shop',
};

export const config = {
    args: 0,
    category: 'economy',
};
