const Sequelize = require('sequelize');

// Connection information
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database2.sqlite',
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


Series.hasMany(Character);
Character.belongsTo(Series);


exports.sequelize = sequelize;
exports.Card = Card;
exports.Rarity = Rarity;