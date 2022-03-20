const database = require('../database');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');
var dayjs = require('dayjs');
//import dayjs from 'dayjs' // ES 2015
dayjs().format()
var cooldown = false;
var cooldown2 = false;

function createEmbed() {
    const embed = new MessageEmbed();
    embed.setTitle("Basic loot drop")
            .setDescription(`Press claim to gain 10 gems.`)
            .setColor(color.white)
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


async function buttonManager(channel, msg, row) {
    try {
        const collector = msg.createMessageComponentCollector({max:1, time: 30000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'claim':
                    const time = await database.Collect.findOne({where: {playerID: i.user.id}});
                    const timeNow = Date.now();
                    const timeDiff = timeNow - time.lastclaim;
                    if (timeDiff > 1800000) {
                        await database.Player.increment({gems: 10}, {where: {playerID: i.user.id}});
                        await channel.send(`${i.user.toString()} gained 10 gems! 2/3 Cooldown remaining`);
                        await time.update({lastclaim: timeNow-1200000});
                        row.components[0].setDisabled(true)
                    } else if (timeDiff > 1200000) {
                        await database.Player.increment({gems: 10}, {where: {playerID: i.user.id}});
                        await channel.send(`${i.user.toString()} gained 10 gems! 1/3 Cooldown remaining`);
                        await time.update({lastclaim: timeNow-timeDiff+600000});
                        row.components[0].setDisabled(true)
                    } else if (timeDiff > 600000) {
                        const cooldown = dayjs.duration(1200000-timeDiff).format('mm[m : ]ss[s]');
                        await database.Player.increment({gems: 10}, {where: {playerID: i.user.id}});
                        await channel.send(`${i.user.toString()} gained 10 gems!\nCooldown remaining: ${cooldown}`);
                        await time.update({lastclaim: timeNow-timeDiff+600000});
                        row.components[0].setDisabled(true)
                    } else {
                        const cooldown = dayjs.duration(600000-timeDiff).format('mm[m : ]ss[s]');
                        await channel.send(`${i.user.toString()} failed to claim.\nCooldown remaining: ${cooldown}`);
                        await buttonManager(channel, msg, row);
                    }
                    break;
            };
            msg.edit({components: [row]});
            i.deferUpdate();
        });

        collector.on('end', async i => {
            row.components[0].setDisabled(true);
            msg.edit({components: [row]});
        })

    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}

async function buttonManager2(channel, msg, row) {
    try {
        const collector = msg.createMessageComponentCollector({max:1, time: 30000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'claim':
                    const time = await database.Collect.findOne({where: {playerID: i.user.id}});
                    const timeNow = Date.now();
                    const timeDiff = timeNow - time.lastclaim;
                    if (timeDiff > 1800000) {
                        await database.Player.increment({gems: 100}, {where: {playerID: i.user.id}});
                        await channel.send(`${i.user.toString()} gained 100 gems! 2/3 Cooldown remaining`);
                        await time.update({lastclaim: timeNow-1200000});
                        row.components[0].setDisabled(true)
                    } else if (timeDiff > 1200000) {
                        await database.Player.increment({gems: 100}, {where: {playerID: i.user.id}});
                        await channel.send(`${i.user.toString()} gained 100 gems! 1/3 Cooldown remaining`);
                        await time.update({lastclaim: timeNow-timeDiff+1200000});
                        row.components[0].setDisabled(true)
                    } else if (timeDiff > 600000) {
                        const cooldown = dayjs.duration(1200000-timeDiff).format('mm[m : ]ss[s]');
                        await database.Player.increment({gems: 100}, {where: {playerID: i.user.id}});
                        await channel.send(`${i.user.toString()} gained 100 gems!\nCooldown remaining: ${cooldown}`);
                        await time.update({lastclaim: timeNow-timeDiff+1200000});
                        row.components[0].setDisabled(true)
                    } else {
                        const cooldown = dayjs.duration(600000-timeDiff).format('mm[m : ]ss[s]');
                        await channel.send(`${i.user.toString()} failed to claim.\nCooldown remaining: ${cooldown}`);
                        await buttonManager2(channel , msg, row);
                    }
                    break;
            };
            msg.edit({components: [row]});
            i.deferUpdate();
        });
        collector.on('end', async i => {
            row.components[0].setDisabled(true);
            msg.edit({components: [row]});
        })

    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}

async function buttonManager3(message, msg, row) {
    try {
        const collector = msg.createMessageComponentCollector({max:1, time: 30000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'claim':
                    const time = await database.Collect.findOne({where: {playerID: i.user.id}});
                    const timeNow = Date.now();
                    const timeDiff = timeNow - time.lastclaim;
                    if (timeDiff > 1800000) {
                        await database.Player.increment({karma: 10}, {where: {playerID: i.user.id}});
                        await msg.channel.send(`${i.user.toString()} gained 100 gems! 2/3 Cooldown remaining`);
                        await time.update({lastclaim: timeNow-1200000});
                        row.components[0].setDisabled(true)
                    } else if (timeDiff > 1200000) {
                        await database.Player.increment({karma: 10}, {where: {playerID: i.user.id}});
                        await message.channel.send(`${i.user.toString()} gained 100 gems! 1/3 Cooldown remaining`);
                        await time.increment({lastclaim: 600000});
                        row.components[0].setDisabled(true)
                    } else if (timeDiff > 600000) {
                        const cooldown = dayjs.duration(1200000-timeDiff).format('mm[m : ]ss[s]');
                        await database.Player.increment({karma: 10}, {where: {playerID: i.user.id}});
                        await msg.channel.send(`${i.user.toString()} gained 100 gems!\nCooldown remaining: ${cooldown}`);
                        const newtime = time.lastclaim+600000;
                        await time.update({lastclaim: newtime});
                        row.components[0].setDisabled(true)
                    } else {
                        const cooldown = dayjs.duration(600000-timeDiff).format('mm[m : ]ss[s]');
                        await message.channel.send(`${i.user.toString()} failed to claim.\nCooldown remaining: ${cooldown}`);
                        await buttonManager2(message, msg, row);
                    }
                    break;
            };
            msg.edit({components: [row]});
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
            const rng = Math.floor(Math.random()*100);
            if (rng >= 99) {
                const embed = createEmbed();
                embed.setDescription(`Claim to gain 100 gems.`).setColor(color.purple).setTitle('Epic Loot Box');
                const row = await createButton();
                let channel = message.guild.channels.cache.get('948658879070355527');
                msg = await channel.send({ embeds: [embed], components: [row], fetchReply: true });
                await buttonManager2(channel, msg, row);
                cooldown = true;
                setTimeout(() => {
                    cooldown = false
                }, 30000);
            }else if (rng >= 91) {
                const embed = createEmbed();
                const row = await createButton();
                let channel = message.guild.channels.cache.get('948658879070355527');
                msg = await channel.send({ embeds: [embed], components: [row], fetchReply: true });
                await buttonManager(channel, msg, row);
                cooldown = true;
                setTimeout(() => {
                    cooldown = false
                }, 30000);
            }
		}

        if (cooldown2) {
			return;
		} else {
            const rng = Math.floor(Math.random()*100);
            if (rng >= 99) {
                const embed = createEmbed();
                embed.setDescription(`Claim to gain 100 gems.`).setColor(color.purple).setTitle('Epic Loot Box');
                const row = await createButton();
                let channel = message.guild.channels.cache.get('950948047985188884');
                msg = await channel.send({ embeds: [embed], components: [row], fetchReply: true });
                await buttonManager2(channel, msg, row);
                cooldown2 = true;
                setTimeout(() => {
                    cooldown2 = false
                }, 30000);
            }else if (rng >= 91) {
                const embed = createEmbed();
                const row = await createButton();
                let channel = message.guild.channels.cache.get('950948047985188884');
                msg = await channel.send({ embeds: [embed], components: [row], fetchReply: true });
                await buttonManager(channel, msg, row);
                cooldown2 = true;
                setTimeout(() => {
                    cooldown2 = false
                }, 30000);
            }
		}
	},
};