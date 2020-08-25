import { BOOLEAN, STRING } from 'sequelize';
import { define } from '../sequelize';

export const blacklist = define('blacklist', {
    userid: {
        type: STRING,
    },
    data: {
        type: BOOLEAN,
    },
});
