import { Client, Message } from 'discord.js';
import { aliases, commands } from '../utils/commandsAndAliases';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    args = args.join(' ').toLowerCase().split(' ');

    const categories = ['bot', 'economy', 'image', 'moderation'];
    const helpEmbed = embed({
        author: {
            image: client.user?.displayAvatarURL(),
            name: 'Yue Bot: Help',
        },
        color: message.guild?.me?.displayHexColor,
        footer: 'Yue',
        timestamp: true,
        thumbnail: client.user!.displayAvatarURL(),
    });

    if (!args[0] || !isNaN(Number(args[0]))) {
        const allCommands = commands.filter((commandInfo: any) => commandInfo.config.owner !== true).map((commandInfo: any) => `\`${commandInfo.help.name.toLowerCase()}\` - ${commandInfo.help.description}`);

        let currentPage = Number(args[0]) < 1 ? 1 : Number(args[0]);
        let totalPages = 1;
        let title = 'Yue Bot: Help';
        let helpMenuText: string;

        if (allCommands.length > 15) {
            totalPages = Math.ceil(allCommands.length / 15);
            if (currentPage > totalPages) currentPage = 1;

            title += ` (Page ${currentPage}/${totalPages})`;
            helpMenuText = allCommands.slice((currentPage - 1) * 15, currentPage * 15).join('\n');
        } else {
            helpMenuText = allCommands.join('\n');
        }

        helpEmbed.setAuthor(title, client.user!.displayAvatarURL());
        helpEmbed.setDescription(helpMenuText);

        message.channel.send(helpEmbed);
    } else {
        const commandName = args.join(' ').toUpperCase();
        const isACategory = categories.includes(args[0].toLowerCase());
        const isACommand = aliases.has(commandName);

        if (isACategory) {
            const categoryName = args[0].toLowerCase();
            const allCommands = commands.filter((commandInfo: any) => (commandInfo.config.owner !== true && typeof commandInfo.config.category === 'string' ? commandInfo.config.category === categoryName : commandInfo.config.category.includes(categoryName))).map((commandInfo: any) => `\`${commandInfo.help.name.toLowerCase()}\` - ${commandInfo.help.description}`);

            let currentPage = Number(args[0]) < 1 ? 1 : Number(args[0]);
            let totalPages = 1;
            let title = `${utils.capitalize(categoryName)} Commands`;
            let helpMenuText: string;

            if (allCommands.length > 15) {
                totalPages = Math.ceil(allCommands.length / 15);
                if (currentPage > totalPages) currentPage = 1;

                title += ` (Page ${currentPage}/${totalPages})`;
                helpMenuText = allCommands.slice((currentPage - 1) * 15, currentPage * 15).join('\n');
            } else {
                helpMenuText = allCommands.join('\n');
            }

            helpEmbed.setAuthor(title, client.user!.displayAvatarURL());
            helpEmbed.setDescription(helpMenuText);

            message.channel.send(helpEmbed);
        } else if (isACommand) {
            const commandInfo: any = commands.get(aliases.get(commandName));
            const owners = await database.getProp('yue', client.user!.id!, 'owners');
            const isAOwner = owners.includes(message.author.id);

            if (commandInfo.config.owner === true && !isAOwner) return message.channel.send(helpEmbed.setDescription(`${emojis.tickNo} That command doesn't exist!`));

            helpEmbed.setAuthor(commandInfo.help.name, client.user?.displayAvatarURL());
            helpEmbed.addFields([
                { name: 'Description', value: commandInfo.help.description },
                { name: 'Usage', value: commandInfo.help.usage },
                { name: 'Example', value: commandInfo.help.example },
            ]);

            if (commandInfo.help.aliases.length > 1) helpEmbed.addField('Aliases', `\`${commandInfo.help.aliases.filter((alias: string) => alias !== commandName.toLowerCase()).join('`, `')}\``);

            message.channel.send(helpEmbed);
        } else return message.channel.send(helpEmbed.setDescription(`${emojis.tickNo} That command doesn't exist!`));
    }
};

export const help = {
    aliases: ['help', 'h', 'commands', 'cmds'],
    name: 'Help',
    description: 'View a list of all commands',
    usage: 'help [category or command name]',
    example: 'help\nhelp economy\nhelp help',
};

export const config = {
    args: 0,
    category: 'bot',
};
