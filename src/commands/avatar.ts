import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]) => {
    const user = (await utils.getUser(args.join(' '), client, message.guild!)) || message.author;

    const avatarEmbed = embed({
        author: {
            image: user.displayAvatarURL({ dynamic: true }),
            name: `${user.username}'s Avatar`,
        },
        color: message.guild?.me?.displayHexColor,
        image: user.displayAvatarURL({ dynamic: true, size: 2048 }),
        footer: 'Yue',
        timestamp: true,
    });

    message.channel.send(avatarEmbed);
};

export const help = {
    aliases: ['avatar', 'av'],
    name: 'Avatar',
    description: 'View the avatar of a user',
    usage: 'avatar @user',
    example: 'avatar @Conor#0751',
};

export const config = {
    args: 0,
    category: 'image',
};
