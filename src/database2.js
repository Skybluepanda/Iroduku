const Sequelize = require('sequelize');

// Connection information
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database2.sqlite',
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


exports.sequelize = sequelize;
exports.Player = Player;