import { db } from "..";

db.query(/* sql */ `
    CREATE TABLE IF NOT EXISTS command_stats (
        id SERIAL PRIMARY KEY,

        user_id varchar(30) NOT NULL,
        command_name varchar(100) NOT NULL,
        command_uses bigint NOT NULL,

        UNIQUE(user_id, command_name)
    )
`);
