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
    embed.setTitle("Vote Info")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Checking for ${username}'s account.`)
            .setColor(color.purple)
    return embed;
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Gives you link to vote for the bot or rewards you for voting.'),
    async execute(interaction) {
        const embed = embedC(interaction);
        const embedError = embedE(interaction);
        await interaction.reply({ embeds: [embed] }, {ephemeral: true});
        try {
            const userId = await interaction.user.id;
            const player = await database.Player.findOne({ where: { playerID: userId } })
            if (player) {
                const cooldown = await database.Collect.findOne({where: { playerID: userId}});
                if (cooldown) {
                    //give embed with link
                    await embed.setDescription(`Vote at https://top.gg/servers/907981387699740693/vote
Reward of 5 karma will be automatically added to your account when you vote.`)
                    return interaction.editReply({ embeds: [embed] }, {ephemeral: true});
                } else {
                    //suggest user uses cooldown
                    await embed.setDescription(`Use /collect command first!`)
                    return interaction.editReply({ embeds: [embed] }, {ephemeral: true});
                }
            } else {
                embedError.setDescription('You must first create an account using /isekai.')
            }
        } catch (error) {
            return interaction.editReply({ embeds: [embedError] }, {ephemeral: true});
        }
    }
};