const mongoose = require('mongoose');
const { dbToken } = require('../../data/config.json');
const fs = require('fs');
const mongoEventFiles = fs.readdirSync('src/mongoEvents').filter(file => file.endsWith(".js"));

module.exports = (client) => {
    client.dbLogin = async () => {
        for (file of mongoEventFiles) {
            const event = require(`../mongoEvents/${file}`);
            if (event.once) {
                mongoose.connection.once(event.name, (...args) => event.execute(...args));
                console.log(`Event ${file} sucessfully triggered once.`)
            } else {
                mongoose.connection.on(event.name, (...args) => event.execute(...args));
                console.log(`Event ${file} sucessfully added to events.`)
            }
        }
        mongoose.Promise = global.Promise;
        await mongoose.connect(dbToken);
    };
};