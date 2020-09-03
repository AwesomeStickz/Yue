import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, _client: Client, args: string[]): Promise<Message | void> => {
    const kickEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const member = utils.getMember(args[0], message.guild!);
    if (!member) return message.channel.send(kickEmbed.setDescription(`${emojis.tickNo} I couldn't find that user!`));

    const reason = args.slice(1).join(' ') || `${message.author.tag} used kick command`;

    const memberNotOwner = message.guild!.ownerID !== member.id;
    const authorNotOwner = message.guild!.ownerID !== message.author.id;

    if (authorNotOwner && member.id !== message.author.id && member.roles.highest.rawPosition >= message.member!.roles.highest.rawPosition) return message.channel.send(kickEmbed.setDescription(`${emojis.tickNo} Sorry but you’re inferior to the person you’re trying to kick`));
    if (member.roles.highest.rawPosition >= message.guild!.me!.roles.highest.rawPosition || !memberNotOwner) return message.channel.send(kickEmbed.setDescription(`${emojis.tickNo} Sorry but I'm inferior to the person you’re trying to kick`));

    if (member.id === message.author.id) {
        message.channel.send(kickEmbed.setDescription(`${emojis.tickNo} Sorry but you’re too important for me to kick you!`));
    } else {
        try {
            if (member) {
                const kickDMEmbed = embed({
                    author: {
                        image: message.author.displayAvatarURL({ dynamic: true }),
                        name: `You have been kicked from ${message.guild?.name}`,
                    },
                    color: '#fef4b5',
                    fields: [
                        { name: 'Moderator', value: message.author.tag },
                        { name: 'Reason', value: reason === `${message.author.tag} used kick command` ? 'None Given' : reason },
                    ],
                    timestamp: true,
                });
                await member.send(kickDMEmbed);
            }
        } catch (_) {}

        await member.kick(reason);

        kickEmbed.setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }));
        kickEmbed.setDescription(`${emojis.tickYes} **${member.user.tag}** has been kicked!`);
        message.channel.send(kickEmbed);
    }
};

export const help = {
    aliases: ['kick'],
    name: 'Kick',
    description: 'Kick a user from your server',
    usage: 'kick <user> [reason]',
    example: 'kick @Conor#0751',
};

export const config = {
    args: 1,
    botPermissions: ['Kick Members'],
    userPermissions: ['Kick Members'],
    category: 'moderation',
};
