const Sequelize = require('sequelize');

// Connection information
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

/**
 * Player profile details name, id
 * Player level and Xp
 * Player Karma
 * Player Gacha currency count
 * Player non gacha currecy 1
 * Player history??
 * Player inventory count
 * Player Discord ID
 * Player Permissions
 * Player Status
 */
const Player = sequelize.define('player', {
	playerID: {
		type: Sequelize.INTEGER,
		unique: true,
	},
	name: {
		type: Sequelize.STRING,
		unique: false,
	},
	level: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
		allowNull: false,
	},
	xp: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
		allowNull: false,
	},
	gems: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 20,
		allowNull: false,
	},
	money: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
		allowNull: false,
	},
	karma: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
		allowNull: false,
	},
	inventory: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
		allowNull: false,
	},
	permissions: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
		allowNull: false,
	},
	bans: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
		allowNull: false,
	},
});

/**
 * Character ID from 1-infinity
 * Character Name in their repective anime/game
 * Character 
 */
const Character = sequelize.define('character', {
	characterID: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	characterName: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	seriesID: {
		type: Sequelize.INTEGER,
		unique: true,
		allowNull: false,
	},
	alias: {
		type: Sequelize.STRING,
		unique: false,
	},
	simps: {
		type: Sequelize.INTEGER,
		unique: true,
		allowNull: false,
	},
	imageCount: {
		type: Sequelize.INTEGER,
		unique: true,
		allowNull: false,
	}
});


const Series = sequelize.define('series', {
	seriesID: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		initialAutoIncrement: 1
	},
	seriesName: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
	},
	malLink: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
	},
		
});


const Image = sequelize.define('image', {
	imageID: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	characterID: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	imageNumber: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	iamgeURL: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
	}
});

const Card = sequelize.define('card', {
	cardID: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	PlayerID: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	inventoryID: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	characterID: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	imageNumber: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	imageID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	rarity: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	archived: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
		unique: false,
		allowNull: false,
	}
}); 

const Rarity = sequelize.define('rarity', {
	rarityID: {
		type: Sequelize.INTEGER,
		unique: true,
		allowNull: false,
	},
	rarityName: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
	},
	color: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	reward: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
}); 



exports.sequelize = sequelize;
exports.Player = Player;
exports.Character = Character;
exports.Image = Image;
exports.Series = Series;
exports.Card = Card;
exports.Rarity = Rarity;