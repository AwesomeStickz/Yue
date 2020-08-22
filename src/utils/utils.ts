import { Client, Guild } from 'discord.js';
import { database } from './databaseFunctions';

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
    async getNetworth(userid: string) {
        const economyData = (await database.get('economy', userid)) || {};
        let networth = 0;

        if (economyData.balance) networth += economyData.balance;
        if (economyData.inventory) {
            const { inventory } = economyData;

            if (inventory.essence) networth += inventory.essence * 25;

            if (inventory.houses) {
                const { houses } = inventory;

                const allHousePrices = {
                    mud: 22500,
                    tent: 50000,
                    caravan: 75000,
                    shack: 280000,
                    apartment: 500000,
                    bungalow: 5000000,
                    house: 10000000,
                    penthouse: 15000000,
                    mansion: 30000000,
                };

                for (const [houseName, housePrice] of Object.entries(allHousePrices)) {
                    if (houses[houseName]) {
                        networth += houses[houseName] * housePrice;
                    }
                }
            }
            if (inventory.navigators) {
                const { navigators } = inventory;

                const allNavigatorPrices = {
                    iron: 500,
                    bronze: 1250,
                    silver: 4500,
                    gold: 17500,
                    platinum: 90000,
                    diamond: 500000,
                };

                for (const [navigatorName, navigatorPrice] of Object.entries(allNavigatorPrices)) {
                    if (navigators[navigatorName]) {
                        networth += navigators[navigatorName] * navigatorPrice;
                    }
                }
            }
            if (inventory.shops) {
                const { shops } = inventory;

                const allShopPrices = {
                    flower: 500,
                    taco: 3500,
                    burger: 10000,
                    pizza: 17500,
                    barber: 25000,
                    optician: 50000,
                    chemist: 75000,
                    butcher: 100000,
                    baker: 150000,
                    shoe: 300000,
                    clothes: 500000,
                    book: 1000000,
                    grocery: 2500000,
                    diy: 5000000,
                    toy: 10000000,
                    music: 25000000,
                    jewelry: 50000000,
                    plane: 100000000,
                };

                for (const [shopName, shopPrice] of Object.entries(allShopPrices)) {
                    if (shops[shopName]) {
                        networth += shops[shopName] * shopPrice;
                    }
                }
            }
            if (inventory.workers) {
                const { workers } = inventory;

                const allWorkerPrices = {
                    flower: 165,
                    taco: 1160,
                    burger: 3000,
                    pizza: 5800,
                    barber: 8300,
                    optician: 16500,
                    chemist: 25000,
                    butcher: 30000,
                    baker: 50000,
                    shoe: 100000,
                    clothes: 165000,
                    book: 300000,
                    grocery: 830000,
                    diy: 1650000,
                    toy: 3000000,
                    music: 8300000,
                    jewelry: 16500000,
                    plane: 30000000,
                };

                for (const [workerName, workerPrice] of Object.entries(allWorkerPrices)) {
                    if (workers[workerName]) {
                        networth += workers[workerName] * workerPrice;
                    }
                }
            }
        }
        return networth;
    },
    async getUser(arg: string, client: Client, guild?: Guild) {
        if (arg.length < 1) return undefined;
        let user = guild ? this.getMember(arg, guild)?.user : undefined;
        if (!user) user = client.users.cache.filter((u) => u.username.toLowerCase().includes(arg.toLowerCase())).first();
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
