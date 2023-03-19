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
const Events = sequelize.define('events', {
	playerID: {
		type: Sequelize.INTEGER,
		unique: true,
		allowNull: false,
	},
	event: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	}
});

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
	score: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
	votes: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
	final: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
	rank: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 3,
	}
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
	alias: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: true,
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
	},
	uploaderid: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
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
	},
	uploaderid: {
		type: Sequelize.INTEGER,
		unique: false,
	}
});

const Sendqueue = sequelize.define('sendqueue', {
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
	selfcrop: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
	},
	uploader: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	uploaderid: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	bonus: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 0
	},
});

const Swapimage = sequelize.define('swapimage', {
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
	previewURL: {
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
	selfcrop: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
	},
	uploader: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	uploaderid: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	bonus: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 0
	},
	yes: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 0
	},
	no: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 0
	},
	another: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 0
	},
	abstain: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 0
	},
	reason: {
		type: Sequelize.STRING,
     	unique: false
	}
	
});

const Swapgif = sequelize.define('swapgif', {
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
	previewURL: {
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
	selfcrop: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
	},
	uploader: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	uploaderid: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	bonus: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 0
	},
	yes: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 0
	},
	no: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 0
	},
	another: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 0
	},
	
});

const Gifqueue = sequelize.define('gifqueue', {
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
	selfcrop: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
	},
	uploader: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	uploaderid: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	bonus: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 0
	},
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
	kpity: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
	},
	rpity: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
	},
	apity: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
	},
	imagePrestige: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
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
	},
	dailykarma: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0
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
	lastclaim: {
		type: Sequelize.DATE,
		unique: false,
		allowNull: true,
	},
	lastvote: {
		type: Sequelize.DATE,
		unique: false,
		allowNull: true,
	}
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
	},
});

const Trashon = sequelize.define('trashon', {
	playerID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
});

const Votetrack = sequelize.define('votetrack', {
	playerID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	charVote: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 2,
	},
	charVote2: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 1,
	},
	imageVote: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
		defaultValue: 1,
	},
});

const Cvotetrack = sequelize.define('cvotetrack', {
	characterID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
});

const Trade = sequelize.define('trade', {
	tradeID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
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
	inventoryID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	locked: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	}
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
	},
	lock: {
		type: Sequelize.BOOLEAN,
		unique: false,
		allowNull: false,
		defaultValue: false
	},
	charred: {
		type: Sequelize.BOOLEAN,
		unique: false,
		allowNull: false,
		defaultValue: false
	},
	weapon: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: true,
	},
});


const Special = sequelize.define('special', {
	cardID: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	characterName: {
		type: Sequelize.INTEGER,
		unique: false,
	},
	seriesName: {
		type: Sequelize.INTEGER,
		unique: false,
	},
	imageURL: {
		type: Sequelize.STRING,
		unique: false,
	},
	artist: {
		type: Sequelize.INTEGER,
		unique: false,
	},
	color: {
		type: Sequelize.STRING,
		unique: false,
	},
});

const Azurite = sequelize.define('azurite', {
	cardID: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	imageURL: {
		type: Sequelize.STRING,
		unique: false,
	},
	artist: {
		type: Sequelize.STRING,
		unique: false,
	},
	season: {
		type: Sequelize.INTEGER,
		unique: false,
	},
});

const Listtags = sequelize.define('listtag', {
	playerID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	tag1: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	tag2: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	tag3: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	tag4: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	tag5: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
})

const Weapon = sequelize.define('weapon', {
	weaponSprite: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	weaponFluff: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	name: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
	},
	rarity: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	class: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	init: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	health: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	armor: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	atk: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	eva: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	acc: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	crt: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	crd: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
})

const Ability = sequelize.define('ability', {
	abilityID: {
		type: Sequelize.INTEGER,
		unique: true,
		allowNull: false,
	},
	abilityName: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
	},
	abilityText: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
	},
	weaponID: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	abilitySlot: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	target: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	damage: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	dmgvar: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	pen: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	acc: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	crt: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	crd: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	effect: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	self: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	cooldown: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
})

const Deck = sequelize.define('deck', {
	playerID: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	deckNumber: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	deckName: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: false,
	},
	deckImage: {
		type: Sequelize.STRING,
		unique: false,
		allowNull: true,
	},
	unit1: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit2: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit3: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit4: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit5: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
})

const Game = sequelize.define('game', {
	gameID: {
		type: Sequelize.INTEGER,
		unique: true,
		allowNull: false,
	},
	gameType: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	round: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	phase: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
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
	unit1: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit2: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit3: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit4: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit5: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit6: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit7: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit8: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit9: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
	unit10: {
		type: Sequelize.INTEGER,
		unique: false,
		allowNull: false,
	},
})

const StatusType = sequelize.define('statusType', {
	name: {
		type: Sequelize.STRING,
		unique: false,
	},
	statusSprite: {
		type: Sequelize.STRING,
		unique: false,
	},
	description: {
		type: Sequelize.STRING,
		unique: false,
	},
});

const Status = sequelize.define('status', {
	gameID: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	unitNumber: {
		type: Sequelize.INTEGER,
		unique: false,
	},
	statusID: {
		type: Sequelize.INTEGER,
		unique: false,
	},
	duration: {
		type: Sequelize.INTEGER,
		unique: false,
	},
});




exports.sequelize = sequelize;
exports.Character = Character;
exports.Image = Image;
exports.Sendqueue = Sendqueue;
exports.Gif = Gif;
exports.Gifqueue = Gifqueue;
exports.Swapimage = Swapimage;
exports.Swapgif = Swapgif;
exports.Series = Series;
exports.Player = Player;
exports.Daily = Daily;
exports.Wishlist = Wishlist;
exports.Sideson = Sideson;
exports.Trashon = Trashon;
exports.Card = Card;
exports.Collect = Collect;
exports.Trade = Trade;
exports.Votetrack = Votetrack;
exports.Cvotetrack = Cvotetrack;
exports.Special = Special;
exports.Azurite = Azurite;
exports.Events = Events;
exports.Listtags = Listtags;

exports.Weapon = Weapon;
exports.Ability = Ability;
exports.Deck = Deck;
exports.Game = Game;
exports.StatusType = StatusType;
exports.Status = Status;