const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
// const { dayjs } = require('dayjs');
const color = require('../../color.json');
var dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()
dayjs.extend(duration)


function embedC(interaction) {
    const username = interaction.user.username;
    const embed = new MessageEmbed();
    embed.setTitle("In Maintenance. User /cds for now")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Maintenance.`)
            .setColor(color.purple)
    return embed;
};

function embedD(interaction) {
    const username = interaction.user.username;
    const embedDone = new MessageEmbed();
    embedDone.setTitle("G'Day mate!")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setColor(color.successgreen)
    return embedDone;
};

function embedL(interaction) {
    const username = interaction.user.username;
    const embedCool = new MessageEmbed();
    embedCool.setTitle("Yeah nah, not yet mate.")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please wait for the cooldown.`)
            .setColor(color.failred)
    return embedCool;
};

function embedE(interaction) {
    const username = interaction.user.username;
    const embedError = new MessageEmbed();
    embedError.setTitle("Unknown Error")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please report the error if it persists.`)
            .setColor(color.failred)
    return embedError;
}

async function embedLvl(interaction) {
    const player = await database.Player.findOne({ where: { playerID: interaction.user.id } });
    const username = interaction.user.username;
    const embedL = new MessageEmbed();
    await embedL.setTitle("Level Up!")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Level ${player.level+1} reached!\nLevel up karma reward +${(player.level+1)*100} Karma\nDaily gem reward increased by 100!`)
            .setColor(color.stellar);
    return await embedL;
}

async function checkDaily(interaction, player){
    const userId = interaction.user.id;
    const daily = await database.Daily.findOne({where : { playerID: userId}});
    console.log(3);
    if (daily) {
        const lastCheck = daily.lastDaily;
        const timeNow = Date.now();
        const timeDiff = await timeNow - lastCheck;
        console.log(4);
        if (259200000 > timeDiff && timeDiff>= 79200000) {
            console.log("Perfect daily")
            await database.Player.increment({xp: 10}, {where: {playerID: userId}});
            await streakDaily(interaction, player, daily);
            await database.Daily.update({lastDaily: timeNow}, {where: {playerID: userId}});
            await database.Daily.increment({streak: 1}, {where: {playerID: userId}});
        } else if (timeDiff <= 79200000){
            console.log(5);
            await cooldownDaily(interaction, timeDiff);
        } else {
            console.log(6);
            await resetDaily(interaction, player, daily);
            await database.Player.increment({xp: 10}, {where: {playerID: userId}});
            await database.Daily.update({lastDaily: timeNow, streak: 1}, {where: {playerID: userId}});
        }
        //handle levelup!
    } else {
        console.log(7);
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
    console.log(7.1);
    await player.increment('gems', {by: 1000});
    await player.increment('karma', {by: 100});
    await embedDone.setDescription(`
    Streak: 1\nGems: (first time bonus!) ${player.gems+1000} (+1000)\nUse daily again within two days to continue the streak.\nxp: 10/10 (+10) level up!
Level up reward: +100 karma`);

    return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
}

async function streakDaily(interaction, player, daily){
    const embedDone = await embedD(interaction);
    const streak = daily.streak;
    console.log(4.1);
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
    console.log(4.2);
    if (streak > 10) {
        const reward = 1000 + 100*player.level;
        await player.increment('gems', {by: reward});
        await player.increment('karma', {by: 30});
        await embedDone.setDescription(`
    Streak: (max) ${streak+1}\nGems: ${player.gems+reward} (+${reward})\nKarma: ${player.karma+30} (+30)\nxp: ${player.xp+10}/${xpLimit} (+10)\nUse daily again within two days to continue the streak.`);
    } else {
        const reward = 500 + streak*50 + 100*player.level;
        await player.increment('gems', {by: reward});
        await player.increment('karma', {by: 30});
        await embedDone.setDescription(`
    Streak: ${streak+1}\nGems: ${player.gems+reward} (+${reward})\nKarma: ${player.karma+30} (+30)\nxp: ${player.xp+10}/${xpLimit} (+10)\nUse daily again within two days to continue the streak.`); 
    }
    return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
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
        await database.Player.increment({Karma: (player.level+1)*100, xp: -xpLimit, level: 1}, {where: {playerID: interaction.user.id}});
        await interaction.followUp({ embeds: [embed] }, {ephemeral: true});
    };
}

async function checkSeverM(interaction) {
    const embed = embedD(interaction);
    if (interaction.member.roles.cache.has('959972417923579904')) {
        await database.Player.increment({Karma: 20}, {where: {playerID: interaction.user.id}});
        embed.setTitle("Mod wage")
            .setDescription(`For doing mod things. +20 karma`);
        await interaction.followUp({ embeds: [embed] }, {ephemeral: true});
    };
}

async function resetDaily(interaction, player, daily){
    console.log(6.1);
    const embedDone = await embedD(interaction);
    const reward = 500 + player.level * 100;
    await player.increment('gems', {by: reward});
    await player.increment('karma', {by: 30});
    await checkSeverB(interaction);
    await checkSeverM(interaction);
    await checkKarma(interaction, daily);
    await checkLevelup(interaction);
    let xpLimit;
    if (player.level > 6) {
        xpLimit = 500;
    } else {
        xpLimit = (2**player.level)*10;
    }
    console.log(6.2);
    await embedDone.setDescription(`
Streak: (reset) 1\nGems: ${player.gems+reward} (+reward)\nKarma: ${player.karma+30} (+30)\nxp: ${player.xp+10}/${xpLimit} (+10)\nUse daily again within two days to continue the streak.`);
    return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
}

async function cooldownDaily(interaction, timeDiff){
    console.log(5.1);
    const embedCool = embedL(interaction);
    const timeLeft = 79200000 - timeDiff;
    const remain = dayjs.duration(timeLeft).format('HH[hr: ]mm[m : ]ss[s]');
    console.log(5.2);
    await embedCool.setDescription(`Please wait for the cooldown.\nTime Remaining: ${remain}`);
    await interaction.editReply({ embeds: [embedCool] }, {ephemeral: true});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('adds gem to your profile, can be used once a day.'),
    async execute(interaction) {
        console.log(1);
        const embed = embedC(interaction);
        const embedError = embedE(interaction);
        return interaction.reply({ embeds: [embed] }, {ephemeral: true});
        try {
            const userId = await interaction.user.id;
            const player = await database.Player.findOne({ where: { playerID: userId } })
            console.log(2);
            if (player) {
                checkDaily(interaction, player);
            } else {
                embedError.setDescription('You must first create an account using /isekai.')
            }
        } catch (error) {
            return interaction.editReply({ embeds: [embedError] }, {ephemeral: true});
        }
    }
};