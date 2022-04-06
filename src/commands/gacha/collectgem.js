const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');
// const { dayjs } = require('dayjs');
var dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()
dayjs.extend(duration)


function embedC(interaction) {
    const username = interaction.user.username;
    const embed = new MessageEmbed();
    embed.setTitle("Collecting...")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Checking for ${username}'s account.`)
            .setColor(color.purple)
    return embed;
};

function embedD(interaction) {
    const username = interaction.user.username;
    const embedDone = new MessageEmbed();
    embedDone.setTitle("Collected gems!")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setColor(color.successgreen)
    return embedDone;
};

function embedL(interaction) {
    const username = interaction.user.username;
    const embedCool = new MessageEmbed();
    embedCool.setTitle("Collection too soon.")
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
            .setColor("#ff0000")
    return embedError;
}

async function checkTime(interaction, player){
    const userId = interaction.user.id;
    const collect = await database.Collect.findOne({where : { playerID: userId}});
    if (collect) {
        const lastCheck = collect.lastcollect;
        const timeNow = Date.now();
        const timeDiff = await timeNow - lastCheck;
        if (28800000 > timeDiff && timeDiff >= 480000) {
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
    const embedDone = await embedD(interaction);
    const userId = interaction.user.id;
    const timeNow = Date.now();
    await database.Collect.create({
        playerID: userId,
        lastcollect: timeNow,
        
    });
    await player.increment('gems', {by: 900});
    await embedDone.setDescription(`
    Collect is a command that you grants you 5 gems per 8 minutes (:P)
    This is a temporary solution for those who are too lazy to send images but still want to gacha.
    Collection will cap at 8hrs for total of 300 gems per 8hr cycle.
    Collecting after more than 8hrs have past will grant 300 gems.
    Gems: (Start collecting bonus +900 gems!) ${player.gems+900}`);
    return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
}

async function normalCollect(interaction, player, amount){
    let bonus
    if (amount >= 25) {
        bonus = 50;
    } else {
        bonus = amount*2
    }
    const embedDone = await embedD(interaction);
    await player.increment('gems', {by: amount + bonus});
    await embedDone.setDescription(`
    Gems Collected: (${amount + bonus}) ${player.gems+amount+bonus}`);
    return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
}

async function maxCollect(interaction, player){
    const embedDone = await embedD(interaction);
    await player.increment('gems', {by: 350});
    await embedDone.setDescription(`
    Gems Collected: (Capped! +350) ${player.gems+350}`);
    return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
}

async function noCollect(interaction, timeDiff){
    const embedCool = embedL(interaction);
    const timeLeft = 480000 - timeDiff;
    const remain = dayjs.duration(timeLeft).format('mm[m : ]ss[s]');
    await embedCool.setDescription(`Please wait for the cooldown.\nTime Remaining: ${remain}`);
    await interaction.editReply({ embeds: [embedCool] }, {ephemeral: true});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('collect')
        .setDescription('Adds gems to your profile based on time since last collected'),
    async execute(interaction) {
        const embed = embedC(interaction);
        const embedError = embedE(interaction);
        await interaction.reply({ embeds: [embed] }, {ephemeral: true});
        try {
            const userId = await interaction.user.id;
            const player = await database.Player.findOne({ where: { playerID: userId } })
            if (player) {
                checkTime(interaction, player);
            } else {
                embedError.setDescription('You must first create an account using /isekai.')
            }
        } catch (error) {
            return interaction.editReply({ embeds: [embedError] }, {ephemeral: true});
        }
    }
};