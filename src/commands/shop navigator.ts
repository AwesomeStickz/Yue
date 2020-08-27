import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const navigatorEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Navigators',
        },
        color: message.guild?.me?.displayHexColor,
        desc: 'Navigators are a good way to find essence',
        fields: [
            { name: `${emojis.navigators.iron} Iron Navigator`, value: '$500', inline: true },
            { name: `${emojis.navigators.bronze} Bronze Navigator`, value: '$1,250', inline: true },
            { name: `${emojis.navigators.silver} Silver Navigator`, value: '$4,500', inline: true },
            { name: `${emojis.navigators.gold} Gold Navigator`, value: '$17,500', inline: true },
            { name: `${emojis.navigators.platinum} Platinum Navigator`, value: '$90,000', inline: true },
            { name: `${emojis.navigators.diamond} Diamond Navigator`, value: '$500,000', inline: true },
        ],
        footer: 'Use >shop buy to buy navigators',
    });

    message.channel.send(navigatorEmbed);
};

export const help = {
    aliases: ['shop navigator', 'shop navigators'],
    name: 'Shop Navigator',
    description: 'View the list of navigators you can buy from shop',
    usage: 'shop navigators',
    example: 'shop navigators',
};

export const config = {
    args: 0,
};
