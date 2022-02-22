const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');


async function embedSuccess(interaction) {
    const embedSuccess = new MessageEmbed();
    const id = await interaction.options.getInteger("id")
    const image = await database.Image.findOne({where: {imageID: id}});
    embedSuccess.setTitle(`Image ${id} edited`)
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true })})
        .setDescription(`Image ${id} has been edited`)
        .setColor("GREEN")
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));
    console.log("embed s dies")
    return embedSuccess;
};

function embedError(interaction) {
    const embedError = new MessageEmbed();
    embedError.setTitle("Unknown Error")
	.setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true })})
        .setDescription(`Please report the error if it persists.`)
        .setColor("RED");
    return embedError;
};

async function selectOption(interaction) {
    console.log("2");
    const id = interaction.options.getInteger('id');
    console.log("2");
    const embedS = await embedSuccess(interaction);
    switch (interaction.options.getSubcommand()) {
        case "cid":
            console.log("2.1");
            const name = interaction.options.getInteger('cid');
            console.log("2.1");
            await database.Image.update({ characterID: cid }, { where: { imageID: id } });
            console.log("2.1");
            return interaction.reply({embeds: [embedS]});

        case "imagenumber":
            console.log("2.2");
            const imageNumber = interaction.options.getString('imagenumber');
            await database.Image.update({ imageNumber: imageNumber }, { where: { imageID: id } });
            return interaction.reply({embeds: [embedS]});

        case "artist":
            console.log("2.3");
            const artist = interaction.options.getString('artist');
            await database.Image.update({ artist: artist }, { where: { imageID: id } });
            return interaction.reply({embeds: [embedS]});

        case "sourcelink":
            console.log("2.4");
            const source = interaction.options.getString('source');
            await database.Image.update({ source: source }, { where: { imageID: id } });
            return interaction.reply({embeds: [embedS]});
		
		case "nsfw":
			console.log("2.5");
			const nsfw = interaction.options.getBoolean('nsfw');
			await database.Image.update({ nsfw: nsfw }, { where: { imageID: id } });
			return interaction.reply({embeds: [embedS]});

        default:
            const embed = embedError(interaction);
            embed.setDescription("Error has occured, try using the command with a subcommand.")
            return interaction.reply({embeds: [embed]})

    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('iedit')
		.setDescription('Edits image Details')
        //cid is constant
        //subcommands for
        /** 
         * characterName
         * infoLink
         * seriesID
         * alias
         */
        .addSubcommand(subcommand => subcommand
            .setName("cid")
            .setDescription("Edit the character assigned to image.")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the image")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("cid")
                .setDescription("The id of the character")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("imagenumber")
            .setDescription("Edit the image number")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the image")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("imagenumber")
                .setDescription("New Image ID")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("artist")
            .setDescription("Edit the artist of the image")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the image")
                .setRequired(true))
            .addStringOption(option => option
                .setName("artist")
                .setDescription("The artist of the image")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("sourcelink")
            .setDescription("Edit source link for the image")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the image")
                .setRequired(true))
            .addStringOption(option => option
                .setName("source")
                .setDescription("The sauce")
                .setRequired(true)))
		.addSubcommand(subcommand =>subcommand
			.setName("nsfw")
			.setDescription("Edit the nsfw status of the image")
			.addIntegerOption(option => option
				.setName("id")
				.setDescription("The id of the image")
				.setRequired(true))
			.addBooleanOption(option => option
				.setName("nsfw")
				.setDescription("nsfw")
				.setRequired(true))),
	async execute(interaction) {
		try {
        	const id = interaction.options.getInteger('id');
            console.log("1");
            await selectOption(interaction)
            console.log("1");
        } catch (error) {
            console.log("u fucked up");
            return interaction.reply({embeds: [embedError(interaction)]});
        }
	},
};