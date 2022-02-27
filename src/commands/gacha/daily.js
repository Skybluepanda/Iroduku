const { SlashCommandBuilder } = require('@discordjs/builders');
const database2 = require('../../database2.js');
const database3 = require('../../database3.js');
const { MessageEmbed } = require('discord.js');
// const { dayjs } = require('dayjs');
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()


function embedC(interaction) {
    const username = interaction.user.username;
    const embed = new MessageEmbed();
    embed.setTitle("Checking in")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Checking for ${username}'s account.`)
            .setColor("AQUA")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
    return embed;
};

function embedD(interaction) {
    const username = interaction.user.username;
    const embedDone = new MessageEmbed();
    embedDone.setTitle("Daily claimed!")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setColor("GREEN")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
    return embedDone;
};

function embedL(interaction) {
    const username = interaction.user.username;
    const embedCool = new MessageEmbed();
    embedCool.setTitle("Daily on cooldown.")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please wait for the cooldown.`)
            .setColor("ORANGE")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
    return embedCool;
};

function embedE(interaction) {
    const username = interaction.user.username;
    const embedError = new MessageEmbed();
    embedError.setTitle("Unknown Error")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please report the error if it persists.`)
            .setColor("RED")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
    return embedError;
}

async function checkDaily(interaction, player){
    console.log("start")
    const userId = interaction.user.id;
    const daily = await database3.Daily.findOne({where : { playerID: userId}});
    if (daily) {
        console.log("Has a daily")
        const lastCheck = daily.lastDaily;
        const timeNow = dayjs();
        const timeDiff = await timeNow - lastCheck;
        console.log(timeNow + "timenow");
        console.log(lastCheck + "lastCheck");
        console.log(timeDiff + "Time diff");
        console.log("Checking time diff")
        if (172800000 >= timeDiff >= 79200000) {
            console.log("Perfect daily")
            await streakDaily(interaction, player, daily);
            await database3.Daily.update({lastDaily: timeNow}, {where: {playerID: userId}});
            await database3.Daily.increment({streak: 1}, {where: {playerID: userId}});
            console.log("Time diff checked and rewarded")
        } else if (timeDiff <= 79200000) {
            console.log("Too early")
            await cooldownDaily(interaction, timeDiff);
            console.log("Done")
        } else {
            console.log("Too late")
            await resetDaily(interaction, player);
            await database3.Daily.update({lastDaily: timeNow, streak: 1}, {where: {playerID: userId}});
            console.log("Done")
        }
    } else {
        console.log("welcome")
        newDaily(interaction, player);
        console.log("Done")
    }
}

async function newDaily(interaction, player){
    const embedDone = await embedD(interaction);
    const userId = interaction.user.id;
    const timeNow = dayjs();
    await database3.Daily.create({
        playerID: userId,
        lastDaily: timeNow,
        streak: 1,
        
    });
    await player.increment('gems', {by: 200});
    await embedDone.setDescription(`
    Streak: 1\nGems: (first time bonus!) ${player.gems+200}\nUse daily again within two days to continue the streak.`);
    return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
}

async function streakDaily(interaction, player, daily){
    const embedDone = await embedD(interaction);
    const streak = daily.streak;
    if (streak > 10) {
        await player.increment('gems', {by: 100});
        await embedDone.setDescription(`
    Streak: (max) ${streak}\nGems: ${player.gems+100}\nUse daily again within two days to continue the streak.`);
        return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
    } else {
        const reward = 50 + streak*5;
        await player.increment('gems', {by: reward});
        await embedDone.setDescription(`
    Streak: ${streak}\nGems: ${player.gems+reward}\nUse daily again within two days to continue the streak.`);
        return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
    }
}

async function resetDaily(interaction, player){
    const embedDone = await embedD(interaction);
    await player.increment('gems', {by: 50});
    await embedDone.setDescription(`
Streak: (reset) 1\nGems: ${player.gems+50}\nUse daily again within two days to continue the streak.`);
    return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
}

async function cooldownDaily(interaction, timeDiff){
    const embedCool = embedL(interaction);
    const remain = dayjs(79200000 - timeDiff).format('HH[hr: ]MM[m : ]ss[s]');
    await embedCool.setDescription(`Please wait for the cooldown.\nTime Remining: ${remain}`);
    await interaction.editReply({ embeds: [embedCool] }, {ephemeral: true});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('adds gem to your profile, can be used once a day.'),
    async execute(interaction) {
        console.log("1")
        const embed = embedC(interaction);
        const embedError = embedE(interaction);
        console.log("2")
        await interaction.reply({ embeds: [embed] }, {ephemeral: true});
        console.log("3")
        try {
            const userId = await interaction.user.id;
            console.log("4")
            const player = await database2.Player.findOne({ where: { playerID: userId } })
            console.log("5")
            if (player) {
                console.log("6")
                checkDaily(interaction, player);
                console.log("done")
            } else {
                embedError.setDescription('You must first create an account using /isekai.')
            }
        } catch (error) {
            console.log("Reply")
            return interaction.editReply({ embeds: [embedError] }, {ephemeral: true});
        }
    }
};