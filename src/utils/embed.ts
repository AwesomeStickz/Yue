import { MessageEmbed } from 'discord.js';

interface EmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

interface EmbedOptions {
    author?: { name: string; image?: string | undefined };
    color?: string;
    desc?: string;
    fields?: EmbedField[];
    footer?: string;
    image?: string;
    thumbnail?: string;
    title?: string;
    timestamp?: boolean | number;
}

export const embed = (options: EmbedOptions) => {
    const embed = new MessageEmbed();

    if (options?.author) embed.setAuthor(options.author.name, options.author?.image);
    if (options?.color) embed.setColor(options.color);
    if (options?.desc) embed.setDescription(options.desc);
    if (options?.fields) {
        for (const field of options.fields) {
            embed.addField(field.name, field.value, field.inline);
        }
    }
    if (options?.footer) embed.setFooter(options.footer);
    if (options?.image) embed.setImage(options.image);
    if (options?.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options?.title) embed.setTitle(options.title);
    if (options?.timestamp) {
        if (options?.timestamp === true) embed.setTimestamp();
        else embed.setTimestamp(options.timestamp);
    }

    return embed;
};
