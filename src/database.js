const Sequelize = require('sequelize');

// Connection information
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

// Creating the model
const Tags = sequelize.define('tags', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	description: Sequelize.TEXT,
	username: Sequelize.STRING,
	usage_count: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
});

const Player = sequelize.define('player', {
	playerID: {
		type: Sequelize.INTEGER,
		unique: true,
	},
	Name: {
		type: Sequelize.STRING,
		unique: false,
	},
	Level_Cap: {
		type: Sequelize.INTEGER,
		defaultValue: 100,
		unique:false,
	},
});


exports.sequelize = sequelize;
exports.Tags = Tags;
exports.Player = Player;