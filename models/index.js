const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./data/config.json');
var player = require('./savefiles/player.json');
var series = require('./savefiles/series.json');
var daily = require('./savefiles/daily.json');
var wishlist = require('./savefiles/wishlist.json');
var sideon = require('./savefiles/sideon.json');
var image = require('./savefiles/image.json');
var gif = require('./savefiles/gif.json');
var card = require('./savefiles/card.json');
var collect = require('./savefiles/collect.json');
var trade = require('./savefiles/trade.json');
var voteTrack = require('./savefiles/voteTrack.json');
var trashon = require('./savefiles/trashon.json');
var character = require('./savefiles/character.json');
var sendqueue = require('./savefiles/sendqueue.json');
var gifqueue = require('./savefiles/gifqueue.json');
var swapimage = require('./savefiles/swapimage.json');
var special = require('./savefiles/special.json');
var cvotetrack = require('./savefiles/cvotetrack.json');
var stellarite = require('./savefiles/stellarite.json');
var event = require('./savefiles/event.json');
var listtags = require('./savefiles/listtags.json');

module.exports = {player, series, daily, wishlist, sideon, image, gif, card, 
	collect, trade, voteTrack, trashon, character, sendqueue, gifqueue,
	swapimage, special, cvotetrack, stellarite, event, listtags
};


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath, { withFileTypes: true }).filter(folder => folder.isDirectory()).map(dirent => dirent.name);;

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.login(token);

async function saveAll(
	player, series, daily, wishlist, sideon, image, gif, card, collect, trade,
	voteTrack, trashon, character, sendqueue, gifqueue, swapimage, special,
	cvotetrack, stellarite, event, listtags
) {
	console.log(player[0]);
	fs.writeFileSync('./src/savefiles/player.json', JSON.stringify(player, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/series.json", JSON.stringify(series, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/daily.json", JSON.stringify(daily, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/wishlist.json", JSON.stringify(wishlist, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/sideon.json", JSON.stringify(sideon, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/image.json", JSON.stringify(image, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/gif.json", JSON.stringify(gif, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/card.json", JSON.stringify(card, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/collect.json", JSON.stringify(collect, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/trade.json", JSON.stringify(trade, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/voteTrack.json", JSON.stringify(voteTrack, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/trashon.json", JSON.stringify(trashon, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/character.json", JSON.stringify(character, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/sendqueue.json", JSON.stringify(sendqueue, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/gifqueue.json", JSON.stringify(gifqueue, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/swapimage.json", JSON.stringify(swapimage, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/special.json", JSON.stringify(special, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/cvotetrack.json", JSON.stringify(cvotetrack, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/stellarite.json", JSON.stringify(stellarite, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/event.json", JSON.stringify(event, null, 2), (err) => {
		if (err) console.log(err);
	});
	fs.writeFileSync("./src/savefiles/listtags.json", JSON.stringify(listtags, null, 2), (err) => {
		if (err) {console.log(err);} else {console.log("Listtags Saved")}
	});
	console.log("All data saved before terminating.");
}
process.on('SIGINT', async () => {
	console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAA")
	await saveAll(player, series, daily, wishlist, sideon, image, gif, card, collect, trade,
		voteTrack, trashon, character, sendqueue, gifqueue, swapimage, special,
		cvotetrack, stellarite, event, listtags);
	process.exit(0);
});

process.on('SIGTERM', async () => {
	console.log("AAAAAAAAAAAA")
	await saveAll(player, series, daily, wishlist, sideon, image, gif, card, collect, trade,
		voteTrack, trashon, character, sendqueue, gifqueue, swapimage, special,
		cvotetrack, stellarite, event, listtags);
	process.exit(0);
});