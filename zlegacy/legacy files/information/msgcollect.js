const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../../src/database.js');
const { MessageEmbed, Guild, Message } = require('discord.js');
const { Op } = require("sequelize");
const { MessageActionRow, MessageButton } = require('discord.js');

async function collectmsg(interaction, msg) {
    const filter = i => i.user.id === interaction.user.id;
    const collector = await interaction.channel.createMessageCollector({filter, max:1, time:15000});

    collector.on('collect', async i => {
        interaction.followUp(`${i.content}`);
    });

    collector.on('end', i => {
        console.log("message collection over.");
    });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('collectmsg')
		.setDescription('collects a message'),
    async execute(interaction) {
        try {
            const msg = await interaction.reply("Collecting message", {fetchReply: true});
            collectmsg(interaction, msg);
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}