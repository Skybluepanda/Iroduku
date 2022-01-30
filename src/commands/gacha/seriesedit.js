const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sedit')
		.setDescription('Edits an existing series')
		.addIntegerOption(option => 
			option.setName('sid')
			.setDescription('Enter the series ID')
			.setRequired(true))
		.addStringOption(option => 
			option.setName('sname')
			.setDescription('Enter the new series name')
			.setRequired(true)),
	async execute(interaction) {
		const id = interaction.options.getInteger('sid');
		const sname = interaction.options.getString('sname');

		const embed = new MessageEmbed();
        const embedEdited = new MessageEmbed();
        const embedError = new MessageEmbed();
        const embedNotFound = new MessageEmbed();
		const embedDupe = new MessageEmbed();

        embed.setTitle("Editing Series")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Editing series`)
            .setColor("AQUA");

        embedEdited.setTitle("Series Edited")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Series ${sID} was Edited.`)
            .setColor("GREEN")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }));

        embedError.setTitle("Unknown Error")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please report the error if it persists.`)
            .setColor("RED");

		embedNotFound.setTitle("Series Doesn't Exist")
			.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
			.setDescription(`Series with same name exists, make sure they are not same 
			series and edit either series name to allow coexistence`)
			.setColor("RED");
		
		embedDupe.setTitle("Series with same name Exists")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Series with same name exists, make sure they are not same 
			series and edit either series name to allow coexistence`)
            .setColor("RED");
		
		
		await interaction.reply({ embeds: [embed] });
		try {
			const update = await database.Tags.update({ seriesName: sname }, { where: { seriesID: id } });
			embedEdited.setDescription(`Series ${id} was Edited to ${sname}.`);
			return interaction.editReply({ embeds: [embedEdited] });
		} catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.editReply({ embeds: [embedDupe] });
            }
            return interaction.editReply({ embeds: [embedError] });
		}
	},
};
