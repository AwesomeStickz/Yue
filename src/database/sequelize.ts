import fs from 'fs';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_NAME!, process.env.DATABASE_USERNAME!, process.env.DATABASE_PASSWORD!, {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
    define: {
        freezeTableName: true,
    },
});

sequelize
    .authenticate()
    .then(() => console.log('[Database]\tConnection has been established!'))
    .catch((err) => console.error('Problem with connecting to database:', err));

fs.readdir('./database/models/', (err, files) => {
    if (err) return console.error(err);
    files.forEach((file) => require(`./models/${file}`));
});

sequelize.sync();

export = sequelize;
