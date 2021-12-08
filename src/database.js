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
	name: {
		type: Sequelize.STRING,
		unique: false,
	},
	levelCap: {
		type: Sequelize.INTEGER,
		defaultValue: 100,
		unique:false,
	},
	characterCount: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		unique:false,
	}
});

const Character = sequelize.define('character', {
	characterID: {
		type: Sequelize.INTEGER,
		unique: true,
	},
	name: {
		type: Sequelize.STRING,
		unique: false,
	},
	level: {
		type: Sequelize.INTEGER,
		defaultValue: 1,
		unique:false,
	},
	health: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 100,
	},
	stamina: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 100,
	},
	fish: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 1,
	},
	skillCount: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
	},
});

const Skill = sequelize.define('skill', {
	characterID: {
		type: Sequelize.INTEGER,
		unique: true,
	},
	skillName: {
		type: Sequelize.STRING,
		unique: false,
	},
	skillXP: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
	},
	skillLevel: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 1,
	},
});

const SkillDesc = sequelize.define('skilldesc', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	maxLevel: {
		type: Sequelize.INTEGER,
		unique: false,
		defaultValue: 0,
	},
	description: {
		type: Sequelize.STRING,
		unique: false,
	}
});


exports.sequelize = sequelize;
exports.Tags = Tags;
exports.Player = Player;
exports.Character = Character;
exports.Skill = Skill;
exports.SkillDesc = SkillDesc;