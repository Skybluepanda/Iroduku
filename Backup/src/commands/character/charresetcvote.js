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

async function resetVotes(interaction) {
    const id = interaction.options.getInteger('id');
    const embedS = await embedSuccess(interaction);
    await database.Character.update({ score: 0 }, { where: { characterID: id } });
    await database.Character.update({ votes: 0 }, { where: { characterID: id } });
    await database.Cvotetrack.create({characterID: id});
    return interaction.editReply({ embeds: [embedS] }, {ephemeral: true});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cresetvotes')
		.setDescription('Resets character vote and score and adds it to cvote2.')
        .addIntegerOption(option => option
            .setName("id")
            .setDescription("The id of the character")
            .setRequired(true)),
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
                    await resetVotes(interaction)
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