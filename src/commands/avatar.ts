import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]) => {
    const user = (await utils.getUser(args.join(' '), client)) || message.author;

    const avatarEmbed = embed({
        author: {
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
    aliases: ['avatar'],
    name: 'AVATAR',
    description: 'Displays the avatar of someone',
    usage: 'avatar @user',
    example: 'avatar @*',
};

export const config = {
    args: 0,
    owner: false,
    module: 'image',
};