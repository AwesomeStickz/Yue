import { Client, Message, PermissionResolvable } from 'discord.js';
import prettyMs from 'pretty-ms';
import { aliases, commands } from '../utils/commandsAndAliases';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { tempCache } from '../utils/tempCache';
import { utils } from '../utils/utils';

export const run = async (client: Client, oldMessage: Message, newMessage: Message): Promise<Message | void> => {
    if (newMessage.author?.bot) return;
    if (newMessage.channel.type !== 'text' || !newMessage.member || !newMessage.guild) return;
    if (!newMessage.channel.permissionsFor(newMessage.guild!.me!)?.has('SEND_MESSAGES')) return;

    const prefix = (await database.getProp('guildsettings', newMessage.guild!.id, 'prefix')) || '>';

    if (newMessage.content.indexOf(prefix) !== 0) return;
    if (oldMessage.content === newMessage.content) return;

    const blacklistedReason = await database.get('blacklist', newMessage.author.id);
    if (blacklistedReason && newMessage.content !== `${prefix}support`) return newMessage.channel.send(`${emojis.tickNo} You are blacklisted from using the bot! Reason: ${blacklistedReason}. You can join support server using \`${prefix}support\` if you want to appeal!`);

    try {
        const args = newMessage.content.slice(prefix.length).split(/ +/g);
        let command = args.shift()?.toUpperCase() || '';

        if (aliases.has(`${command} ${args[0]?.toUpperCase()} ${args[1]?.toUpperCase()}`)) command = aliases.get(`${command} ${args.shift()?.toUpperCase()} ${args.shift()?.toUpperCase()}`) as string;
        else if (aliases.has(`${command} ${args[0]?.toUpperCase()}`)) command = aliases.get(`${command} ${args.shift()?.toUpperCase()}`) as string;
        else if (aliases.has(command)) command = aliases.get(command) as string;
        else return;

        const owners = await database.getProp('yue', client.user!.id, 'owners');
        const commandObj = commands.get(command) as any;
        const finishedGetStarted = await database.getProp('economy', newMessage.author.id, 'getstarted');

        if (commandObj.config.owner === true && !owners.includes(newMessage.author.id)) return;
        if (commandObj.config.args > args.length) return newMessage.channel.send(await utils.help(commandObj.help.name, client, newMessage));
        if (commandObj.config.botPermissions || commandObj.config.userPermissions) {
            const noPermissionEmbed = embed({
                color: newMessage.guild.me?.displayHexColor,
            });

            if (commandObj.config.userPermissions) {
                const userPermissions: string[] = commandObj.config.userPermissions;
                const userPermissionsInPermissionResolvable: PermissionResolvable[] = [];

                userPermissions.forEach((permission) => userPermissionsInPermissionResolvable.push(permission.replace(/ /g, '_').toUpperCase() as any));

                if (!newMessage.member.permissions?.has(userPermissionsInPermissionResolvable)) return newMessage.channel.send(noPermissionEmbed.setDescription(`${emojis.tickNo} You need **${userPermissions.join(', ')}** permission${userPermissions.length > 1 ? 's' : ''} to use this command!`));
            }
            if (commandObj.config.botPermissions) {
                const botPermissions: string[] = commandObj.config.botPermissions;
                const botPermissionsInPermissionResolvable: PermissionResolvable[] = [];

                botPermissions.forEach((permission) => botPermissionsInPermissionResolvable.push(permission.replace(/ /g, '_').toUpperCase() as any));

                if (!newMessage.channel.permissionsFor(client.user!.id)?.has(botPermissionsInPermissionResolvable)) return newMessage.channel.send(noPermissionEmbed.setDescription(`${emojis.tickNo} I need **${botPermissions.join(', ')}** permission${botPermissions.length > 1 ? 's' : ''} to execute this command!`));
            }
        }
        if (!finishedGetStarted && commandObj.config.category === 'economy' && commandObj.help.name !== 'Get Started') return newMessage.channel.send(embed({ color: newMessage.guild.me?.displayHexColor, desc: `${emojis.tickNo} You have to use \`get started\` command first to use economy commands!` }));

        if (!commandObj.help.cooldown) {
            const cooldown = 500;
            const lastCommandUsage = tempCache.get(`${commandObj.help.name.replace(/ /g, '').toLowerCase()}_${newMessage.author.id}`) || 0;
            const remainingCooldown = cooldown - (Date.now() - lastCommandUsage);
            const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

            if (remainingCooldown > 0) return newMessage.channel.send(`${emojis.tickNo} This commands is in cooldown! Come back in ${time}!`);
            tempCache.set(`${commandObj.help.name.replace(/ /g, '').toLowerCase()}_${newMessage.author.id}`, Date.now());
        }

        const commandFile = require(`../commands/${commandObj.fileName}`);
        await commandFile.run(newMessage, client, args, prefix);

        const networth = await utils.getNetworth(newMessage.author.id);
        await database.setProp('economy', newMessage.author.id, networth, 'networth');
    } catch (error) {
        console.error(error);
    }
};
