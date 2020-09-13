import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const moneyDropEmbed = embed({
        author: {
            image: client.user?.displayAvatarURL(),
            name: 'Money Drop',
        },
        color: message.guild?.me?.displayHexColor,
    });

    const channel = utils.getChannel(args.slice(1).join(' '), message.guild!);
    if (!channel) return message.channel.send(moneyDropEmbed.setDescription(`${emojis.tickNo} I couldn't find that channel! Maybe I don't have permissions to view it or it's not in this server!`));
    if (channel.type !== 'text') return message.channel.send(moneyDropEmbed.setDescription(`${emojis.tickNo} Money Drop channel can be a text channel only!`));

    const setMoneyDrop = async (subCommand: string) => {
        switch (subCommand) {
            case 'enable':
                await database.setProp('guildsettings', message.guild!.id, { channelID: channel.id, guildID: message.guild?.id }, 'moneydrop');
                message.channel.send(moneyDropEmbed.setDescription(`${emojis.tickYes} Money Drop channel in this server has been set to ${channel.toString()}`));
                break;
            case 'disable':
                await database.deleteProp('guildsettings', message.guild!.id, 'moneydrop');
                message.channel.send(moneyDropEmbed.setDescription(`${emojis.tickYes} Disabled money drop in this server!`));
                break;
            case 'toggle':
                const moneyDropEnabled = await database.getProp('guildsettings', message.guild!.id, 'moneydrop');

                if (!moneyDropEnabled) setMoneyDrop('enable');
                else setMoneyDrop('disable');

                break;
            default:
                message.channel.send(moneyDropEmbed.setDescription(`${emojis.tickNo} That's not a valid sub command! These are the valid ones: \`enable\`, \`disable\`, \`toggle\``));
        }
    };

    setMoneyDrop(args[0].toLowerCase());
};

export const help = {
    aliases: ['money drop'],
    name: 'Money Drop',
    description: 'Enable/Disable money drop in a channel',
    usage: 'money drop enable/disable <channel>',
    example: 'money drop enable #money-drop\nmoney drop disable #money-drop',
};

export const config = {
    args: 2,
    owner: true,
    category: 'economy',
};
