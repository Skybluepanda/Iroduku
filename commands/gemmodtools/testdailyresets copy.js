const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
var dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()
dayjs.extend(duration)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetdailyall')
        .setDescription('resets all daily.'),


    async execute(interaction) {
        const userId = interaction.user.id;
        const timeNow = Date.now();
        const timeReset = await timeNow - 79200000;
        try {
            
            if (!interaction.member.roles.cache.has('947442920724787260')) {
                return interaction.reply("You don't have the gemmod role!");
            };
            console.log("you have gemmod role");
            await database.Daily.update({lastDaily: timeReset});
            await interaction.reply("command worked. Probably lol.");
            
        } catch (error) {
            return interaction.reply("error dumbass");
        }
    }
};