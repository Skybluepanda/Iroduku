const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()

/**
 * Creates an embed for the command.
 * @param {*} interaction the interaction that the bot uses to reply.
 * @returns an embed template for the command.
 */
 async function embedProcess(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Creating card...")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Card is being created.")
        .setColor("#00ffff");
    
    return embed;
}

async function embedError(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Creation failed.")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Remember to set description.")
        .setColor("#ff0000");
    
    return embed;
}

async function embedSucess(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Card created")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Followup should be the card embed.")
        .setColor("#00ff00");
    
    return embed;
}

async function checkExist(interaction, uid, cid) {
    const usercheck = await database.Player.findOne({where: {playerID: uid}});
    if (!usercheck) {
        const embedE = embedError(interaction);
        embedE.setDescription(`User ${uid} not registered`);
        interaction.editReply({embeds: [embedE]});
        return false;
    }
    const charcheck = await database.Character.findOne({where: {characterID: cid}});
    if (!charcheck) {
        const embedE = embedError(interaction);
        embedE.setDescription(`Character ${cid} doesn't exist.`);
        interaction.editReply({embeds: [embedE]});
        return false;
    }
    return true;
}

async function inventorycheck(uid) {
    var notfound = true;
    var i = 1;
    while (notfound) {
        const number = await database.Card.findOne({where: {playerID: uid, inventoryID: i}})
        if (number) {
            i += 1;
        } else {
            notfound = false;
        }
    }
    return i;
}

async function createCard(interaction) {
    const user = await interaction.options.getUser('user');
    const uid = await user.id;
    const cid = await interaction.options.getInteger('cid');
    const image = await database.Image.findOne({where: {characterID: cid, imageNumber: 1}});
    const inumber = await inventorycheck(uid)
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: cid,
        inventoryID: inumber,
        rarity: 9,
    });
    if (image) {
        await database.Azurite.create({
            cardID: newcard.cardID,
            imageURL: image.imageURL,
            artist: image.artist,
            season: 1
        })
    } else {
        await database.Azurite.create({
            cardID: newcard.cardID,
            imageURL: 'https://cdn.discordapp.com/attachments/948195855742165013/998254327523180685/stockc.png',
            artist: 'Image 1 Missing',
            season: 1
        })
    }
    const embedS = await embedSucess(interaction);
    embedS.setDescription(`Added a ${cid} as azurite to ${user.username}'s inventory`)
    await interaction.reply({embeds: [embedS]});
    await viewCard(newcard, interaction);
}

async function viewCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const azur = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const url = azur.imageURL;
    const artist = azur.artist;
    embedCard.setFooter(`Art by ${artist}
Upload your choice of image using /azuriteupload`).setImage(url)
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Azurite**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.azur);
    return await interaction.channel.send({embeds: [embedCard]});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createazurcard')
		.setDescription('Creates a azur card')
        .addUserOption(option => 
            option
                .setName("user")
                .setDescription("The user getting the card")
                .setRequired(true)
                )
        .addIntegerOption(option => 
            option
                .setName("cid")
                .setDescription("The id of the character")
                .setRequired(true)
                ),
        
	async execute(interaction) {
        try {
            if (!interaction.member.roles.cache.has('947442920724787260')) {
                const embedE = embedError(interaction);
                embedE.setDescription("You don't have the gemmod role!")

                return interaction.editReply({ embeds: [embedE] }, {ephemeral: true});

            };
            createCard(interaction);
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}