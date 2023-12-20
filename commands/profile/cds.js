const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
var dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration');
//import dayjs from 'dayjs' // ES 2015
dayjs().format()
dayjs.extend(duration)

function embedLVL(interaction) {
    const username = interaction.user.username;
    const embedDone = new MessageEmbed();
    embedDone.setTitle("LEVEL UP")
        .setAuthor({name: username, iconURL: interaction.user.avatarURL({ dynamic: true })})
        .setColor(color.stellar)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));
    return embedDone;
};

function embedC(interaction) {
    const username = interaction.user.username;
    const embedCool = new MessageEmbed();
    embedCool.setTitle("Cooldown.")
        .setAuthor({name: username, iconURL: interaction.user.avatarURL({ dynamic: true })})
        .setDescription(`Please wait for the cooldown.`)
        .setColor(color.yellow)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));
    return embedCool;
};

function embedL(interaction) {
    const username = interaction.user.username;
    const embed = new MessageEmbed();
    embed.setTitle("Loading")
        .setAuthor({name: username, iconURL: interaction.user.avatarURL({ dynamic: true })})
        .setDescription(`This embed is for loading.`)
        .setColor(color.peach)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));
    return embed;
};

function embedS(interaction) {
    const username = interaction.user.username;
    const embed = new MessageEmbed();
    embed.setTitle("Success")
        .setAuthor({name: username, iconURL: interaction.user.avatarURL({ dynamic: true })})
        .setDescription(`This embed is for success.`)
        .setColor(color.successgreen)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));
    return embed;
};

async function processMod(interaction, player, pid, embed){
    if (interaction.member.roles.cache.has('959972417923579904')) {
        await database.Player.increment({karma: +20}, {where: {playerID: interaction.user.id}});
        embed.addFields({name: "Mod Bonus", value: `+20 Karma\nThank you for your work!`});
    };
}

async function processSB(interaction, player, pid, embed){
    if (interaction.member.roles.cache.has('951152537598320721')) {
        await database.Player.increment({karma: +50}, {where: {playerID: interaction.user.id}});
        embed.addFields({name: "Server Boost Bonus", value: `+50 Karma\nThanks you for the boost!`});
    };
}

async function processXP(interaction, player, pid) {
    if (player.level > 6) {
        xpLimit = 500;
    } else {
        xpLimit = (2**player.level)*10;
    }
    await database.Player.increment({xp: +10}, {where: {playerID: interaction.user.id}});
    if (player.xp+10 >= xpLimit) {
        //reduce xp to xp - xplimit
        await database.Player.increment({xp: -xpLimit, level: +1, karma: +100}, {where: {playerID: interaction.user.id}});
        const embed = embedLVL(interaction);
        embed.setDescription(`Level ${player.level+1} reached!\nLevel up karma reward +100 Karma\nDaily gem reward increased by 50!`);
        interaction.followUp({embeds:[embed]});
    }
}

async function streakDaily(interaction, player, pid, daily, streak, embedS) {
    if (player.level > 6) {
        xpLimit = 500;
    } else {
        xpLimit = (2**player.level)*10;
    }
    player = await database.Player.findOne({where: {playerID: interaction.user.id}});
    if (streak > 10) {
        const reward = 1000 + 50*player.level;
        await database.Player.increment({gems: +reward}, {where: {playerID: interaction.user.id}});
        embedS.addFields({name: "Daily Rewards", value:`Streak: (bonus capped) ${streak+1}
Gems: ${player.gems+reward} (+${reward})
xp: ${player.xp+10}/${xpLimit} (+10)
Use daily again within two days to continue the streak.`});
    } else if (streak == 0) {
        const reward = 500 + 50*player.level;
        await database.Player.increment({gems: +reward}, {where: {playerID: interaction.user.id}});
        embedS.addFields({name: "Daily Rewards", value:`Streak: (reset) 1
Gems: ${player.gems+reward} (+${reward})
xp: ${player.xp+10}/${xpLimit} (+10)
Use daily again within two days to continue the streak.`});
    } else {
        const reward = 500 + streak*50 + 50*player.level;
        await database.Player.increment({gems: +reward}, {where: {playerID: interaction.user.id}});
        embedS.addFields({name: "Daily Rewards", value:`Streak: ${streak+1}
Gems: ${player.gems+reward} (+${reward})
xp: ${player.xp+10}/${xpLimit} (+10)
Use daily again within two days to continue the streak.`}); 
    }
    await processSB(interaction, player, pid, embedS);
    await processMod(interaction, player, pid, embedS);
    await interaction.editReply({embeds: [embedS]});
    await processXP(interaction, player, pid);
}

async function checkDaily(interaction, embedS, player, pid) {
    const userId = interaction.user.id;
    const daily = await database.Daily.findOne({where: {playerID: userId}})
    const channelLog = interaction.guild.channels.cache.get('1148423605026291833');
    if (daily) {
        const lastDaily = daily.lastDaily;
        const timeNow = Date.now();
        const timeDiff = timeNow - lastDaily;
        if (259200000 > timeDiff && timeDiff>= 79200000) {
            console.log("Perfect Daily")
            await streakDaily(interaction, player, pid, daily, daily.streak, embedS);
            await database.Daily.update({lastDaily: timeNow}, {where: {playerID: userId}});
            await database.Daily.increment({streak: 1}, {where: {playerID: userId}});
            player = await database.Player.findOne({where: {playerID: userId}});
            await channelLog.send(`${interaction.user} Daily log
Gems: ${player.gems}
Karma: ${player.karma}
Collects: ${player.kpity}`);
            await player.update({kpity: 0});

        } else if (timeDiff>= 79200000) {
            await streakDaily(interaction, player, pid, daily, 0, embedS);
            await database.Daily.update({lastDaily: timeNow, streak: 1}, {where: {playerID: userId}});
            player = await database.Player.findOne({where: {playerID: userId}});
            channelLog.send(`${interaction.user} Daily log
Gems: ${player.gems}
Karma: ${player.karma}
Collects: ${player.kpity}`);
            await player.update({kpity: 0});
        }
    }
}


async function maxCollect(interaction, player, pid, embedS) {
    player = await database.Player.findOne({where: {playerID: interaction.user.id}});
    await database.Player.increment({gems: +1000, kpity: 1}, {where: {playerID: interaction.user.id}});
    embedS.addFields({name: "Gems Collected!", 
        value: `Gems Collected: (+1000) ${player.gems+1000}`});
}

async function normalCollect(interaction, player, playerIndex, amount, embedS) {
    let bonus = 100;
    player = await database.Player.findOne({where: {playerID: interaction.user.id}});
    await database.Player.increment({gems: +(amount+bonus), kpity: 1}, {where: {playerID: interaction.user.id}});
    embedS.addFields({name: "Gems Collected!", 
        value: `Gems Collected: (+${amount + bonus}) ${player.gems+amount+bonus}`});
}

async function checkCollect(interaction, embedS, player, playerIndex) {
    player = await database.Player.findOne({where: {playerID: interaction.user.id}});
    await checkDaily(interaction, embedS, player, playerIndex)
    const userId = interaction.user.id;
    const collect = await database.Collect.findOne({where: {playerID: userId}});
    if (collect) {
        const lastCheck = collect.lastcollect;
        const timeNow = Date.now();
        const timeDiff = timeNow - lastCheck;
        const timeLeft = (timeDiff%480000);
        if (28800000 > timeDiff && timeDiff >= 480000) {
            const amount = 15 * Math.floor(timeDiff/480000);
            
            await database.Collect.update({lastcollect: timeNow-timeLeft}, {where: {playerID: userId}});
            await normalCollect(interaction, player, playerIndex, amount, embedS);
        } else if (timeDiff >= 480000){
            await database.Collect.update({lastcollect: timeNow}, {where: {playerID: userId}});
            await maxCollect(interaction, player, playerIndex, embedS);
        }
        if (collect.alert > 0) {
            setTimeout(() => interaction.followUp(`${interaction.user} collect alert!`), collect.alert*1000);
        }
    }
}



async function createButton(interaction){
    try {
        const row = new MessageActionRow()
            .addComponents(
                // new MessageButton()
                //     .setCustomId('daily')
                //     .setLabel('daily')
                //     .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('collect')
                    .setLabel('collect')
                    .setStyle('PRIMARY'),
        );
        // if (await dailyCds(interaction) == false) {
        //     row.components[0].setDisabled(true);
        // }
        if (await collectCds(interaction) == false && await dailyCds(interaction) == false) {
            row.components[0].setDisabled(true);
        }
        return row;
    } catch(error) {
        console.log("error has occured in createButton");
    }
}

async function dailyCds(interaction){
    try {
        const userId = interaction.user.id;
        const daily = await database.Daily.findOne({where : { playerID: userId}});
        if (daily) {
            const lastCheck = daily.lastDaily;
            const timeNow = Date.now();
            const timeDiff = timeNow - lastCheck;
            if (timeDiff >= 79200000) {
                return true;
                //perfect
            } else {
                return false;
            }
        }
    } catch (error) {
        console.log(`${error} in daily cds`);
    }
}

async function collectCds(interaction){
    try {
        const userId = interaction.user.id;
        const collect = await database.Collect.findOne({where : { playerID: userId}});
        if (collect) {
            const lastCheck = collect.lastcollect;
            const timeNow = Date.now();
            const timeDiff = timeNow - lastCheck;
            if (timeDiff >= 480000) {
                return true;
            } else {
                return false;
            }
        }
    } catch (error) {
        console.log(`${error} in daily cds`);
    }
}


async function buttonManager(interaction, msg, embedS, player, playerIndex) {
    player = await database.Player.findOne({where: {playerID: interaction.user.id}});
    try {
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            switch (i.customId) {
                // case 'daily':
                //     i.deferUpdate()
                //     await checkDaily(interaction, embedS, player, playerIndex)
                //     await viewCds(interaction, embedS, interaction.user.id, player, playerIndex);
                //     break;

                case 'collect':
                    i.deferUpdate()
                    await checkCollect(interaction, embedS, player, playerIndex);
                    await viewCds(interaction, embedS, interaction.user.id, player, playerIndex);
                    break;

                default:
                    const row = createButton(interaction);
                    row.components[0].setDisabled(true);
                    // row.components[1].setDisabled(true);
                    interaction.editReply({components: [row]});
                    break;
            }
        });
    } catch(error) {
        console.log(`Error ${error} occured with buttonManager.`);
    }
}

async function textDaily(daily) {
    try {
        if (daily) {
            //check if daily is ready.
            const lastDaily = daily.lastDaily;
            const timeNow = Date.now();
            const timeDiff = timeNow - lastDaily;
            if (timeDiff >= 79200000) {
                return 'Ready!';
                //perfect
            } else if (timeDiff <= 79200000) {
                const timeLeft = 79200000 - timeDiff;
                const remain = dayjs.duration(timeLeft).format('HH[hr : ]mm[m : ]ss[s]');
                //on cooldown
                return `Ready in ${remain}.`;
            }
        } else {
            return "Unavailable, please use /daily before using /cds."
        }
    } catch (error) {
        console.log(error);
    }
}

async function textCollect(collect) {
    if (collect) {
        //check if daily is ready.
        console.log(collect);
        const lastCheck = collect.lastcollect;
        console.log(lastCheck);
        const timeNow = Date.now();
        console.log(timeNow);
        const timeDiff = timeNow - lastCheck;
        const timefull = 22800000 - timeDiff;
        console.log(timeDiff);
        const fulltime = dayjs.duration(timefull).format('HH[hr : ]mm[m : ]ss[s]');
        if (22800000 > timeDiff && timeDiff >= 480000) {
            //some collected show cooldown.
            const amount = 15 * Math.floor(timeDiff/480000);
            let bonus = 100
            const cooltime = (timeDiff%480000);
            const timeLeft = 480000 - cooltime;
            const remain = dayjs.duration(timeLeft).format('mm[m : ]ss[s]');
            return `(${amount+bonus}/1000) gems collected. 
${remain} until next 15 gems.
${fulltime} until collect is capped.`;
        } else if (timeDiff < 480000) {
            const timeLeft = 480000 - timeDiff;
            const remain = dayjs.duration(timeLeft).format('mm[m : ]ss[s]');
            return `(0/1000) gems collected. 
${remain} until next 15 gems.
${fulltime} until collect is capped.`;
            //none collected show cooldown
        } else {
            return `(1000/1000) gems collected. 
At maximum capacity.`;
            //capped out
        }
    } else {
        return "Unavailable, please use /collect before using /cds."
    }
}

async function checkIsvote(voteTrack) {
    if (voteTrack) {
        const isvoted = voteTrack.imageVote;
        const swapImage = await database.Swapimage.count({where: {imageID: {[Op.gt]: isvoted}}});
        return swapImage;
    } else {
        return 0;
    }
}

async function checkCvote(voteTrack) {
    const ccount = await database.Character.count();
    if (voteTrack) {
        return `${voteTrack.charVote-1}/${ccount} characters.`;
    } else {
        return "Please use command /cvote";
    }
}

async function viewCds1(interaction, uid) {
    const player = await database.Player.findOne({where: {playerID: uid}})
    const daily = await database.Daily.findOne({where: {playerID: uid}})
    const collect = await database.Collect.findOne({where: {playerID: uid}})
    const voteTrack = await database.Votetrack.findOne({where: {playerID: uid}})
    console.log("1");
    if (player.level > 6) {
        xpLimit = 500;
    } else {
        xpLimit = (2**player.level)*10;
    }
    const dailyText = await textDaily(daily);
    const collectText = await textCollect(collect);
    const cvote = await checkCvote(voteTrack);
    const isvote = await checkIsvote(voteTrack);
    const embed = embedS(interaction);
    console.log("2");
    embed.setTitle('Cooldowns').setDescription(`**Stats**
**Level:** ${player.level} (${player.xp}/${xpLimit})
**Gems:** ${player.gems} <:waifugem:1182852147197526087>
**Money:** ${player.money} <:datacoin:947388797828612127>
**Karma:** ${player.karma} <:karma:947388797627281409>


**Cooldowns**
**Daily:** ${dailyText}

**Collect:** ${collectText}

**Character Votes:** ${cvote}

**Image Swap Vote:** ${isvote} swaps.
    `).setFooter({text: "use /cvote to do character votes and /isvote for image swap votes."})
    //daily, collect, cvote, isvote.
    const row = await createButton(interaction);
    console.log("3");
    msg = await interaction.reply({embeds: [embed], components: [row], fetchReply: true});
    await buttonManager(interaction, msg, embed, player, player.playerID);
}

async function viewCds(interaction, embed, uid, player, playerIndex) {
    player = await database.Player.findOne({where: {playerID: interaction.user.id}});
    const daily = await database.Daily.findOne({where: {playerID: uid}})
    const collect = await database.Collect.findOne({where: {playerID: uid}})
    const vTrack = await database.Votetrack.findOne({where: {playerID: uid}})
    console.log("1");
    let xpLimit;
    if (player.level > 6) {
        xpLimit = 500;
    } else {
        xpLimit = (2**player.level)*10;
    }
    const dailyText = await textDaily(daily);
    const collectText = await textCollect(collect);
    const cvote = await checkCvote(vTrack);
    const isvote = await checkIsvote(vTrack);
    console.log("2");
    embed.setTitle('Cooldowns').setDescription(`**Stats**
**Level:** ${player.level} (${player.xp}/${xpLimit})
**Gems:** ${player.gems} <:waifugem:1182852147197526087>
**Money:** ${player.money} <:datacoin:947388797828612127>
**Karma:** ${player.karma} <:karma:947388797627281409>


**Cooldowns**

**Daily:** ${dailyText}

**Collect:** ${collectText}

**Character Votes:** ${cvote}

**Image Swap Vote:** ${isvote} swaps.
    `).setFooter({text: "use /cvote to do character votes and /isvote for image swap votes."})
    //daily, collect, cvote, isvote.
    const row = await createButton(interaction);
    console.log("3.3333");
    msg = await interaction.editReply({embeds: [embed], components: [row], fetchReply: true});
    await buttonManager(interaction, msg, embed, player, playerIndex);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cds')
        .setDescription('Check your cooldowns'),
    async execute(interaction) {
        try {
            const uid = interaction.user.id;
            console.log(uid);
            const user = await database.Player.findOne({where: {playerID: uid}});
            if (user) {
                await viewCds1(interaction, uid);
            } else {
                const embedE = new MessageEmbed();
                embedE.setTitle("User not found!")
                        .setDescription("You aren't a registered player yet!, use /isekai to begin!")
                        .setColor(color.red)
                return interaction.reply({embeds:[embedE]});
            }
        } catch(error) {
            await  interaction.reply(`${error} Error occured.`);
        }        
    }
}