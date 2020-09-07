import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, _client: Client, args: string[]): Promise<Message | void> => {
    const slots = {
        Worker: 75,
        House: 150,
        Navigator: 150,
        Shop: 150,
    };

    const slotBuyEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const slotAmountString = args[args.length - 1].toLowerCase();
    const slotName = slotAmountString !== 'all' && slotAmountString !== 'half' && slotAmountString !== 'quarter' && !slotAmountString.endsWith('%') && isNaN(Number(slotAmountString)) ? args.join(' ').toLowerCase() : args.slice(0, -1).join(' ').toLowerCase();

    let validSlot = false;

    for (const [shopSlotName, shopSlotPrice] of Object.entries(slots)) {
        if (slotName.startsWith(shopSlotName.toLowerCase())) {
            const balance = (await database.getProp('economy', message.author.id, 'balance')) || 0;

            let amountUserInvests = 0;
            let slotAmount = 0;

            if (slotAmountString === 'all') amountUserInvests = balance;
            else if (slotAmountString === 'half') amountUserInvests = balance / 2;
            else if (slotAmountString === 'quarter') amountUserInvests = balance / 4;
            else if (slotAmountString.endsWith('%')) amountUserInvests = (Number(slotAmountString.slice(0, -1)) * balance) / 100;
            else {
                slotAmount = Number(slotAmountString);
                if (isNaN(slotAmount)) slotAmount = 1;
                amountUserInvests = slotAmount * shopSlotPrice;
            }

            if (isNaN(amountUserInvests)) return message.channel.send(slotBuyEmbed.setDescription(`${emojis.tickNo} The amount of slots must be a number!`));

            const numberOfSlotsToBuy = slotAmount > 0 ? Math.round(slotAmount) : Math.floor(amountUserInvests / shopSlotPrice);
            const totalMoney = numberOfSlotsToBuy * shopSlotPrice;
            if (totalMoney > balance) return message.channel.send(slotBuyEmbed.setDescription(`${emojis.tickNo} You don't have enough money to buy **${shopSlotName} Slot${numberOfSlotsToBuy > 1 ? 's' : ''}**`));

            await database.subtractProp('economy', message.author.id, totalMoney, 'balance');
            // @ts-expect-error
            await database.addProp('economy', message.author.id, numberOfSlotsToBuy, `inventory.slots.${shopSlotName.toLowerCase()}s`);

            validSlot = true;
            message.channel.send(slotBuyEmbed.setDescription(`${emojis.tickYes} You've successfully bought **${numberOfSlotsToBuy.toLocaleString()} ${shopSlotName} Slot${numberOfSlotsToBuy > 1 ? 's' : ''}** for **$${totalMoney.toLocaleString()}**`));
            break;
        }
    }

    if (!validSlot) return message.channel.send(slotBuyEmbed.setDescription(`${emojis.tickNo} That is not a valid slot!`));
};

export const help = {
    aliases: ['slots buy', 'slot buy'],
    name: 'Slots Buy',
    description: 'Buy slots from the shop for your houses, navigators, shops and workers',
    usage: 'slot buy <slot type> [amount]',
    example: 'shop buy flower shop\nshop buy flower worker\nshop buy mud house',
};

export const config = {
    args: 1,
    category: 'economy',
};
