const Sequelize = require("sequelize");

// Connection information
const sequelize = new Sequelize("database", "user", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    // SQLite only
    storage: "database.sqlite",
});

const SkillDesc = require("./models/player.js")(sequelize, Sequelize.DataTypes);
require("./models/character.js")(sequelize, Sequelize.DataTypes);
require("./models/player.js")(sequelize, Sequelize.DataTypes);
require("./models/skills.js")(sequelize, Sequelize.DataTypes);

const force = process.argv.includes("--force") || process.argv.includes("-f");

sequelize
    .sync({ force })
    .then(async () => {
        const skillbook = [
            Skilldesc.upsert({
                skillID: 1,
                name: "fishing",
                maxLevel: 20,
                description: `
					Skill for catching fish. 
					Requires large amount of patience and luck.
					`,
            }),
			Skilldesc.upsert({
                skillID: 1,
                name: "foraging",
                maxLevel: 20,
                description: `
					Skill for scavenging the wild. 
					Essential survival skill.
					`,
            }),
			Skilldesc.upsert({
                skillID: 1,
                name: "exploring",
                maxLevel: 20,
                description: `
					Skill for eploring new areas. 
					Only courage and luck can help you here.
					`,
            }),
			Skilldesc.upsert({
                skillID: 1,
                name: "crafting",
                maxLevel: 20,
                description: `
					Skill for crafting items and equipment. 
					Requires high dexterity and craftmanship.
					`,
            }),
			Skilldesc.upsert({
                skillID: 1,
                name: "cooking",
                maxLevel: 20,
                description: `
					Skill for cooking. 
					Everyone can learn to cook, probably.
					`,
            }),

        ];
        console.log("Database Synced");

        sequelize.close();
    })
    .catch(console.error);