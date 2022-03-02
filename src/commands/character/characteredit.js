const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');

async function embedProcess(interaction) {
    const embedProcess = new MessageEmbed();
    const cid = await interaction.options.getInteger("id")
    embedProcess.setTitle(`Character ${cid} is being edited`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Processing...`)
        .setColor("#ffb400")
    return embedProcess;
};

async function embedSuccess(interaction) {
    const embedSuccess = new MessageEmbed();
    const cid = await interaction.options.getInteger("id")
    const char = await database.Character.findOne({where: {characterID: cid}});
    embedSuccess.setTitle(`Character ${cid} edited`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Character ${char.characterName} has been edited`)
        .setColor("#7cff00")
    return embedSuccess;
};

function embedError(interaction) {
    const embedError = new MessageEmbed();
    embedError.setTitle("Unknown Error")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Please report the error if it persists.`)
        .setColor("#ff0000");
    return embedError;
};

async function selectOption(interaction) {
    const id = interaction.options.getInteger('id');
    const embedS = await embedSuccess(interaction);
    switch (interaction.options.getSubcommand()) {
        case "name":
            const name = interaction.options.getString('name');
            await database.Character.update({ characterName: name }, { where: { characterID: id } });
            return interaction.editReply({embeds: [embedS]});

        case "link":
            const link = interaction.options.getString('link');
            await database.Character.update({ infoLink: link }, { where: { characterID: id } });
            return interaction.editReply({embeds: [embedS]});

        case "sid":
            const sid = interaction.options.getInteger('sid');
            await database.Character.update({ seriesID: sid }, { where: { characterID: id } });
            return interaction.editReply({embeds: [embedS]});

        case "alias":
            const aname = interaction.options.getString('alias');
            await database.Character.update({ alias: aname }, { where: { characterID: id } });
            return interaction.editReply({embeds: [embedS]});

        case "imagecount":
            const icount = interaction.options.getString('imagecount');
            await database.Character.update({ imageCount: icount }, { where: { characterID: id } });
            return interaction.editReply({embeds: [embedS]});

        default:
            const embed = embedError(interaction);
            embed.setDescription("Error has occured, try using the command with a subcommand.")
            return interaction.editReply({embeds: [embed]})

    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cedit')
		.setDescription('Edits Character Details')
        .addSubcommand(subcommand => subcommand
            .setName("name")
            .setDescription("Edit the name of the character.")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the character")
                .setRequired(true))
            .addStringOption(option => option
                .setName("name")
                .setDescription("The name of the character")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("link")
            .setDescription("Edit the link of the character")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the character")
                .setRequired(true))
            .addStringOption(option => option
                .setName("link")
                .setDescription("The link of the character")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("sid")
            .setDescription("Edit the series of the character")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the character")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("sid")
                .setDescription("The series of the character")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("alias")
            .setDescription("Edit the alias for the character")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the character")
                .setRequired(true))
            .addStringOption(option => option
                .setName("alias")
                .setDescription("The alias")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("imagecount")
            .setDescription("Edit the image count for the character manually if something goes wrong.")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the character")
                .setRequired(true))
            .addStringOption(option => option
                .setName("imagecount")
                .setDescription("The imagecount")
                .setRequired(true))),
	async execute(interaction) {
        const id = interaction.options.getInteger('id');
        const embedE = await embedError(interaction);
        const embedP = await embedProcess(interaction);
        
        await interaction.reply({ embeds: [embedP]});
        try {
            if (!interaction.member.roles.cache.has('947640601564819516')) {
                embedE.setTitle("Insufficient Permissions")
                    .setDescription("You don't have the librarian role!");
                return interaction.editReply({ embeds: [embedE] }, {ephemeral: true});
            };
            if (interaction.channel.id === '947136227126177872') {
                await selectOption(interaction)
            
            } else {
                interaction.editReply("Please use #series and characters channel for this command.")
            }
            
        } catch (error) {
            return interaction.channel.send({embeds: [embedE]});
        }
	},
};