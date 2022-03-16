const database = require('../database');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');
var dayjs = require('dayjs');
//import dayjs from 'dayjs' // ES 2015
dayjs().format()
var cooldown = false;

function createEmbed() {
    const embed = new MessageEmbed();
    embed.setTitle("Basic loot drop")
            .setDescription(`Press claim to gain 10 gems.`)
            .setColor(color.purple)
    return embed;
}

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('claim')
                    .setLabel('claim')
                    .setStyle('SUCCESS')
            )
        return row;
    } catch(error) {
        console.log("error has occured in createButton");
    }
}

async function disableButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('claim')
                    .setLabel('claim')
                    .setStyle('SUCCESS')
					.disabled(true)
            )
        return row;
    } catch(error) {
        console.log("error has occured in disableButton");
    }
}

async function claimBox(uid, message, msg) {
    
}

async function buttonManager(message, msg) {
    try {
        const collector = msg.createMessageComponentCollector({max:1, time: 30000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'claim':
                    const time = await database.Collect.findOne({where: {playerID: i.user.id}});
                    const timeNow = Date.now();
                    const timeDiff = timeNow - time.lastclaim;
                    if (timeDiff > 900000) {
                        await database.Player.increment({gems: 10}, {where: {playerID: i.user.id}});
                        await message.channel.send(`${i.user.toString()} gained 10 gems! 2/3 charges remaining`);
                        await time.update({lastclaim: timeNow-600000});
                    } else if (timeDiff > 600000) {
                        await database.Player.increment({gems: 10}, {where: {playerID: i.user.id}});
                        await message.channel.send(`${i.user.toString()} gained 10 gems! 1/3 charges remaining`);
                        await time.update({lastclaim: timeNow-300000});
                    } else if (timeDiff > 300000) {
                        const cooldown = dayjs.duration(600000-timeDiff).format('mm[m : ]ss[s]');
                        await database.Player.increment({gems: 10}, {where: {playerID: i.user.id}});
                        await message.channel.send(`${i.user.toString()} gained 10 gems!
                Cooldown remaining: ${cooldown}`);
                        await time.update({lastclaim: timeNow-300000});
                    } else {
                        const cooldown = dayjs.duration(300000-timeDiff).format('mm[m : ]ss[s]');
                        await message.channel.send(`${i.user.toString()} failed to claim. 
                Cooldown remaining: ${cooldown}`);
                        await buttonManager(message, msg);
                    }
                    break;
            };
            i.deferUpdate();
        });

    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}

module.exports = {
	name: 'messageCreate',
	async execute(message) {
		if (message.author.bot) {
			return;
		}

		
		if (cooldown) {
			return;
		} else {
            const rng = Math.floor(Math.random()*20);
            if (rng >= 17) {
                const embed = createEmbed();
                const row = await createButton();
                msg = await message.channel.send({ embeds: [embed], components: [row], fetchReply: true });
                await buttonManager(message, msg);
                cooldown = true;
                setTimeout(() => {
                    cooldown = false
                }, 30000);
            }
		}
	},
};