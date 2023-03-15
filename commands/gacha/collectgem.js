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
    const embedDone = await embedD(interaction);
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
    return interaction.reply({ embeds: [embedDone] });
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
Gems Collected: (${amount + bonus}) ${player.gems+amount+bonus}
Gems produced are tripled for the first 40 minutes after collect.`);
    return interaction.reply({ embeds: [embedDone] });
}

async function maxCollect(interaction, player){
    const embedDone = await embedD(interaction);
    await player.increment('gems', {by: 650});
    await embedDone.setDescription(`
Gems Collected: (Capped! +650) ${player.gems+650}
Gems produced are tripled for the first 40 minutes after collect.`);
    return interaction.reply({ embeds: [embedDone] });
}

async function noCollect(interaction, timeDiff){
    const embedCool = embedL(interaction);
    const timeLeft = 480000 - timeDiff;
    const remain = dayjs.duration(timeLeft).format('mm[m : ]ss[s]');
    await embedCool.setDescription(`Please wait for the cooldown.\nTime Remaining: ${remain}`);
    await interaction.reply({ embeds: [embedCool] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('collect')
        .setDescription('Adds gems to your profile based on time since last collected'),
    async execute(interaction) {
        const embedError = embedE(interaction);
        try {
            const userId = await interaction.user.id;
            const player = await database.Player.findOne({ where: { playerID: userId } })
            if (player) {
                await checkTime(interaction, player);
            } else {
                embedError.setDescription('You must first create an account using /isekai.')
                return interaction.reply({ embeds: [embedError] });
            }
        } catch (error) {
            return interaction.reply({ embeds: [embedError] });
        }
    }
};