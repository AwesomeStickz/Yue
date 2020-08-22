import { JSONB, STRING } from 'sequelize';
import { define } from '../sequelize';

export const economy = define('economy', {
    userid: {
        type: STRING,
    },
    data: {
        type: JSONB,
        defaultValue: {},
    },
});
