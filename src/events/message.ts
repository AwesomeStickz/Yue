import { Client, Message, PermissionResolvable } from 'discord.js';
import prettyMs from 'pretty-ms';
import { db } from '../database';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { tempCache } from '../utils/tempCache';
import { utils } from '../utils/utils';
import { aliases, commands } from '../yue';

export const run = async (client: Client, message: Message): Promise<Message | void> => {
    if (message.author.bot) return;
    if (message.channel.type !== 'text' || !message.member || !message.guild) return;
    if (!message.channel.permissionsFor(message.guild!.me!)?.has('SEND_MESSAGES')) return;

    const prefix = (await database.getProp('guildsettings', message.guild!.id, 'prefix')) || '>';

    if (message.content.indexOf(prefix) !== 0) return;

    try {
        const args = message.content.slice(prefix.length).split(/ +/g);
        let command = args.shift()?.toUpperCase() || '';

        if (aliases.has(`${command} ${args[0]?.toUpperCase()} ${args[1]?.toUpperCase()}`)) command = aliases.get(`${command} ${args.shift()?.toUpperCase()} ${args.shift()?.toUpperCase()}`) as string;
        else if (aliases.has(`${command} ${args[0]?.toUpperCase()}`)) command = aliases.get(`${command} ${args.shift()?.toUpperCase()}`) as string;
        else if (aliases.has(command)) command = aliases.get(command) as string;
        else return;

        const owners = await database.getProp('yue', client.user!.id, 'owners');
        const commandObj = commands.get(command) as any;
        const finishedGetStarted = await database.getProp('economy', message.author.id, 'getstarted');
        const blacklistedReason = await database.get('blacklist', message.author.id);

        if (commandObj.config.owner === true && !owners.includes(message.author.id)) return;
        if (blacklistedReason && message.content !== `${prefix}support`)
            return message.channel.send(
                embed({
                    author: {
                        image: client.user!.displayAvatarURL(),
                        name: 'Blacklisted!',
                    },
                    color: message.guild.me!.displayHexColor,
                    desc: `${emojis.tickNo} You are blacklisted from using the bot! Reason: ${blacklistedReason}. You can join support server using \`${prefix}support\` if you want to appeal!`,
                })
            );
        if (commandObj.config.args > args.length) return message.channel.send(await utils.help(commandObj.help.name, client, message));
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
        if (!finishedGetStarted && commandObj.config.category === 'economy' && commandObj.help.name !== 'Get Started') return message.channel.send(embed({ color: message.guild.me?.displayHexColor, desc: `${emojis.tickNo} You have to use \`get started\` command first to use economy commands!` }));

        if (!commandObj.help.cooldown) {
            const cooldown = 500;
            const lastCommandUsage = tempCache.get(`${commandObj.help.name.replace(/ /g, '').toLowerCase()}_${message.author.id}`) || 0;
            const remainingCooldown = cooldown - (Date.now() - lastCommandUsage);
            const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

            if (remainingCooldown > 0) return message.channel.send(`${emojis.tickNo} This commands is in cooldown! Come back in ${time}!`);
            tempCache.set(`${commandObj.help.name.replace(/ /g, '').toLowerCase()}_${message.author.id}`, Date.now());
        }

        const commandFile = require(`../commands/${commandObj.fileName}`);
        await commandFile.run(message, client, args, prefix);

        const networth = await utils.getNetworth(message.author.id);
        await database.setProp('economy', message.author.id, networth, 'networth');

        if (commandObj.config.owner !== true) {
            db.query(/*sql*/ `
                INSERT INTO command_stats
                VALUES (DEFAULT, '${message.author.id}', '${commandObj.help.name.toLowerCase()}', 1)
                ON CONFLICT (user_id, command_name)
                DO UPDATE SET command_uses = command_stats.command_uses + 1
            `);
        }
    } catch (error) {
        console.error(error);
    }
};
