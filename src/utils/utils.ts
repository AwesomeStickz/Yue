import { Client, Guild } from 'discord.js';

export const utils = {
    getMember(arg: string, guild: Guild) {
        if (arg.length < 1) return undefined;
        let member = guild.members.cache.get(arg);
        if (!member) member = guild.members.cache.filter((m) => m.user.username.toLowerCase().includes(arg.toLowerCase())).first();
        if (!member) member = guild.members.cache.filter((m) => m.user.tag.toLowerCase() === arg.toLowerCase()).first();
        if (!member) member = guild.members.cache.get(arg.slice(3, -1));
        if (!member) member = guild.members.cache.get(arg.slice(2, -1));
        if (member) return member;
        else return undefined;
    },
    async getUser(arg: string, client: Client) {
        if (arg.length < 1) return undefined;
        let user = client.users.cache.filter((u) => u.username.toLowerCase().includes(arg.toLowerCase())).first();
        if (!user) user = client.users.cache.filter((u) => u.tag.toLowerCase() === arg.toLowerCase()).first();
        if (!user && /[0-9]{17,20}/.test(arg)) {
            arg = /[0-9]{17,20}/.exec(arg)![0];
            if (!user) user = client.users.cache.get(arg);
            if (!user) user = await client.users.fetch(arg);
        }
        if (user) return user;
        else return undefined;
    },
};
