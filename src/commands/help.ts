import { Client, Message } from 'discord.js';
import { aliases, commands } from '../utils/commandsAndAliases';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[], prefix: string): Promise<Message | void> => {
    args = args.join(' ').toLowerCase().split(' ');

    const categories = ['bot', 'economy', 'image', 'moderation'];
    const helpEmbed = embed({
        author: {
            image: client.user?.displayAvatarURL({ dynamic: true }),
            name: 'Yue Bot: Help',
        },
        color: message.guild?.me?.displayHexColor,
        footer: 'Yue',
        timestamp: true,
        thumbnail: client.user!.displayAvatarURL({ dynamic: true }),
    });

    if (!args[0] || !isNaN(Number(args[0]))) {
        const allCommands = commands.filter((commandInfo: any) => commandInfo.config.owner !== true).map((commandInfo: any) => `\`${commandInfo.help.name.toLowerCase()}\` - ${commandInfo.help.description}`);

        let lastEdited = 0;
        const editCooldown = 1000;
        let currentPageUsed = 0;

        const editHelpEmbedMessage = async (currentPage: number, messageToDelete?: Message, helpEmbedMessage?: Message): Promise<void> => {
            if (Date.now() - lastEdited >= editCooldown) {
                lastEdited = Date.now();
                if (!helpEmbedMessage) {
                    currentPage = !isNaN(Number(args[0])) && args[0] ? Number(args[0]) : 1;
                }

                let totalPages = 1;
                let title = 'Yue Bot: Help';
                let helpMenuText: string;

                if (allCommands.length > 15) {
                    totalPages = Math.ceil(allCommands.length / 15);
                    if (currentPage > totalPages || isNaN(currentPage)) currentPage = 1;
                    if (currentPage < 1) currentPage = totalPages;

                    title += ` (Page ${currentPage}/${totalPages})`;
                    helpMenuText = allCommands.slice((currentPage - 1) * 15, currentPage * 15).join('\n');
                } else {
                    helpMenuText = allCommands.join('\n');
                }

                if (currentPageUsed !== currentPage) {
                    currentPageUsed = currentPage;

                    helpEmbed.setAuthor(title, client.user!.displayAvatarURL({ dynamic: true }));
                    helpEmbed.setDescription(helpMenuText);

                    if (helpEmbedMessage) {
                        await helpEmbedMessage.edit(helpEmbed);
                        try {
                            await messageToDelete?.delete();
                        } catch (_) {}
                    } else {
                        helpEmbedMessage = await message.channel.send(helpEmbed);
                    }
                }
            }
            const forwardPageValidResponses = ['next', 'forward'];
            const backPageValidResponses = ['previous', 'prev', 'back'];

            message.channel
                .awaitMessages(
                    (msg: Message) =>
                        !msg.author.bot && msg.author.id === message.author.id && (forwardPageValidResponses.includes(msg.content?.toLowerCase()) || backPageValidResponses.includes(msg.content?.toLowerCase()) || msg.content?.toLowerCase().startsWith('go to') || help.aliases.filter((alias) => msg.content?.toLowerCase().slice(prefix.length).startsWith(alias)).length > 0),
                    { max: 1, time: 15000, errors: ['time'] }
                )
                .then(async (collected) => {
                    const response = collected.first()?.content.toLowerCase();
                    if (forwardPageValidResponses.includes(response as string)) {
                        return editHelpEmbedMessage(currentPage + 1, collected.first(), helpEmbedMessage);
                    } else if (backPageValidResponses.includes(response as string)) {
                        return editHelpEmbedMessage(currentPage - 1, collected.first(), helpEmbedMessage);
                    } else if (response?.startsWith('go to')) {
                        return editHelpEmbedMessage(Number(response.slice(6)), collected.first(), helpEmbedMessage);
                    } else if (help.aliases.filter((alias) => response!.slice(prefix.length).startsWith(alias)).length > 0) return;
                })
                .catch((_) => _);
        };

        editHelpEmbedMessage(1);
    } else {
        const commandName = args.join(' ').toUpperCase();
        const isACategory = categories.includes(args[0].toLowerCase());
        const isACommand = aliases.has(commandName);

        if (isACategory) {
            const categoryName = args[0].toLowerCase();
            const allCommands = commands.filter((commandInfo: any) => commandInfo.config.owner !== true && (typeof commandInfo.config.category === 'string' ? commandInfo.config.category === categoryName : commandInfo.config.category.includes(categoryName))).map((commandInfo: any) => `\`${commandInfo.help.name.toLowerCase()}\` - ${commandInfo.help.description}`);

            let lastEdited = 0;
            const editCooldown = 1000;
            let currentPageUsed = 0;

            const editHelpEmbedMessage = async (currentPage: number, messageToDelete?: Message, helpEmbedMessage?: Message): Promise<void> => {
                if (Date.now() - lastEdited >= editCooldown) {
                    lastEdited = Date.now();
                    if (!helpEmbedMessage) {
                        currentPage = !isNaN(Number(args[1])) && args[1] ? Number(args[1]) : 1;
                    }

                    let totalPages = 1;
                    let title = `${utils.capitalize(categoryName)} Commands`;
                    let helpMenuText: string;

                    if (allCommands.length > 15) {
                        totalPages = Math.ceil(allCommands.length / 15);
                        if (currentPage > totalPages || isNaN(currentPage)) currentPage = 1;
                        if (currentPage < 1) currentPage = totalPages;

                        title += ` (Page ${currentPage}/${totalPages})`;
                        helpMenuText = allCommands.slice((currentPage - 1) * 15, currentPage * 15).join('\n');
                    } else {
                        helpMenuText = allCommands.join('\n');
                    }

                    if (currentPageUsed !== currentPage) {
                        currentPageUsed = currentPage;

                        helpEmbed.setAuthor(title, client.user!.displayAvatarURL({ dynamic: true }));
                        helpEmbed.setDescription(helpMenuText);

                        if (helpEmbedMessage) {
                            await helpEmbedMessage.edit(helpEmbed);
                            try {
                                await messageToDelete?.delete();
                            } catch (_) {}
                        } else {
                            helpEmbedMessage = await message.channel.send(helpEmbed);
                        }
                    }
                }

                const forwardPageValidResponses = ['next', 'forward'];
                const backPageValidResponses = ['previous', 'prev', 'back'];

                message.channel
                    .awaitMessages(
                        (msg: Message) =>
                            !msg.author.bot &&
                            msg.author.id === message.author.id &&
                            (forwardPageValidResponses.includes(msg.content?.toLowerCase()) || backPageValidResponses.includes(msg.content?.toLowerCase()) || msg.content?.toLowerCase().startsWith('go to') || help.aliases.filter((alias) => msg.content?.toLowerCase().slice(prefix.length).startsWith(alias)).length > 0),
                        { max: 1, time: 15000, errors: ['time'] }
                    )
                    .then(async (collected) => {
                        const response = collected.first()?.content.toLowerCase();
                        if (forwardPageValidResponses.includes(response as string)) {
                            return editHelpEmbedMessage(currentPage + 1, collected.first(), helpEmbedMessage);
                        } else if (backPageValidResponses.includes(response as string)) {
                            return editHelpEmbedMessage(currentPage - 1, collected.first(), helpEmbedMessage);
                        } else if (response?.startsWith('go to')) {
                            return editHelpEmbedMessage(Number(response.slice(6)), collected.first(), helpEmbedMessage);
                        } else if (help.aliases.filter((alias) => response!.slice(prefix.length).startsWith(alias)).length > 0) return;
                    })
                    .catch((_) => _);
            };

            editHelpEmbedMessage(1);
        } else if (isACommand) {
            const commandHelpEmbed = await utils.help(commandName, client, message);
            if (!commandHelpEmbed) return message.channel.send(helpEmbed.setDescription(`${emojis.tickNo} That command doesn't exist!`));

            message.channel.send(commandHelpEmbed);
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
