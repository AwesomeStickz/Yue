import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, _client: Client, args: string[]): Promise<Message | void> => {
    const jobs = {
        Waiter: 600,
        Cashier: 1000,
        'Construction Labourer': 1850,
        Administration: 2400,
        'Marketing Manager': 3000,
        Nurse: 6200,
        Fireman: 8000,
        Carpenter: 10000,
        Electrician: 13000,
        Doctor: 32000,
        Engineer: 50000,
        'Architectural Engineer': 75000,
    };

    const jobJoinEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const jobNameThatUserWantsToJoin = args.join(' ').toLowerCase();
    let validJob = false;

    for (const [jobName, jobAmount] of Object.entries(jobs)) {
        if (jobNameThatUserWantsToJoin.startsWith(jobName.toLowerCase())) {
            const userEconomyData = (await database.get('economy', message.author.id)) || {};
            const userBalance = userEconomyData.balance || 0;
            const userJobs = userEconomyData.jobs || [];

            if (userBalance < jobAmount) return message.channel.send(jobJoinEmbed.setDescription(`${emojis.tickNo} You don't have enough money to join **${jobName}** job!`));
            if (userJobs.includes(jobName.toLowerCase())) return message.channel.send(jobJoinEmbed.setDescription(`${emojis.tickNo} You're already in that job!`));

            userJobs.push(jobName.toLowerCase());

            await database.setProp('economy', message.author.id, userJobs, 'jobs');
            await database.subtractProp('economy', message.author.id, jobAmount, 'balance');

            validJob = true;
            message.channel.send(jobJoinEmbed.setDescription(`${emojis.tickYes} You've successfully joined **${jobName}** job!`));
            break;
        }
    }

    if (!validJob) return message.channel.send(jobJoinEmbed.setDescription(`${emojis.tickNo} That's not a valid job!`));
};

export const help = {
    aliases: ['job join'],
    name: 'Job Join',
    description: 'Join a job from the job list',
    usage: 'job join <job name>',
    example: 'job join waiter\njob join casier',
};

export const config = {
    args: 1,
    category: 'economy',
};
