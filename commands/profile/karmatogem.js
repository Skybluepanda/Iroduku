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

function embedD(interaction) {
    const username = interaction.user.username;
    const embedDone = new MessageEmbed();
    embedDone.setTitle("Gems collected!")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setColor(color.successgreen)
    return embedDone;
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
        .setName('kconvert')
        .setDescription('Converts Karma to 10 gems each.')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('amount of karma you want to convert.')
                .setRequired(true)),
    async execute(interaction) {
        const embedError = embedE(interaction);
        const embedDone = embedD(interaction);
        try {
            const userId = await interaction.user.id;
            const player = await database.Player.findOne({ where: { playerID: userId } })
            if (player) {
                if (player.karma >= amount){
                    player.increment({karma: -amount});
                    player.increment({gems: 10 * amount});
                    (embedDone).setDescription(`${amount} karma converted to ${amount*10} gems!`)
                    return await interaction.reply({embeds: [embedDone]});
                } else {
                    (embedError).setDescription(`You don't have enough karma in your account!`)
                    return await interaction.reply({embeds: [embedError]});
                }
            } else {
                embedError.setDescription('You must first create an account using /isekai.')
                return interaction.reply({ embeds: [embedError] });
            }
        } catch (error) {
            return interaction.reply({ embeds: [embedError] });
        }
    }
};