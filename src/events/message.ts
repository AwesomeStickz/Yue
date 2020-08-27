import { Client, Message, PermissionResolvable } from 'discord.js';
import { aliases, commands } from '../utils/commandsAndAliases';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (client: Client, message: Message): Promise<Message | void> => {
    if (message.author.bot) return;
    if (message.channel.type !== 'text' || !message.member || !message.guild) return;
    if (!message.channel.permissionsFor(message.guild!.me!)?.has('SEND_MESSAGES')) return;

    const prefix = (await database.getProp('guildsettings', message.guild!.id, 'prefix')) || '>';

    if (message.content.indexOf(prefix) !== 0) return;

    const blacklistedReason = await database.get('blacklist', message.author.id);
    if (blacklistedReason && message.content !== `${prefix}support`) return message.channel.send(`${emojis.tickNo} You are blacklisted from using the bot! Reason: ${blacklistedReason}. You can join support server using \`${prefix}support\` if you want to appeal!`);

    try {
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        let command = args.shift()?.toUpperCase() || '';

        if (aliases.has(`${command} ${args[0]?.toUpperCase()} ${args[1]?.toUpperCase()}`)) command = aliases.get(`${command} ${args.shift()?.toUpperCase()} ${args.shift()?.toUpperCase()}`) as string;
        else if (aliases.has(`${command} ${args[0]?.toUpperCase()}`)) command = aliases.get(`${command} ${args.shift()?.toUpperCase()}`) as string;
        else if (aliases.has(command)) command = aliases.get(command) as string;
        else return;

        const owners = await database.getProp('yue', client.user!.id, 'owners');
        const commandObj = commands.get(command) as any;

        if (commandObj.config.owner === true && !owners.includes(message.author.id)) return;
        if (commandObj.config.args > args.length) return message.channel.send(`Invalid arguments. Correct usage: \`${prefix}${(commands.get(command) as any).help.usage}\``);
        if (commandObj.config.botPermissions || commandObj.config.userPermissions) {
            const noPermissionEmbed = embed({
                color: message.guild.me?.displayHexColor,
            });

            if (commandObj.config.userPermissions) {
                const userPermissions: string[] = commandObj.config.userPermissions;
                const userPermissionsInPermissionResolvable: PermissionResolvable[] = [];

                userPermissions.forEach((permission) => userPermissionsInPermissionResolvable.push(permission.replace(/ /g, '_').toUpperCase() as any));

                if (!message.member.permissions?.has(userPermissionsInPermissionResolvable)) return message.channel.send(noPermissionEmbed.setDescription(`${emojis.tickNo} You need **${userPermissions.join(', ')}** permission${userPermissions.length > 1 ? 's' : ''} to use this command!`));
            }
            if (commandObj.config.botPermissions) {
                const botPermissions: string[] = commandObj.config.botPermissions;
                const botPermissionsInPermissionResolvable: PermissionResolvable[] = [];

                botPermissions.forEach((permission) => botPermissionsInPermissionResolvable.push(permission.replace(/ /g, '_').toUpperCase() as any));

                if (!message.channel.permissionsFor(client.user!.id)?.has(botPermissionsInPermissionResolvable)) return message.channel.send(noPermissionEmbed.setDescription(`${emojis.tickNo} I need **${botPermissions.join(', ')}** permission${botPermissions.length > 1 ? 's' : ''} to execute this command!`));
            }
        }

        const commandFile = require(`../commands/${commandObj.fileName}`);
        await commandFile.run(message, client, args);

        const networth = await utils.getNetworth(message.author.id);
        await database.setProp('economy', message.author.id, networth, 'networth');
    } catch (error) {
        console.error(error);
    }
};
