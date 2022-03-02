const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');



function embedNew(interaction) {
    const embedNew = new MessageEmbed();
    embedNew.setTitle("Character Created")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Character is being created.`)
        .setColor("#ffb400")
    return embedNew;
};

function embedError(interaction) {
    const embedError = new MessageEmbed();
    embedError.setTitle("Unknown Error")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Please report the error if it persists.`)
        .setColor("#ff0000");
    return embedError;
};

function embedDupe(interaction) {
    const embedDupe = new MessageEmbed();
    embedDupe.setTitle("Character with same name Exists")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Character with same name exists, make sure they are not same 
        Character and edit either Character name to allow coexistence`)
        .setColor("#ff0000");
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
        
     
        
        
        try {
            await interaction.reply({ embeds: [embedN] });
            if (!interaction.member.roles.cache.has('947640601564819516')) {
                embedE.setTitle("Insufficient Permissions")
                    .setDescription("You don't have the librarian role!");
                return interaction.editReply({ embeds: [embedE] }, {ephemeral: true});
            };
            if (interaction.channel.id === '947136227126177872') {
                const character = await database.Character.create({
                    characterName: name,
                    infoLink: link,
                    seriesID: sid,
                });
                const series = await database.Series.findOne({ where: {seriesID: sid}});
                embedN.setDescription(`Character ${name} was created with id ${character.characterID} in series ${series.seriesName}
                25 gems rewarded, thank you for your hard work!`);
                embedN.setColor('#7cff00');
                await database.Player.increment({gems: 25}, {where: {playerID: interaction.user.id}})
                return interaction.editReply({ embeds: [embedN] });
            } else {
                interaction.reply("Please use #series and characters channel for this command.")
            }
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.editReply({ embeds: [embedD] });
            }
            return interaction.editReply({ embeds: [embedE] });
        }
        console.log("there are no errors here.")
	},
};
