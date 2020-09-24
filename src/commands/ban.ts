import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const banEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const user = await utils.getUser(args[0], client, message.guild!);
    if (!user) return message.channel.send(banEmbed.setDescription(`${emojis.tickNo} I couldn't find that user`));

    const member = utils.getMember(user.id, message.guild!);
    const reason = `${message.author.tag}: ${args.slice(1).join(' ')}` || `${message.author.tag} used ban command`;

    if (member) {
        const userNotOwner = message.guild!.ownerID !== user.id;
        const authorNotOwner = message.guild!.ownerID !== message.author.id;

        if (authorNotOwner && member.id !== message.author.id && member.roles.highest.rawPosition >= message.member!.roles.highest.rawPosition) return message.channel.send(banEmbed.setDescription(`${emojis.tickNo} Sorry but you’re inferior to the person you’re trying to ban`));
        if (member.roles.highest.rawPosition >= message.guild!.me!.roles.highest.rawPosition || !userNotOwner) return message.channel.send(banEmbed.setDescription(`${emojis.tickNo} Sorry but I'm inferior to the person you’re trying to ban`));
    }

    if (user.id === message.author.id) {
        message.channel.send(banEmbed.setDescription(`${emojis.tickNo} Sorry but you’re too important for me to ban you!`));
    } else {
        try {
            if (member) {
                const banDMEmbed = embed({
                    author: {
                        image: message.author.displayAvatarURL({ dynamic: true }),
                        name: `You have been banned from ${message.guild?.name}`,
                    },
                    color: '#fef4b5',
                    fields: [
                        { name: 'Moderator', value: message.author.tag },
                        { name: 'Reason', value: reason === `${message.author.tag} used ban command` ? 'None Given' : reason },
                    ],
                    timestamp: true,
                });
                await user.send(banDMEmbed);
            }
        } catch (_) {}

        await message.guild!.members.ban(user.id, { reason });

        banEmbed.setAuthor(user.username, user.displayAvatarURL({ dynamic: true }));
        banEmbed.setDescription(`${emojis.tickYes} **${user.tag}** has been banned!`);
        message.channel.send(banEmbed);
    }
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
    botPermissions: ['Ban Members'],
    userPermissions: ['Ban Members'],
    category: 'moderation',
};
