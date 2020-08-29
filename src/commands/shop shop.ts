import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const shopEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Shops',
        },
        color: message.guild?.me?.displayHexColor,
        desc: 'Buy shops from the shop using money',
        fields: [
            { name: '🌸 Flower Shop', value: '$500', inline: true },
            { name: '🌮 Taco Shop', value: '$3,500', inline: true },
            { name: '🍔 Burger Shop', value: '$10,000', inline: true },
            { name: '🍕 Pizza Shop', value: '$17,500', inline: true },
            { name: '💈 Barber Shop', value: '$25,000', inline: true },
            { name: '👓 Optician Shop', value: '$50,000', inline: true },
            { name: '🧪 Chemist Shop', value: '$75,000', inline: true },
            { name: '🔪 Butcher Shop', value: '$100,000', inline: true },
            { name: '🧁 Baker Shop', value: '$150,000', inline: true },
            { name: '👟 Shoe Shop', value: '$300,000', inline: true },
            { name: '👕 Clothes Shop', value: '$500,000', inline: true },
            { name: '📘 Book Shop', value: '$1,000,000', inline: true },
            { name: '🥕 Grocery Shop', value: '$2,500,000', inline: true },
            { name: '✂️ DIY Shop', value: '$5,000,000', inline: true },
            { name: '🧸 Toy Shop', value: '$10,000,000', inline: true },
            { name: '🎸 Music Shop', value: '$25,000,000', inline: true },
            { name: '💍 Jewelry Shop', value: '$50,000,000', inline: true },
            { name: '✈️ Plane Shop', value: '$100,000,000', inline: true },
        ],
        footer: 'Use >shop buy to buy shops',
    });

    message.channel.send(shopEmbed);
};

export const help = {
    aliases: ['shop shop', 'shop shops'],
    name: 'Shop Shops',
    description: 'View the list of shops you can buy from shop',
    usage: 'shop shops',
    example: 'shop shops',
};

export const config = {
    args: 0,
    category: 'economy',
};
