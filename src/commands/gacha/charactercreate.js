const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');



function embedNew(interaction) {
    const embedNew = new MessageEmbed();
    embedNew.setTitle("Character Created")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Series is being created.`)
        .setColor("ORANGE")
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));
    return embedNew;
};

function embedError(interaction) {
    const embedError = new MessageEmbed();
    embedError.setTitle("Unknown Error")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Please report the error if it persists.`)
        .setColor("RED");
    return embedError;
};

function embedDupe(interaction) {
    const embedDupe = new MessageEmbed();
    embedDupe.setTitle("Character with same name Exists")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Character with same name exists, make sure they are not same 
        Character and edit either Character name to allow coexistence`)
        .setColor("RED");
    return embedDupe;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ccreate')
		.setDescription('Creates a new character')
		.addStringOption(option => option
            .setName('cname')
            .setDescription('Enter the character name')
            .setRequired(true))
        .addStringOption(option => option
            .setName('clink')
            .setDescription('Enter the mal link for the series or a game link.')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('sid')
            .setDescription('Enter the series id that the character is part of.')
            .setRequired(true)),
	async execute(interaction) {
		const name = interaction.options.getString('cname');
        const link = interaction.options.getString('clink');
        const sid = interaction.options.getInteger('sid');
        
        const embedN = embedNew(interaction);
        const embedD = embedDupe(interaction);
        const embedE = embedError(interaction);
        
        await interaction.reply({ embeds: [embedN] });
        try {
            console.log('we got to here');
            const character = await database.Character.create({
                characterName: name,
                infoLink: link,
                seriesID: sid,
            });
            console.log('we got to here');
            const series = await database.Series.findOne({ where: {seriesID: sid}});
			embedN.setDescription(`Character ${name} was created with id ${character.characterID} in series ${series.seriesName}`);
            embedN.setColor('GREEN');
            return interaction.editReply({ embeds: [embedN] });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.editReply({ embeds: [embedD] });
            }
            return interaction.editReply({ embeds: [embedE] });
        }
        console.log("there are no errors here.")
	},
};
