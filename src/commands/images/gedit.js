const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');


async function embedSuccess(interaction) {
    const embedSuccess = new MessageEmbed();
    const id = await interaction.options.getInteger("id")
    const image = await database.Image.findOne({where: {imageID: id}});
    embedSuccess.setTitle(`Gif ${id} edited`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Gif ${id} has been edited`)
        .setColor("GREEN")
    return embedSuccess;
};

function embedError(interaction) {
    const embedError = new MessageEmbed();
    embedError.setTitle("Unknown Error")
	.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Please report the error if it persists.`)
        .setColor("RED");
    return embedError;
};

async function cidedit(interaction) {
    console.log("3.1");
    const id = await interaction.options.getInteger('id');
    const cid = await interaction.options.getInteger('cid');
    const gnumber = await interaction.options.getInteger('gnumber');
    const gif = await database.Gif.findOne({where: {gifID: id}});
    const oid = await gif.characterID;
    // const charold = await database.Character.findOne({ where: {characterID: oid}});
    // const charnew = await database.Character.findOne({ where: {characterID: cid}});
    const check = await database.Gif.findOne({ where: {characterID: cid, gifNumber: gnumber}});
    console.log("3.2");
    await database.Character.increment({gifCount: -1}, {where: {characterID: oid}});
    await database.Character.increment({gifCount: 1}, {where: {characterID: cid}});
    // charold.increment('imageCount', {by: -1})
    // await charnew.increment('imageCount', {by: 1})
    console.log("3.3");
    console.log("3.4");
    await image.update({characterID: cid, gifNumber: gnumber});
    console.log("3.5");
}

async function selectOption(interaction) {
    console.log("2");
    const id = await interaction.options.getInteger('id');
    console.log("2");
    const embedS = await embedSuccess(interaction);
    const embedE = await embedError(interaction);
    const scommand = await interaction.options.getSubcommand();
    console.log("a");
    switch (scommand) {
        case "cid":
            await console.log("2.1");
            await cidedit(interaction);
            return await interaction.reply({embeds: [embedS]});

        case "gifnumber":
            console.log("2.2");
            const gNumber = await interaction.options.getInteger('gnumber');
            console.log("2.2.1");
            const cid = await database.Gif.findOne({attributes: ['characterID']}, {where: {gifID: id}});
            console.log("2.2.2");
            const check = await database.Gif.findOne({where: { gifNumber: gNumber, characterID: cid}});
            console.log("2.2.3");
            if (check) {
                return await interaction.reply({embeds: [embedE]});
            } else {
                await database.Gif.update({ gifNumber: gNumber }, { where: { gifID: id } })
            }
            console.log("2.2.4");
            return await interaction.reply({embeds: [embedS]});

        case "artist":
            console.log("2.3");
            const artist = interaction.options.getString('artist');
            await database.Gif.update({ artist: artist }, { where: { gifID: id } });
            return interaction.reply({embeds: [embedS]});

        case "sourcelink":
            console.log("2.4");
            const source = interaction.options.getString('source');
            await database.Gif.update({ source: source }, { where: { gifID: id } });
            return interaction.reply({embeds: [embedS]});
		
		case "nsfw":
			console.log("2.5");
			const nsfw = interaction.options.getBoolean('nsfw');
			await database.Gif.update({ nsfw: nsfw }, { where: { imageID: id } });
			return interaction.reply({embeds: [embedS]});

        default:
            const embed = embedError(interaction);
            embed.setDescription("Error has occured, try using the command with a subcommand.")
            return interaction.reply({embeds: [embed]})

    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gedit')
		.setDescription('Edits gif Details')
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
            .setDescription("Edit the character assigned to gif.")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the gif")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("cid")
                .setDescription("The id of the character")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("gnumber")
                .setDescription("An empty gif number on the character.")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("gifnumber")
            .setDescription("Edit the gif number")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the gif")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("gnumber")
                .setDescription("New gif number")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("artist")
            .setDescription("Edit the artist of the gif")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the gif")
                .setRequired(true))
            .addStringOption(option => option
                .setName("artist")
                .setDescription("The artist of the gif")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("sourcelink")
            .setDescription("Edit source link for the gif")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the gif")
                .setRequired(true))
            .addStringOption(option => option
                .setName("source")
                .setDescription("The sauce")
                .setRequired(true)))
		.addSubcommand(subcommand =>subcommand
			.setName("nsfw")
			.setDescription("Edit the nsfw status of the gif")
			.addIntegerOption(option => option
				.setName("id")
				.setDescription("The id of the gif")
				.setRequired(true))
			.addBooleanOption(option => option
				.setName("nsfw")
				.setDescription("nsfw")
				.setRequired(true))),
	async execute(interaction) {
        if (!interaction.member.roles.cache.has('947640668031975465')) {
            return interaction.reply("You don't have the photoshopper role!", {ephemeral: true});
        };
        if (interaction.channel.id === '947123054570512395') {
            try {
                const id = interaction.options.getInteger('id');
                console.log("1");
                await selectOption(interaction)
                console.log("1");
            } catch (error) {
                console.log("u fucked up");
                return interaction.reply({embeds: [embedError(interaction)]});
            }
        } else {
			interaction.reply("use #send-image to edit gif please.")
		}
	},
};