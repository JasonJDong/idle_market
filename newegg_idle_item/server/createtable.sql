CREATE TABLE IF NOT EXISTS userMeta (
    user varchar(20),
    displayName varchar(40),
    password varchar(16),
    CONSTRAINT PK_userMeta PRIMARY KEY (user ASC)
);

CREATE TABLE IF NOT EXISTS toBuy (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
    guid varchar(32),
    user varchar(20),
    content TEXT,
    datetime INTEGER,
    password varchar(50),
    pictureUrl varchar(100),
    tag1 varchar(10),
    tag2 varchar(10),
    tag3 varchar(10),
    tag4 varchar(10),
    tag5 varchar(10)
);

CREATE TABLE IF NOT EXISTS toSell (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
    guid varchar(32),
    user varchar(40),
    content TEXT,
    datetime INTEGER,
    password varchar(50),
    pictureUrl varchar(100),
    tag1 varchar(10),
    tag2 varchar(10),
    tag3 varchar(10),
    tag4 varchar(10),
    tag5 varchar(10)
);