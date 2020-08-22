import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = await utils.getUser(args.join(' '), client, message.guild!);
    const resetEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (!user) return message.channel.send(resetEmbed.setDescription(`${emojis.tickNo} I couldn't find that user!`));
    if (user.bot) return message.channel.send(resetEmbed.setDescription(`${emojis.tickNo} You can't reset cooldown of bots!`));

    await database.delete('cooldown', user.id);

    resetEmbed.setAuthor(user.username, user.displayAvatarURL());
    message.channel.send(resetEmbed.setDescription(`${emojis.tickYes} **${user.tag}**'s cooldowns has been reset successfully!`));
};

export const help = {
    aliases: ['reset cooldown', 'cooldown reset>'],
    name: 'Reset Cooldown',
    description: 'Reset all cooldowns of someone',
    usage: 'reset cooldown <user>',
    example: 'reset cooldown @Conor#0751',
};

export const config = {
    args: 1,
    owner: true,
};
