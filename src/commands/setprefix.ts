import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, _client: Client, args: string[]): Promise<Message | void> => {
    if (!message.member!.hasPermission('ADMINISTRATOR')) return message.channel.send(`${emojis.tickNo} You need **ADMINISTRATOR** permission to use this command!`);
    if (args[0].length > 64) return message.channel.send(`${emojis.tickNo} Prefix can't have more than 64 characters!`);

    await database.setProp('guildsettings', message.guild!.id, args[0], 'prefix');
    message.channel.send(`${emojis.tickYes} Changed my prefix in this server to: \`${args[0]}\``);
};

export const help = {
    aliases: ['setprefix'],
    name: 'Set Prefix',
    description: 'Change the prefix of the bot in the server',
    usage: '>setprefix <prefix>',
};

export const config = {
    args: 1,
    owner: false,
};
