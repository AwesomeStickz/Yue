import Discord, { ClientEvents, DiscordAPIError } from 'discord.js';
import 'dotenv/config';
import fs from 'fs';
import './database/sequelize';
import { aliases, commands } from './utils/commandsAndAliases';

export const client = new Discord.Client({ disableMentions: 'everyone', partials: ['MESSAGE'], messageCacheMaxSize: 30, messageCacheLifetime: 60, messageSweepInterval: 60 });

//Command handler
fs.readdir('./commands/', (error, files) => {
    if (error) return console.error(error);
    files.forEach((file) => {
        const props = require(`./commands/${file}`);
        props.fileName = file;
        commands.set(props.help.name.toUpperCase(), props);
        props.help.aliases.forEach((alias: string) => {
            aliases.set(alias.toUpperCase(), props.help.name.toUpperCase());
        });
    });
    console.log(`[Commands]\tLoaded a total amount of ${files.length} commands`);
});

//Event handler
fs.readdir('./events/', (error, files) => {
    if (error) return console.error(error);
    files.forEach((file) => {
        const eventFunction = require(`./events/${file}`);
        eventFunction.run.bind(null, client);
        const eventName = file.split('.')[0];
        client.on(eventName as keyof ClientEvents, (...args) => eventFunction.run(client, ...args));
    });
    console.log(`[Events]\tLoaded a total amount of ${files.length} events`);
});

process.on('unhandledRejection', (error) => {
    if (error instanceof DiscordAPIError && error.name === 'DiscordAPIError') return;
    console.error('Uncaught Promise Error: ', error);
});

client.login(process.env.TOKEN);
