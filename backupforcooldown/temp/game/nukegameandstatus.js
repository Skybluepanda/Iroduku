const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');




module.exports = {
	data: new SlashCommandBuilder()
		.setName('nukegameandstatus')
		.setDescription('nuke all games and status.'),
	async execute(interaction) {        
        try {
            if (interaction.member.roles.cache.has('908920341588496445')) {
                await database.Game.destroy({where: {},
                    truncate: true});
                await database.Status.destroy({where: {},
                    truncate: true});
                return interaction.reply("Games and statuses nuked.");
            } else {
                return interaction.reply("insufficient perms")
            }
        } catch (error) {
            console.log(error)
        }
        console.log("there are no errors here.")
	},
};
