const Sequelize = require('sequelize');

// Connection information
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const Character = require('./models/character.js')(sequelize, Sequelize.DataTypes);
const Player = require('./models/player.js')(sequelize, Sequelize.DataTypes);
const Skills = require('./models/skills.js')(sequelize, Sequelize.DataTypes);
const SkillDesc = require('./models/skilldesc.js')(sequelize, Sequelize.DataTypes);

Character.belongsTo(Player, { foreignKey: 'FK_playerID', as: 'playerID' });
Skills.belongsTo(Character, { foreignKey: 'FK_characterID', as: 'characterID' });




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

exports.sequelize = sequelize;
module.exports = { Tags, Character, Player, Skills, SkillDesc};