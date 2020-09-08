import { Client } from 'discord.js';
import { database } from '../utils/databaseFunctions';

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

    const removeBoosters = async () => {
        const allEconomyData: any = await database.all('economy');

        for (const economyData of allEconomyData) {
            const currentBoosters = economyData.data.boosters || [];
            if (currentBoosters.length > 0) {
                const newBoosters = currentBoosters.filter((booster: { name: string; endTime: number }) => booster.endTime < Date.now());
                if (currentBoosters.length !== newBoosters.length) {
                    newBoosters.length > 0 ? await database.setProp('economy', economyData.userid, newBoosters, 'boosters') : await database.deleteProp('economy', economyData.userid, 'boosters');
                }
            }
        }
    };

    setInterval(changeStatus, 20000);
    setInterval(sweepChannels, 300000);
    setInterval(removeBoosters, 60000);
};
