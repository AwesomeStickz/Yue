import { JSONB, NUMBER, STRING } from 'sequelize';
import { define } from '../sequelize';

export const economy = define('economy', {
    userid: {
        type: STRING,
    },
    data: {
        type: JSONB,
        balance: NUMBER,
        luck: NUMBER,
        streak: NUMBER,
        defaultValue: {},
    },
});
