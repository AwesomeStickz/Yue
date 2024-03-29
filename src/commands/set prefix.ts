import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const setPrefixEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Set Prefix',
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (!message.member!.hasPermission('ADMINISTRATOR')) return message.channel.send(setPrefixEmbed.setDescription(`${emojis.tickNo} You need **ADMINISTRATOR** permission to use this command!`));
    if (args[0].length > 64) return message.channel.send(setPrefixEmbed.setDescription(`${emojis.tickNo} Prefix can't have more than 64 characters!`));

    await database.setProp('guildsettings', message.guild!.id, args[0], 'prefix');
    message.channel.send(setPrefixEmbed.setDescription(`${emojis.tickYes} Changed my prefix in this server to: \`${args[0]}\``));
};

export const help = {
    aliases: ['set prefix', 'prefix set'],
    name: 'Set Prefix',
    description: 'Change the prefix of the bot in the server',
    usage: 'setprefix <prefix>',
    example: 'setprefix !',
};

export const config = {
    args: 1,
    category: 'bot',
};
