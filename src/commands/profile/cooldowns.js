const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');
var dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()
dayjs.extend(duration)

async function checkDaily1(interaction) {
    const daily = await database.Daily.findOne({where: {playerID: interaction.user.id}});
    if (!daily) {
        return await interaction.followUp('Do /daily first!')
    }
    return;
}

async function checkCollect1(interaction) {
    const collect = await database.Collect.findOne({where: {playerID: interaction.user.id}});
    if (!collect) {
        return await interaction.followUp('Do /collect first!')
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
            const remain = dayjs.duration(timeLeft).format('HH[hr: ]mm[m : ]ss[s]');
            //on cooldown
            return `Cooldown for ${remain}`;
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
        if (28800000 > timeDiff && timeDiff >= 480000) {
            //some collected show cooldown.
            const amount = 5 * Math.floor(timeDiff/480000);
            const cooltime = (timeDiff%480000);
            const timeLeft = 480000 - cooltime;
            const remain = dayjs.duration(timeLeft).format('mm[m : ]ss[s]');
            return `(${amount}/300) gems collected. ${remain} until next 5 gems.`;
        } else if (timeDiff < 480000) {
            const timeLeft = 480000 - timeDiff;
            const remain = dayjs.duration(timeLeft).format('mm[m : ]ss[s]');
            return `(0/300) gems collected. ${remain} until next 5 gems.`;
            //none collected show cooldown
        } else {
            return `(300/300) gems collected. At maximum capacity and collection paused.`;
            //capped out
        }
    }
}

async function checkClaim(interaction){
    const time = await database.Collect.findOne({where: {playerID: interaction.user.id}});
    const timeNow = Date.now();
    const timeDiff = timeNow - time.lastclaim;
    if (timeDiff > 1800000) {
        return `3/3 Claims Ready! Cannot prepare more claims.`;
    } else if (timeDiff > 1200000) {
        const cooldown = dayjs.duration(1800000-timeDiff).format('mm[m : ]ss[s]');
        return `2/3 Claims Ready. ${cooldown} until next claim`;
    } else if (timeDiff > 600000) {
        const cooldown = dayjs.duration(1200000-timeDiff).format('mm[m : ]ss[s]');
        return `1/3 Claims Ready. ${cooldown} until next claim`;
    } else {
        const cooldown = dayjs.duration(600000-timeDiff).format('mm[m : ]ss[s]');
        return `0/3 Claims Ready. ${cooldown} until next claim`;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cds')
        .setDescription('Check your character stats'),
    async execute(interaction) {
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

        await interaction.reply({ embeds: [embed] });
        try {
            const player = await database.Player.findOne({where: {playerID: userId}});
            const daily = await database.Daily.findOne({where: {playerID: userId}});
            const collect = await database.Collect.findOne({where: {playerID: userId}});
            await checkDaily1(interaction);
            await checkCollect1(interaction);
            if (player && daily && collect) {
                const dailyText = await checkDaily(interaction);
                const collectText = await checkCollect(interaction);
                const claimText = await checkClaim(interaction);
                embedDone.setDescription(`
**Daily:** ${dailyText}

**Collect:** ${collectText}

**Claim:** ${claimText}`);
            } else {
                embedDone.setDescription('Player does not exist.')
                        .setColor(color.failred);
            }
            return interaction.editReply({ embeds: [embedDone] });
        } catch (error) {
            return interaction.editReply({ embeds: [embedError] });
        }
    },
};