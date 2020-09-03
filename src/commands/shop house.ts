import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const houseEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL({ dynamic: true }),
            name: 'Houses',
        },
        color: message.guild?.me?.displayHexColor,
        desc: 'Houses are a good way to increase income, the pricier the house the more they will leave behind for rent.',
        fields: [
            { name: `${emojis.houses.mud} Mud House`, value: '$22,500', inline: true },
            { name: `${emojis.houses.tent} Tent`, value: '$50,000', inline: true },
            { name: `${emojis.houses.caravan} Caravan`, value: '$75,000', inline: true },
            { name: `${emojis.houses.shack} Shack`, value: '$280,000', inline: true },
            { name: `${emojis.houses.apartment} Apartment`, value: '$500,000', inline: true },
            { name: `${emojis.houses.bungalow} Bungalow`, value: '$5,000,000', inline: true },
            { name: `${emojis.houses.house} House`, value: '$10,000,000', inline: true },
            { name: `${emojis.houses.penthouse} Penthouse`, value: '$15,000,000', inline: true },
            { name: `${emojis.houses.mansion} Mansion`, value: '$30,000,000', inline: true },
        ],
        footer: 'Use >shop buy to buy houses',
    });

    message.channel.send(houseEmbed);
};

export const help = {
    aliases: ['shop house', 'shop houses'],
    name: 'Shop Houses',
    description: 'View the list of houses you can buy from shop',
    usage: 'shop houses',
    example: 'shop houses',
};

export const config = {
    args: 0,
    category: 'economy',
};
