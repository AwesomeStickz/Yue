import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const houseEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Houses',
        },
        color: message.guild?.me?.displayHexColor,
        desc: 'Houses are a good way to increase income, the pricier the house the more they will leave behind for rent.',
        fields: [
            { name: '<:MudHouse:746026271749701722> Mud House', value: '$22,500', inline: true },
            { name: '<:Caravan:746031340830589020> Caravan', value: '$50,000', inline: true },
            { name: '🎪 Tent', value: '$75,000', inline: true },
            { name: '<:Shack:746027605010022531> Shack', value: '$280,000', inline: true },
            { name: '<:Apartment:744302863391391834> Apartment', value: '$500,000', inline: true },
            { name: '🏠 Bungalow', value: '$5,000,000', inline: true },
            { name: '<:Bungalow:744304109888208986> House', value: '$10,000,000', inline: true },
            { name: '<:Penthouse:744302835662979072> Penthouse', value: '$15,000,000', inline: true },
            { name: '<:Mansion:744302803098533898> Mansion', value: '$30,000,000', inline: true },
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
};
