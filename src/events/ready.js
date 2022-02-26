const database = require('../database.js')
const database2 = require('../database2.js')

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        // database.Tags.sync();
        // database.Player.sync();
        // database.Character.sync();
        // database.Skill.sync();
        // database.SkillDesc.sync();
        database2.Player.sync();
        database.Character.sync();
        database.Image.sync();
        database.Series.sync();
        console.log('database sync complete!');
    },
};