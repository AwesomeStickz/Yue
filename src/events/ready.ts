import { Client } from 'discord.js';

export const run = async (client: Client) => {
    const Ready = [
        `--------------------------------------------------------`,
        `Ready since :  ${new Date().toUTCString()}`,
        `Bot         :  ${client.user!.username}`,
        `Members     :  ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}`,
        `Servers     :  ${client.guilds.cache.size}`,
        `--------------------------------------------------------`,
    ].join('\n');

    console.log(`[Ready]\n${Ready}`);

    client.user!.setStatus('idle');

    const changeStatus = () => {
        const status = [`${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} users`, ` ${client.guilds.cache.size.toLocaleString()} servers`];
        const random = status[Math.floor(Math.random() * status.length)];
        client.user!.setActivity(random, { type: 'WATCHING' });
    };

    const sweepChannels = () => {
        client.channels.cache.sweep((channel) => channel.type !== 'text');
    };

    setInterval(changeStatus, 20000);
    setInterval(sweepChannels, 300000);
};
