import { Client, Message } from 'discord.js';
import { aliases, commands } from '../utils/commandsAndAliases';
import { database } from '../utils/databaseFunctions';

export const run = async (client: Client, message: Message): Promise<Message | void> => {
    if (message.author.bot) return;
    if (message.channel.type !== 'text' || !message.member || !message.guild) return;

    const prefix = (await database.getProp('guildsettings', message.guild!.id, 'prefix')) || '>';

    if (message.content.indexOf(prefix) !== 0) return;

    try {
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        let command = args.shift()?.toUpperCase() || '';

        if (aliases.has(`${command} ${args[0]?.toUpperCase()}`)) command = aliases.get(`${command} ${args.shift()?.toUpperCase()}`) as string;
        else if (aliases.has(command)) command = aliases.get(command) as string;
        else return;

        const owners = await database.getProp('yue', client.user!.id, 'owners');
        const commandObj = commands.get(command) as any;

        if (commandObj.config.owner === true && !owners.includes(message.author.id)) return;
        if (commandObj.config.args > args.length) return message.channel.send(`Invalid arguments. Correct usage: \`${prefix}${(commands.get(command) as any).help.usage}\``);
        if (!commandObj.config.subCommand === true) command = command.replace(/ /g, '');

        const commandName = commandObj.help.fileName ? commandObj.help.fileName : command.toLowerCase();
        const commandFile = require(`../commands/${commandName}`);

        commandFile.run(message, client, args);
    } catch (error) {
        console.error(error);
    }
};
