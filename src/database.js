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
	infoLink: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	seriesID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	alias: {
		type: Sequelize.STRING,
		unique: false,
		defaultValue: "none",
	},
	simps: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
		allowNull: false,
	},
	imageCount: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
		allowNull: false,
	},
	gifCount: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
		allowNull: false,
	},
	
});


const Series = sequelize.define('series', {
	seriesID: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	seriesName: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	malLink: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
	},
	category: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: true,
	},
});



const Image = sequelize.define('image', {
	imageID: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	characterID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	imageNumber: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	imageURL: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	artist: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	nsfw: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
	},
	uploader: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	}
});

const Gif = sequelize.define('gif', {
	gifID: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	characterID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	gifNumber: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	gifURL: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	artist: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	nsfw: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
	},
	uploader: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	}
});

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
		defaultValue: 200,
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
	pity: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
		allowNull: false,
	},
});

const Daily = sequelize.define('daily', { 
	playerID: {
		type: Sequelize.INTEGER,
		unique: true,
		allowNull: false,
	},
	lastDaily: {
		type: Sequelize.DATE,
		unique: false,
		allowNull: false,
	},
	streak: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	}
});

const Collect = sequelize.define('collect', { 
	playerID: {
		type: Sequelize.INTEGER,
		unique: true,
		allowNull: false,
	},
	lastcollect: {
		type: Sequelize.DATE,
		unique: false,
		allowNull: false,
	},
});

const Wishlist = sequelize.define('wishlist', {
	playerID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	characterID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	}
});

const Sideson = sequelize.define('sideson', {
	playerID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	}
});

const Trade = sequelize.define('trade', {
	player1ID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	player2ID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	type: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	value: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	quantity: {
		type: Sequelize.INTEGER,
		allowNull: true,
	},
	locked: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
});

const Card = sequelize.define('card', {
	cardID: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	playerID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	characterID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	inventoryID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	rarity: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	tag: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: true,
	},
	imageNumber: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: true,
	},
	imageID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: true,
	},
	quantity: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: true,
	  }
});


exports.sequelize = sequelize;
exports.Character = Character;
exports.Image = Image;
exports.Gif = Gif;
exports.Series = Series;
exports.Player = Player;
exports.Daily = Daily;
exports.Wishlist = Wishlist;
exports.Sideson = Sideson;
exports.Card = Card;
exports.Collect = Collect;
exports.Trade = Trade;