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
    const user = await interaction.user;
    const uid = await interaction.user.id;
    const usercheck = await database.Player.findOne({where: {playerID: uid}});
    const embedP = await embedProcess(interaction);
    await interaction.reply({embeds: [embedP]});
    if (!usercheck) {
        const embedE = await embedError(interaction);
        await embedE.setDescription(`User ${uid} not registered`);
        return interaction.editReply({embeds: [embedE]});
    }
    const eventcheck = await database.Events.findOne({where: {playerID: uid}});
    if (eventcheck) {
        console.log("bruh1?")
        const embedE = await embedError(interaction);
        console.log("bruh3?")
        await embedE.setDescription(`You already claimed your Christmas Present!`);
        console.log("bruh4?")
        return interaction.editReply({embeds: [embedE]});
    } else {
        await database.Events.create({
            playerID: uid,
            event: 4,
        });
        const inumber = await inventorycheck(uid)
        const newcard = await database.Card.create({
            playerID: uid,
            characterID: 0,
            inventoryID: inumber,
            rarity: 10,
        });
        await database.Special.create({
            cardID: newcard.cardID,
            characterName: 'Merry Christmas!',
            seriesName: 'Padoru',
            imageURL: 'https://cdn.discordapp.com/attachments/995260066557067265/1056690983263281323/padorugif.gif',
            color: '#ff4c4c'
        })
        const embedS = await embedSucess(interaction);
        embedS.setDescription(`Merry Christmas, ${user.username}!`)
        await interaction.editReply({embeds: [embedS]});
        await viewCard(newcard, interaction);
    }
}

async function viewCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    embedCard.setImage('https://cdn.discordapp.com/attachments/995260066557067265/1056690983263281323/padorugif.gif');
    embedCard.setTitle(`Merry Christmas!`)
    .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
    .setDescription(`Card Info
LID: ${card.inventoryID} | CID: Not set
Series: Padoru
Rarity: Special`).setColor("#ff4c4c");
    return await interaction.followUp({embeds: [embedCard]});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('merrychristmas')
		.setDescription('Merry Christmas Everyone :D'),
	async execute(interaction) {
        try {
            createCard(interaction);
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}