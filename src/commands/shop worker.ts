import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const workerEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Workers',
        },
        color: message.guild?.me?.displayHexColor,
        desc: 'Buy workers from the shop using money',
        fields: [
            { name: '🌸 Flower Worker', value: '$165', inline: true },
            { name: '🌮 Taco Worker', value: '$1,160', inline: true },
            { name: '🍔 Burger Worker', value: '$3,000', inline: true },
            { name: '🍕 Pizza Worker', value: '$5,800', inline: true },
            { name: '💈 Barber Worker', value: '$8,300', inline: true },
            { name: '👓 Optician Worker', value: '$16,500', inline: true },
            { name: '🧪 Chemist Worker', value: '$25,000', inline: true },
            { name: '🔪 Butcher Worker', value: '$30,000', inline: true },
            { name: '🧁 Baker Worker', value: '$50,000', inline: true },
            { name: '👟 Shoe Worker', value: '$100,000', inline: true },
            { name: '👕 Clothes Worker', value: '$165,000', inline: true },
            { name: '📘 Book Worker', value: '$300,000', inline: true },
            { name: '🥕 Grocery Worker', value: '$830,000', inline: true },
            { name: '✂️ DIY Worker', value: '$1,650,000', inline: true },
            { name: '🧸 Toy Worker', value: '$3,000,000', inline: true },
            { name: '🎸 Music Worker', value: '$8,300,000', inline: true },
            { name: '💍 Jewelry Worker', value: '$16,500,000', inline: true },
            { name: '✈️ Plane Worker', value: '$30,000,000', inline: true },
        ],
        footer: 'Use >shop buy to buy workers',
    });

    message.channel.send(workerEmbed);
};

export const help = {
    aliases: ['shop worker', 'shop workers'],
    name: 'Shop Workers',
    description: 'View the list of workers you can buy from shop',
    usage: 'shop workers',
    example: 'shop workers',
};

export const config = {
    args: 0,
    category: 'economy',
};
