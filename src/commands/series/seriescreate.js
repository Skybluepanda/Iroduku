const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('screate')
		.setDescription('Creates a new series')
		.addStringOption(option => option
            .setName('sname')
            .setDescription('Enter the series name')
            .setRequired(true))
        .addStringOption(option => option
            .setName('link')
            .setDescription('Enter the mal link for the series or a game link.')
            .setRequired(true)),
	async execute(interaction) {
		const name = interaction.options.getString('sname');
        const mlink = interaction.options.getString('link');

		const embed = new MessageEmbed();
        const embedNew = new MessageEmbed();
        const embedError = new MessageEmbed();
        const embedDupe = new MessageEmbed();

        embed.setTitle("Creating Series")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Creating series`)
            .setColor("AQUA");

        embedNew.setTitle("Series Created")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Series ${name} was created.`)
            .setColor("GREEN")

        embedError.setTitle("Unknown Error")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please report the error if it persists.`)
            .setColor("RED");

		embedDupe.setTitle("Series with same name Exists")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Series with same name exists, make sure they are not same 
			series and edit either series name to allow coexistence`)
            .setColor("RED");
		
		
		
        try {
            await interaction.reply({ embeds: [embed] });
            if (!interaction.member.roles.cache.has('947640601564819516')) {
                embedError.setTitle("Insufficient Permissions")
                    .setDescription("You don't have the librarian role!");
                return interaction.editReply({ embeds: [embedError] }, {ephemeral: true});
            };
            if (interaction.channel.id === '947136227126177872') {
                await interaction.editReply({ embeds: [embed] });
                const series = await database.Series.create({
                    seriesName: name,
                    malLink: mlink,
                });
                embedNew.setDescription(`Series ${name} was created with id ${series.seriesID}`)
                return interaction.editReply({ embeds: [embedNew] });
            } else {
                interaction.editReply("Please use #series and characters channel for this command.")
            }
            
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.editReply({ embeds: [embedDupe] });
            }
            return interaction.editReply({ embeds: [embedError] });
        }
        console.log("there are no errors here.")
	},
};
