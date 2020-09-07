import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const jobEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL({ dynamic: true }),
            name: 'Job List',
        },
        color: message.guild?.me?.displayHexColor,
        desc: 'Join a job and work for money. You can join all the jobs below at once to get more pay',
        fields: [
            { name: 'Waiter', value: '$600', inline: true },
            { name: 'Cashier', value: '$1000', inline: true },
            { name: 'Construction Labourer', value: '$1,850', inline: true },
            { name: 'Administration', value: '$2,400', inline: true },
            { name: 'Marketing Manager', value: '$3,000', inline: true },
            { name: 'Nurse', value: '$6,200', inline: true },
            { name: 'Fireman', value: '$8,000', inline: true },
            { name: 'Carpenter', value: '$10,000', inline: true },
            { name: 'Electrician', value: '$13,000', inline: true },
            { name: 'Doctor', value: '$32,000', inline: true },
            { name: 'Engineer', value: '$50,000', inline: true },
            { name: 'Architectural Engineer', value: '$75,000', inline: true },
        ],
        footer: 'Use >job join to join a job',
    });

    message.channel.send(jobEmbed);
};

export const help = {
    aliases: ['job list'],
    name: 'Job List',
    description: 'View all the jobs you can join and work',
    usage: 'job list',
    example: 'job list',
};

export const config = {
    args: 0,
    category: 'economy',
};
