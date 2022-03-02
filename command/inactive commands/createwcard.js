const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");

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
        .setColor(color.aqua);
    
    return embed;
}

async function embedError(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Creation failed.")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Remember to set description.")
        .setColor(color.failred);
    
    return embed;
}

async function embedSucess(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Card created")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Followup should be the card embed.")
        .setColor(color.successgreen);
    
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
    const quantity = await interaction.options.getInteger('quantity');
    const check = await checkExist(interaction, uid, cid);
    const embedP = await embedProcess(interaction);
    await interaction.reply({embeds: [embedP]});
    if (!check) {
        return;
    } else {
        const dupe = await database.Card.findOne({where: {playerID: uid, characterID: cid, rarity: 1}});
        
        if (dupe) {
            dupe.increment({quantity: quantity});
            const embedS = await embedSucess(interaction);
            embedS.setDescription(`Added ${quantity} copie(s) of char ${cid} as white card to ${user.username}'s inventory`)
            await interaction.editReply({embeds: [embedS]});
        } else {
            const inumber = await inventorycheck(uid)
            const newcard = await database.Card.create({
                playerID: uid,
                characterID: cid,
                inventoryID: inumber,
                quantity: quantity,
                rarity: 1,
            });
            const embedS = await embedSucess(interaction);
            embedS.setDescription(`Added ${quantity} copie(s) of char ${cid} as white card to ${user.username}'s inventory`)
            await interaction.editReply({embeds: [embedS]});
            await viewCard(newcard, interaction);
        }
    }
}

async function viewCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const image1 = await database.Image.findOne({where: {characterID: cid, imageNumber: 1}});
    if (image1) {
        embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
LID: ${card.inventoryID} | CID: ${cid}
Series: ${char.seriesID} | ${series.seriesName}
Rarity: Quartz
Quantity: ${card.quantity}`)
        .setImage(image1.imageURL)
        .setFooter(`#${image1.imageNumber} Art by ${image1.artist} | Uploaded by ${image1.uploader}
Image ID is ${image1.imageID} report any errors using ID.`)
        .setColor(color.white);
        return await interaction.followUp({embeds: [embedCard]});
    } else {
        return await interaction.followUp("Send an image for this character.");
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cawcreate')
		.setDescription('Creates a white card')
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
                )
        .addIntegerOption(option => 
            option
                .setName("quantity")
                .setDescription("The number of cards")
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