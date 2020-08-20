import { INTEGER, JSONB, NUMBER, STRING } from 'sequelize';
import { define } from '../sequelize';

export const economy = define('economy', {
    userid: {
        type: STRING,
    },
    data: {
        type: JSONB,
        balance: NUMBER,
        inventory: {
            shops: {
                flower: INTEGER,
                taco: INTEGER,
                burger: INTEGER,
                pizza: INTEGER,
                barber: INTEGER,
                optician: INTEGER,
                chemist: INTEGER,
                butcher: INTEGER,
                baker: INTEGER,
                shoe: INTEGER,
                clothes: INTEGER,
                book: INTEGER,
                grocery: INTEGER,
                diy: INTEGER,
                toy: INTEGER,
                music: INTEGER,
                jewelry: INTEGER,
                plane: INTEGER,
            },
            workers: {
                flower: INTEGER,
                taco: INTEGER,
                burger: INTEGER,
                pizza: INTEGER,
                barber: INTEGER,
                optician: INTEGER,
                chemist: INTEGER,
                butcher: INTEGER,
                baker: INTEGER,
                shoe: INTEGER,
                clothes: INTEGER,
                book: INTEGER,
                grocery: INTEGER,
                diy: INTEGER,
                toy: INTEGER,
                music: INTEGER,
                jewelry: INTEGER,
                plane: INTEGER,
            }
        },
        luck: NUMBER,
        streak: NUMBER,
        defaultValue: {},
    },
});
