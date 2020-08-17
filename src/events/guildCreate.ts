import { Client, Guild, TextChannel } from 'discord.js';
import { embed } from '../utils/embed';

export const run = async (client: Client, guild: Guild) => {
    const logChannel = client.channels.cache.get('744852807437516871') as TextChannel;

    const logEmbed = embed({
        color: '#00b0ff',
        thumbnail: guild.iconURL() || '',
        title: `Joined ${guild.name}`,
        fields: [
            { name: 'Owner', value: guild.owner?.user.toString() || 'Unknown#0000' },
            { name: 'ID', value: guild.id },
            { name: 'Users', value: guild.members.cache.filter((m) => !m.user.bot).size.toString() },
            { name: 'Bots', value: guild.members.cache.filter((m) => m.user.bot).size.toString() },
            { name: 'Channels', value: guild.channels.cache.size.toString() },
            { name: 'Servers now', value: client.guilds.cache.size.toLocaleString() },
        ],
    });

    logChannel.send(logEmbed);
};
