
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `idposts` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `pdesc` varchar(3000) DEFAULT NULL,
  `imgpath` varchar(255) DEFAULT NULL,
  `posttime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idposts`),
  UNIQUE KEY `idposts_UNIQUE` (`idposts`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci