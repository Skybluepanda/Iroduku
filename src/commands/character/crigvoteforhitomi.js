const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');

async function embedProcess(interaction) {
    const embedProcess = new MessageEmbed();
    const cid = await interaction.options.getInteger("id")
    embedProcess.setTitle(`Character ${cid} is being edited`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Processing...`)
        .setColor(color.purple)
    return embedProcess;
};

async function embedSuccess(interaction) {
    const embedSuccess = new MessageEmbed();
    const cid = await interaction.options.getInteger("id")
    const char = await database.Character.findOne({where: {characterID: cid}});
    embedSuccess.setTitle(`Character ${cid} edited`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Character ${char.characterName} has been edited`)
        .setColor(color.successgreen)
    return embedSuccess;
};

async function embedError(interaction) {
    const embedError = new MessageEmbed();
    embedError.setTitle("Unknown Error")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Please report the error if it persists.`)
        .setColor(color.failred);
    return embedError;
};

async function selectOption(interaction) {
    const id = interaction.options.getInteger('id');
    const embedS = await embedSuccess(interaction);
    switch (interaction.options.getSubcommand()) {
        case "score":
            const score = interaction.options.getInteger('score');
            await database.Character.update({ score: score }, { where: { characterID: id } });
            return interaction.editReply({embeds: [embedS]});

        case "votes":
            const votes = interaction.options.getInteger('votes');
            await database.Character.update({ votes: votes }, { where: { characterID: id } });
            return interaction.editReply({embeds: [embedS]});

        default:
            const embed = embedError(interaction);
            embed.setDescription("Error has occured, try using the command with a subcommand.")
            return interaction.editReply({embeds: [embed]})

    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ceditvotes')
		.setDescription('Edits Character Details')
        .addSubcommand(subcommand => subcommand
            .setName("score")
            .setDescription("Edit the name of the character.")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the character")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("score")
                .setDescription("The name of the character")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("votes")
            .setDescription("Edit the link of the character")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the character")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("votes")
                .setDescription("The votes of the character")
                .setRequired(true))),
	async execute(interaction) {
        const id = interaction.options.getInteger('id');
        const embedE = await embedError(interaction);
        const embedP = await embedProcess(interaction);
        
        await interaction.reply({ embeds: [embedP]});
        try {
            if (!interaction.member.roles.cache.has('951960607324766259')) {
                embedE.setTitle("Insufficient Permissions")
                    .setDescription("You don't have the chief librarian role!");
                return interaction.editReply({ embeds: [embedE] }, {ephemeral: true});
            };
            if (interaction.channel.id === '947136227126177872') {
                const char = database.Character.findOne({where: {characterID: id}});
                if (char) {
                    await selectOption(interaction)
                } else {
                    embedE.setTitle("Character doesn't exist")
                    .setDescription(`Character ${id} is not a valid id in the database.`);
                    return interaction.editReply({ embeds: [embedE] }, {ephemeral: true});
                }
                
            
            } else {
                interaction.editReply("Please use #series and characters channel for this command.")
            }
            
        } catch (error) {
            return interaction.channel.send({embeds: [embedE]});
        }
	},
};