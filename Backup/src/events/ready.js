const database = require('../database.js')

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        client.application.commands.set([]);
        console.log(`Ready! Logged in as ${client.user.tag}`);
        database.Player.sync();
        database.Character.sync();
        database.Image.sync();
        database.Gif.sync();
        database.Series.sync();
        database.Daily.sync();
        database.Wishlist.sync();
        database.Card.sync();
        database.Sideson.sync();
        database.Trashon.sync();
        database.Collect.sync();
        database.Trade.sync();
        database.Votetrack.sync();
        database.Sendqueue.sync();
        database.Gifqueue.sync();
        database.Swapimage.sync();
        database.Swapgif.sync();
        database.Special.sync();
        database.Cvotetrack.sync();
        database.Azurite.sync();
        database.Events.sync();
        console.log('database sync complete!');
    },
};