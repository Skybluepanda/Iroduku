const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
var dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()
dayjs.extend(duration)

async function createButton(interaction){
    try {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('daily')
                .setLabel('daily')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('collect')
                .setLabel('collect')
                .setStyle('PRIMARY'),
            // new MessageButton()
            //     .setCustomId('vote')
            //     .setLabel('vote')
            //     .setStyle('PRIMARY'),
        );
        if (await dailyCds(interaction) == false) {
            row.components[0].setDisabled(true);
        }
        if (await collectCds(interaction) == false) {
            row.components[1].setDisabled(true);
        }
        // if (await voteCds(interaction) == false) {
        //     row.components[2].setDisabled(true);
        // }
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function buttonManager(interaction, msg) {
    try {
        const userId = await interaction.user.id;
        const player = await database.Player.findOne({ where: { playerID: userId } })
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'daily':
                    await claimDaily(interaction, player)
                    await viewCds2(interaction);
                    break;

                case 'collect':
                    await checkTime(interaction, player);
                    await viewCds2(interaction);
                    break;
                // case 'vote':
                //     const embed = embedV(interaction);
                //     await interaction.followUp({embeds: [embed]});
                //     await viewCds2(interaction);
                //     break;
            }
        });
    } catch(error) {
        console.log(`Error ${error} occured with buttonManager.`);
    }
}

function embedD(interaction) {
    const username = interaction.user.username;
    const embedDone = new MessageEmbed();
    embedDone.setTitle("Daily claimed!")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setColor(color.successgreen)
    return embedDone;
};

async function claimDaily(interaction, player){
    const userId = interaction.user.id;
    const daily = await database.Daily.findOne({where : { playerID: userId}});
    if (daily) {
        const lastCheck = daily.lastDaily;
        const timeNow = Date.now();
        const timeDiff = await timeNow - lastCheck;
        if (259200000 > timeDiff && timeDiff>= 79200000) {
            console.log("Perfect daily")
            await database.Player.increment({xp: 10}, {where: {playerID: userId}});
            await streakDaily(interaction, player, daily);
            await database.Daily.update({lastDaily: timeNow}, {where: {playerID: userId}});
            await database.Daily.increment({streak: 1}, {where: {playerID: userId}});
        } else if (timeDiff <= 79200000) {
            await cooldownDaily(interaction, timeDiff);
        } else {
            await database.Player.increment({xp: 10}, {where: {playerID: userId}});
            await resetDaily(interaction, player, daily);
            await database.Daily.update({lastDaily: timeNow, streak: 1}, {where: {playerID: userId}});
        }
    } else {
        await database.Player.update({level: 1}, {where: {playerID: userId}});
        newDaily(interaction, player);
    }
}

async function newDaily(interaction, player){
    const embedDone = await embedD(interaction);
    const userId = interaction.user.id;
    const timeNow = Date.now();
    await checkSeverB(interaction);
    await checkSeverM(interaction);
    await database.Daily.create({
        playerID: userId,
        lastDaily: timeNow,
        streak: 1,
        
    });
    await player.increment('gems', {by: 1000});
    await player.increment('karma', {by: 100});
    await embedDone.setDescription(`
    Streak: 1\nGems: (first time bonus!) ${player.gems+1000} (+1000)\nUse daily again within two days to continue the streak.\nxp: 10/10 (+10) level up!
Level up reward: +100 karma`);
    return interaction.followUp({ embeds: [embedDone] }, {ephemeral: true});
}

async function streakDaily(interaction, player, daily){
    const embedDone = await embedD(interaction);
    const streak = daily.streak;
    let xpLimit
    await checkSeverB(interaction);
    await checkSeverM(interaction);
    await checkKarma(interaction, daily);
    await checkLevelup(interaction);
    if (player.level > 6) {
        xpLimit = 500;
    } else {
        xpLimit = (2**player.level)*10;
    }
    if (streak > 10) {
        const reward = 1000 + 100*player.level;
        await player.increment('gems', {by: reward});
        await player.increment('karma', {by: 30});
        await embedDone.setDescription(`
    Streak: (max) ${streak+1}\nGems: ${player.gems+reward} (+${reward})\nKarma: ${player.karma+30} (+30)\nxp: ${player.xp+10}/${xpLimit} (+10)\nUse daily again within two days to continue the streak.`);
        return interaction.followUp({ embeds: [embedDone] }, {ephemeral: true});
    } else {
        const reward = 500 + streak*50 + 100*player.level;
        await player.increment('gems', {by: reward});
        await player.increment('karma', {by: 30});
        await embedDone.setDescription(`
    Streak: ${streak+1}\nGems: ${player.gems+reward} (+${reward})\nKarma: ${player.karma+30} (+30)\nxp: ${player.xp+10}/${xpLimit} (+10)\nUse daily again within two days to continue the streak.`);
        return interaction.followUp({ embeds: [embedDone] }, {ephemeral: true});
    }
}

async function checkKarma(interaction, daily) {
    const embed = embedD(interaction);
    if (daily.dailykarma > 0) {
        await database.Player.increment({Karma: 100}, {where: {playerID: interaction.user.id}});
        await daily.increment({dailyKarma: -1});
        embed.setTitle("Coffee daily bonus")
            .setDescription(`Daily bonus for supporting the bot! <:amepainsip:954898370177146931> +100 karma (${daily.dailykarma-1} bonuses left)`);
        await interaction.followUp({ embeds: [embed] }, {ephemeral: true});
    };
}

async function checkSeverB(interaction) {
    const embed = embedD(interaction);
    if (interaction.member.roles.cache.has('951152537598320721')) {
        await database.Player.increment({Karma: 50}, {where: {playerID: interaction.user.id}});
        embed.setTitle("Server boost bonus")
            .setDescription(`Daily bonus for boosting server. +50 karma`);
        await interaction.followUp({ embeds: [embed] }, {ephemeral: true});
    };
}

async function checkSeverM(interaction) {
    const embed = embedD(interaction);
    if (interaction.member.roles.cache.has('908920472295604224')) {
        await database.Player.increment({Karma: 20}, {where: {playerID: interaction.user.id}});
        embed.setTitle("Mod wage")
            .setDescription(`For doing mod things. +20 karma`);
        await interaction.followUp({ embeds: [embed] }, {ephemeral: true});
    };
}

async function checkLevelup(interaction) {
    const player = await database.Player.findOne({ where: { playerID: interaction.user.id } })
    const embed = await embedLvl(interaction, player);
    let xpLimit;
    if (player.level > 6) {
        xpLimit = 500;
    } else {
        xpLimit = (2**player.level)*10;
    }
    if (player.xp >= xpLimit) {
        await database.Player.increment({Karma: (player.level*100), xp: -xpLimit, level: 1}, {where: {playerID: interaction.user.id}});
        await interaction.followUp({ embeds: [embed] });
    };
}

async function resetDaily(interaction, player, daily){
    const embedDone = await embedD(interaction);
    await player.increment('gems', {by: 500});
    await player.increment('karma', {by: 30});
    let xpLimit;
    if (player.level > 6) {
        xpLimit = 500;
    } else {
        xpLimit = (2**player.level)*10;
    }
    await checkSeverB(interaction);
    await checkSeverM(interaction);
    await checkKarma(interaction, daily);
    await checkLevelup(interaction);
    await embedDone.setDescription(`
Streak: (reset) 1\nGems: ${player.gems+500} (+500)\nKarma: ${player.karma+30} (+30)\nxp: ${player.xp+10}/${xpLimit} (+10)\nUse daily again within two days to continue the streak.`);
    return interaction.followUp({ embeds: [embedDone] }, {ephemeral: true});
}

function embedDL(interaction) {
    const username = interaction.user.username;
    const embedCool = new MessageEmbed();
    embedCool.setTitle("Daily on cooldown.")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please wait for the cooldown.`)
            .setColor(color.failred)
    return embedCool;
};

async function cooldownDaily(interaction, timeDiff){
    const embedCool = embedDL(interaction);
    const timeLeft = 79200000 - timeDiff;
    const remain = dayjs.duration(timeLeft).format('HH[hr: ]mm[m : ]ss[s]');
    await embedCool.setDescription(`Please wait for the cooldown.\nTime Remaining: ${remain}`);
    await interaction.followUp({ embeds: [embedCool] }, {ephemeral: true});
}






function embedG(interaction) {
    const username = interaction.user.username;
    const embedDone = new MessageEmbed();
    embedDone.setTitle("Collected gems!")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setColor(color.successgreen)
    return embedDone;
};


async function checkTime(interaction, player){
    const userId = interaction.user.id;
    const collect = await database.Collect.findOne({where : { playerID: userId}});
    if (collect) {
        const lastCheck = collect.lastcollect;
        const timeNow = Date.now();
        const timeDiff = await timeNow - lastCheck;
        if (57600000 > timeDiff && timeDiff >= 480000) {
            const amount = 5 * Math.floor(timeDiff/480000);
            const timeLeft = (timeDiff%480000);
            await normalCollect(interaction, player, amount);
            await database.Collect.update({lastcollect: timeNow-timeLeft}, {where: {playerID: userId}});
        } else if (timeDiff <= 480000) {
            await noCollect(interaction, timeDiff);
        } else {
            await maxCollect(interaction, player);
            await database.Collect.update({lastcollect: timeNow}, {where: {playerID: userId}});
        }
    } else {
        newCollect(interaction, player);
    }
}

async function newCollect(interaction, player){
    const embedDone = await embedG(interaction);
    const userId = interaction.user.id;
    const timeNow = Date.now();
    await database.Collect.create({
        playerID: userId,
        lastcollect: timeNow,
        
    });
    await player.increment('gems', {by: 900});
    await embedDone.setDescription(`
    Collect is a command that you grants you 5 gems per 8 minutes
    Collection will cap at 16hrs for total of 650 gems per 16hr cycle.
    Collecting after more than 16hr have past will grant 650 gems.
    Gems produced are tripled for the first 40 minutes after collect.
    Gems: (Start collecting bonus +900 gems!) ${player.gems+900}`);
    return interaction.followUp({ embeds: [embedDone] }, {ephemeral: true});
}

async function normalCollect(interaction, player, amount){
    let bonus
    if (amount >= 25) {
        bonus = 50;
    } else {
        bonus = amount*2
    }
    const embedDone = await embedG(interaction);
    await player.increment('gems', {by: amount + bonus});
    await embedDone.setDescription(`
Gems Collected: (${amount + bonus}) ${player.gems+amount+bonus}
Gems produced are tripled for the first 40 minutes after collect.`);
    return interaction.followUp({ embeds: [embedDone] }, {ephemeral: true});
}

async function maxCollect(interaction, player){
    const embedDone = await embedG(interaction);
    await player.increment('gems', {by: 650});
    await embedDone.setDescription(`
Gems Collected: (Capped! +650) ${player.gems+650}
Gems produced are tripled for the first 40 minutes after collect.`);
    return interaction.followUp({ embeds: [embedDone] }, {ephemeral: true});
}

async function noCollect(interaction, timeDiff){
    const embedCool = embedL(interaction);
    const timeLeft = 480000 - timeDiff;
    const remain = dayjs.duration(timeLeft).format('mm[m : ]ss[s]');
    await embedCool.setDescription(`Please wait for the cooldown.\nTime Remaining: ${remain}`);
    await interaction.followUp({ embeds: [embedCool] }, {ephemeral: true});
}

function embedL(interaction) {
    const username = interaction.user.username;
    const embedCool = new MessageEmbed();
    embedCool.setTitle("Collection too soon.")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please wait for the cooldown.`)
            .setColor(color.failred)
    return embedCool;
};

async function embedLvl(interaction) {
    const username = interaction.user.username;
    const player = await database.Player.findOne({ where: { playerID: interaction.user.id } });
    const embedL = await new MessageEmbed();
    await embedL.setTitle("Level Up!")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Level ${player.level+1} reached!\nLevel up karma reward +${(player.level+1)*100} Karma\nDaily gem reward increased by 100!`)
            .setColor(color.stellar);
    return await embedL;
}

function embedV(interaction) {
    const username = interaction.user.username;
    const embed = new MessageEmbed();
    embed.setTitle("Vote Info")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Vote at https://top.gg/servers/907981387699740693/vote
Reward of 5 karma will be automatically added to your account when you vote.`)
            .setColor(color.purple)
    return embed;
};










async function viewCds2(interaction) {
    const username = interaction.user.username;
        const userId = interaction.user.id;
        const embedDone = new MessageEmbed();

        embedDone.setTitle(`${username}'s Stats`)
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setColor(color.successgreen)
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        try {
            console.log("1")
            const player = await database.Player.findOne({where: {playerID: userId}});
            const daily = await database.Daily.findOne({where: {playerID: userId}});
            const collect = await database.Collect.findOne({where: {playerID: userId}});
            const votetrack = await database.Votetrack.findOne({where: {playerID: userId}});
            const ccount = await database.Character.count();
            const cvount = await database.Cvotetrack.count();
            console.log("2")
            await checkDaily1(interaction);
            await checkCollect1(interaction);
            console.log("3")
            if (player && daily && collect && votetrack) {
                console.log("1")
                const dailyText = await checkDaily(interaction);
                const collectText = await checkCollect(interaction);
                const voteText = await checkVote(interaction);
                console.log("2")
                const isvote = await checkIsvote(interaction);
                console.log("3")
                embedDone.setDescription(`
**Daily:** ${dailyText}

**Collect:** ${collectText}

**Cvote:** ${votetrack.charVote-1}/${ccount} characters
**Isvote:** ${isvote} swaps
`);
                console.log("4")
                              
            } else {
                embedDone.setDescription(`To enable cds, you must be a player, try /isekai\nThen do /daily, /collect and /cvote`)
                        .setColor(color.failred);
                return await interaction.followUp({ embeds: [embedDone]});
            }
            const row = await createButton(interaction);  
            msg = await interaction.followUp({ embeds: [embedDone],components: [row], fetchReply: true });
            await buttonManager(interaction, msg);
        } catch (error) {
            return interaction.followUp({ embeds: [embedError] });
        }
}

async function viewCds(interaction) {
    const username = interaction.user.username;
    const userId = interaction.user.id;
    
    const embed = new MessageEmbed();
    const embedDone = new MessageEmbed();
    const embedError = new MessageEmbed();

    embed.setTitle("Checking Stats")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Checking for ${username}'s account.`)
        .setColor(color.purple)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
    embedDone.setTitle(`${username}'s Stats`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setColor(color.successgreen)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

    embedError.setTitle("Unknown Error")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Please report the error if it persists.`)
        .setColor(color.failred)
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
    try {
        console.log("1")
        const player = await database.Player.findOne({where: {playerID: userId}});
        const daily = await database.Daily.findOne({where: {playerID: userId}});
        const collect = await database.Collect.findOne({where: {playerID: userId}});
        const votetrack = await database.Votetrack.findOne({where: {playerID: userId}});
        const ccount = await database.Character.count();
        const cvount = await database.Cvotetrack.count();
        console.log("2")
        // await checkDaily1(interaction);
        // await checkCollect1(interaction);
        console.log("3")
        if (player && daily && collect && votetrack) {
            console.log("1")
            const dailyText = await checkDaily(interaction);
            const collectText = await checkCollect(interaction);
            const voteText = await checkVote(interaction);
            console.log("2")
            const isvote = await checkIsvote(interaction);
            console.log("3")
            embedDone.setDescription(`
**Daily:** ${dailyText}

**Collect:** ${collectText}

**Cvote:** ${votetrack.charVote-1}/${ccount} characters
**Isvote:** ${isvote} swaps
`);
                console.log("4")
                               
            } else {
                embedDone.setDescription(`To enable cds, you must be a player, try /isekai\nThen do /daily, /collect and /cvote`)
                        .setColor(color.failred);
                return await interaction.reply({embeds: [embedDone]});
            }
            const row = await createButton(interaction);
            msg = await interaction.reply({ embeds: [embedDone],components: [row], fetchReply: true });
            await buttonManager(interaction, msg);
    } catch (error) {
        return interaction.reply(`${error} error`);
    }
}



async function checkDaily1(interaction) {
    const daily = await database.Daily.findOne({where: {playerID: interaction.user.id}});
    if (!daily) {
        await interaction.followUp('Do /daily first!')
    }
    return;
}

async function checkCollect1(interaction) {
    const collect = await database.Collect.findOne({where: {playerID: interaction.user.id}});
    if (!collect) {
        await interaction.followUp('Do /collect first!')
    }
    return;
}

async function checkDaily(interaction){
    const userId = interaction.user.id;
    const daily = await database.Daily.findOne({where : { playerID: userId}});
    if (daily) {
        const lastCheck = daily.lastDaily;
        const timeNow = Date.now();
        const timeDiff = await timeNow - lastCheck;
        if (timeDiff >= 79200000) {
            return 'Ready!';
            //perfect
        } else if (timeDiff <= 79200000) {
            const timeLeft = 79200000 - timeDiff;
            const remain = dayjs.duration(timeLeft).format('HH[hr : ]mm[m : ]ss[s]');
            //on cooldown
            return `Cooldown for ${remain}`;
        }
    }
}

async function dailyCds(interaction){
    const userId = interaction.user.id;
    const daily = await database.Daily.findOne({where : { playerID: userId}});
    if (daily) {
        const lastCheck = daily.lastDaily;
        const timeNow = Date.now();
        const timeDiff = await timeNow - lastCheck;
        if (timeDiff >= 79200000) {
            return true;
            //perfect
        } else {
            return false;
        }
    }
}

async function checkCollect(interaction){
    const userId = interaction.user.id;
    const collect = await database.Collect.findOne({where : { playerID: userId}});
    if (collect) {
        const lastCheck = collect.lastcollect;
        const timeNow = Date.now();
        const timeDiff = await timeNow - lastCheck;
        const timefull = 57600000 - timeDiff;
        const fulltime = dayjs.duration(timefull).format('HH[hr : ]mm[m : ]ss[s]');
        if (57600000 > timeDiff && timeDiff >= 480000) {
            //some collected show cooldown.
            const amount = 5 * Math.floor(timeDiff/480000);
            let bonus;
            if (amount >= 25) {
                bonus = 50;
            } else {
                bonus = amount * 2
            }
            const cooltime = (timeDiff%480000);
            const timeLeft = 480000 - cooltime;
            const remain = dayjs.duration(timeLeft).format('mm[m : ]ss[s]');
            return `(${amount+bonus}/650) gems collected. 
${remain} until next 5 gems.
${fulltime} until collect is capped`;
        } else if (timeDiff < 480000) {
            const timeLeft = 480000 - timeDiff;
            const remain = dayjs.duration(timeLeft).format('mm[m : ]ss[s]');
            return `(0/650) gems collected. 
${remain} until next 5 gems.
${fulltime} until collect is capped`;
            //none collected show cooldown
        } else {
            return `(650/650) gems collected. 
At maximum capacity and collection paused.`;
            //capped out
        }
    }
}

async function collectCds(interaction){
    const userId = interaction.user.id;
    const collect = await database.Collect.findOne({where : { playerID: userId}});
    if (collect) {
        const lastCheck = collect.lastcollect;
        const timeNow = Date.now();
        const timeDiff = await timeNow - lastCheck;
        if (timeDiff >= 480000) {
            return true;
        } else {
            return false;
        }
    }
}

async function checkIsvote(interaciton) {
    console.log("10")
    const votetrack = await database.Votetrack.findOne({where: {playerID: interaciton.user.id}});
    console.log(votetrack.imageVote)
    const isvote = await database.Swapimage.count({where: {imageID: {[Op.gte]: votetrack.imageVote}}});
    console.log(isvote);
    if (isvote) {
        return isvote;
    } else {
        return 0;
    }
}


async function voteCds(interaction){
    const userId = interaction.user.id;
    const collect = await database.Collect.findOne({where : { playerID: userId}});
    if (collect) {
        const lastCheck = collect.lastvote;
        const timeNow = Date.now();
        const timeDiff = await timeNow - lastCheck;
        const timefull = 43200000 - timeDiff;
        if (timeDiff >= 43200000 || lastCheck == null) {
            //some collected show cooldown.
            return true;
        } else {
            return false;
            //none collected show cooldown
        }
    }
}

async function checkVote(interaction){
    const userId = interaction.user.id;
    const collect = await database.Collect.findOne({where : { playerID: userId}});
    if (collect) {
        const lastCheck = collect.lastvote;
        const timeNow = Date.now();
        const timeDiff = await timeNow - lastCheck;
        const timefull = 43200000 - timeDiff;
        if (timeDiff >= 43200000 || lastCheck == null) {
            //some collected show cooldown.
            return `Ready (5/5 Karma)`;
        } else {
            const timeLeft = 43200000 - timeDiff;
            const remain = dayjs.duration(timeLeft).format('HH[hr : ]mm[m : ]ss[s]');
            return `Cooldown for ${remain}`;
            //none collected show cooldown
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cds')
        .setDescription('Check your cooldowns'),
    async execute(interaction) {
        try {
            await viewCds(interaction);
        } catch(error) {
            await  interaction.reply(`${error} Error occured.`);
        }        
    }
}