CREATE TABLE IF NOT EXISTS userMeta (
    user varchar(20),
    displayName varchar(40),
    password varchar(16),
    CONSTRAINT PK_userMeta PRIMARY KEY (user ASC)
);

CREATE TABLE IF NOT EXISTS toBuy (
	id INTEGER AUTOINCREMENT,
    user varchar(20),
    content TEXT,
    datetime INTEGER,
    tag1 varchar(10),
    tag2 varchar(10),
    tag3 varchar(10),
    tag4 varchar(10),
    tag5 varchar(10),
    CONSTRAINT PK_toBuy PRIMARY KEY (id ASC)
);

CREATE TABLE IF NOT EXISTS toSell (
	id INTEGER AUTOINCREMENT,
    user varchar(40),
    content TEXT,
    datetime INTEGER,
    tag1 varchar(10),
    tag2 varchar(10),
    tag3 varchar(10),
    tag4 varchar(10),
    tag5 varchar(10),
    CONSTRAINT PK_toSell PRIMARY KEY (id ASC)
);