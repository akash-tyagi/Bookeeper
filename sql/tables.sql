CREATE TABLE `books` (
  `ISBN` varchar(13) binary NOT NULL default '',
  `id` int NOT NULL UNIQUE AUTO_INCREMENT,
  `title` varchar(255) default NULL,
  `authorid` int default NULL,
  `published` int unsigned default NULL,
  `publisherid` int default NULL,
  `status` int default 0,
  `limage` varchar(255) binary default NULL,
  PRIMARY KEY  (`ISBN`),
  FOREIGN KEY (`authorid`) REFERENCES authors(`id`),
  FOREIGN KEY (`publisherid`) REFERENCES publishers(`id`)
);

CREATE TABLE `user` (
    `name` varchar(25) default NULL,
    `email` varchar(100),
    PRIMARY KEY (`email`)
);

CREATE TABLE `publishers` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(50) default NULL,
    PRIMARY KEY  (`id`),
    UNIQUE (`name`)
);

CREATE TABLE `authors` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(50) default NULL,
    PRIMARY KEY  (`id`),
    UNIQUE (`name`)
);