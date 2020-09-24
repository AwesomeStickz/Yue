import { Client, Message, TextChannel } from 'discord.js';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const botCleanEmbed = embed({
        author: {
            image: client.user?.displayAvatarURL(),
            name: 'Bot Clean',
        },
        color: message.guild?.me?.displayHexColor,
    });

    const limit = isNaN(Number(args[0])) ? 100 : Number(args[0]);
    const fetched = (await message.channel.messages.fetch({ limit: 100 }))
        .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
        .filter((m) => m.author.bot)
        .first(limit);

    (message.channel as TextChannel).bulkDelete(fetched).then((deleted) => message.channel.send(botCleanEmbed.setDescription(`${emojis.tickYes} Cleaned **${deleted.size}** bot messages!`)).then((deletedResponseMessage) => deletedResponseMessage.delete({ timeout: 1500 })));
};

export const help = {
    aliases: ['ban'],
    name: 'Ban',
    description: 'Ban a user from your server',
    usage: 'ban <user> [reason]',
    example: 'ban @Conor#0751',
};

export const config = {
    args: 1,
    botPermissions: ['Manage Messages'],
    userPermissions: ['Manage Messages'],
    category: 'moderation',
};
