const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
const { Op } = require("sequelize");
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
            const remain = dayjs.duration(timeLeft).format('HH[hr : ]mm[m : ]ss[s]');
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
                console.log("2")
                const isvote = await checkIsvote(interaction);
                console.log("3")
                embedDone.setDescription(`
**Daily:** ${dailyText}

**Collect:** ${collectText}

**Cvote:** ${votetrack.charVote-1}/${ccount} characters
**Cvote2:** ${votetrack.charVote2-1}/${cvount} characters
**Isvote:** ${isvote} swaps
`);
console.log("4")
            } else {
                embedDone.setDescription(`To enable cds, you must be a player, try /isekai\nThen do /daily, /collect and /cvote`)
                        .setColor(color.failred);
            }
            return interaction.editReply({ embeds: [embedDone] });
        } catch (error) {
            return interaction.editReply({ embeds: [embedError] });
        }
    },
};