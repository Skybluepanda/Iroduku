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
    embed.setTitle("Checking in")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Checking for ${username}'s account.`)
            .setColor(color.purple)
    return embed;
};

function embedD(interaction) {
    const username = interaction.user.username;
    const embedDone = new MessageEmbed();
    embedDone.setTitle("Daily claimed!")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setColor(color.successgreen)
    return embedDone;
};

function embedL(interaction) {
    const username = interaction.user.username;
    const embedCool = new MessageEmbed();
    embedCool.setTitle("Daily on cooldown.")
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

async function checkDaily(interaction, player){
    const userId = interaction.user.id;
    const daily = await database.Daily.findOne({where : { playerID: userId}});
    if (daily) {
        const lastCheck = daily.lastDaily;
        const timeNow = Date.now();
        const timeDiff = await timeNow - lastCheck;
        if (259200000 > timeDiff && timeDiff>= 79200000) {
            console.log("Perfect daily")
            await streakDaily(interaction, player, daily);
            await database.Daily.update({lastDaily: timeNow}, {where: {playerID: userId}});
            await database.Daily.increment({streak: 1}, {where: {playerID: userId}});
        } else if (timeDiff <= 79200000) {
            await cooldownDaily(interaction, timeDiff);
        } else {
            await resetDaily(interaction, player);
            await database.Daily.update({lastDaily: timeNow, streak: 1}, {where: {playerID: userId}});
        }
    } else {
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
    await embedDone.setDescription(`
    Streak: 1\nGems: (first time bonus!) ${player.gems+1000} (+1000)\nUse daily again within two days to continue the streak.`);
    return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
}

async function streakDaily(interaction, player, daily){
    const embedDone = await embedD(interaction);
    const streak = daily.streak;
    await checkSeverB(interaction);
    await checkSeverM(interaction);
    if (streak > 10) {
        await player.increment('gems', {by: 500});
        await embedDone.setDescription(`
    Streak: (max) ${streak+1}\nGems: ${player.gems+500} (+500)\nUse daily again within two days to continue the streak.`);
        return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
    } else {
        const reward = 250 + streak*25;
        await player.increment('gems', {by: reward});
        await embedDone.setDescription(`
    Streak: ${streak+1}\nGems: ${player.gems+reward} (+${reward})\nUse daily again within two days to continue the streak.`);
        return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
    }
}

async function checkSeverB(interaction) {
    const embed = embedD(interaction);
    if (interaction.member.roles.cache.has('951152537598320721')) {
        await database.Player.increment({Karma: 30}, {where: {playerID: interaction.user.id}});
        embed.setTitle("Server boost bonus")
            .setDescription(`Daily bonus for boosting server. +30 karma`);
        await interaction.followUp({ embeds: [embed] }, {ephemeral: true});
    };
}

async function checkSeverM(interaction) {
    const embed = embedD(interaction);
    if (interaction.member.roles.cache.has('908920472295604224')) {
        await database.Player.increment({Karma: 50}, {where: {playerID: interaction.user.id}});
        embed.setTitle("Mod wage")
            .setDescription(`For doing mod things. +50 karma`);
        await interaction.followUp({ embeds: [embed] }, {ephemeral: true});
    };
}

async function resetDaily(interaction, player){
    const embedDone = await embedD(interaction);
    await player.increment('gems', {by: 250});
    await checkSeverB(interaction);
    await checkSeverM(interaction);
    await embedDone.setDescription(`
Streak: (reset) 1\nGems: ${player.gems+250} (+250)\nUse daily again within two days to continue the streak.`);
    return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
}

async function cooldownDaily(interaction, timeDiff){
    const embedCool = embedL(interaction);
    const timeLeft = 79200000 - timeDiff;
    const remain = dayjs.duration(timeLeft).format('HH[hr: ]mm[m : ]ss[s]');
    await embedCool.setDescription(`Please wait for the cooldown.\nTime Remaining: ${remain}`);
    await interaction.editReply({ embeds: [embedCool] }, {ephemeral: true});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('adds gem to your profile, can be used once a day.'),
    async execute(interaction) {
        const embed = embedC(interaction);
        const embedError = embedE(interaction);
        await interaction.reply({ embeds: [embed] }, {ephemeral: true});
        try {
            const userId = await interaction.user.id;
            const player = await database.Player.findOne({ where: { playerID: userId } })
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