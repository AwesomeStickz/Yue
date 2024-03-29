import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';

export const run = async (message: Message, client: Client) => {
    const inviteEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL({ dynamic: true }),
            name: 'Invite!',
        },
        color: message.guild?.me?.displayHexColor,
        desc: '[Invite](https://discord.com/oauth2/authorize?client_id=744612340510752828&scope=bot&permissions=8&response_type=code&redirect_uri=https%3A%2F%2Fdiscord.gg%2F4n22udd)',
    });

    message.channel.send(inviteEmbed);
};

export const help = {
    aliases: ['invite'],
    name: 'Invite',
    description: 'View invite link of the bot',
    usage: 'invite',
    example: 'invite',
};

export const config = {
    args: 0,
    category: 'bot',
};
