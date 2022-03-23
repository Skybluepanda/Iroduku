const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const { noExtendLeft } = require('sequelize/dist/lib/operators');

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

async function checkExist(interaction, uid) {
    const usercheck = await database.Player.findOne({where: {playerID: uid}});
    if (!usercheck) {
        
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
    const usercheck = await database.Player.findOne({where: {playerID: uid}});
    if (!usercheck) {
        const embedE = embedError(interaction);
        embedE.setDescription(`User ${uid} not registered`);
        return interaction.editReply({embeds: [embedE]});
    };
    const embedP = await embedProcess(interaction);
    await interaction.reply({embeds: [embedP]});
    const inumber = await inventorycheck(uid)
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: 0,
        inventoryID: inumber,
        rarity: 10,
    });
    await database.Special.create({
        cardID: newcard.cardID,
        characterName: 'Not set',
        seriesName: 'Not set',
        imageURL: 'https://cdn.discordapp.com/attachments/947123054570512395/947684168412823592/undefined.png',
        color: color.white
    })
    const embedS = await embedSucess(interaction);
    embedS.setDescription(`Added special card to ${user.username}'s inventory`)
    await interaction.editReply({embeds: [embedS]});
    await viewCard(newcard, interaction);
}

async function viewCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    embedCard.setTitle(`New Special Card`)
    .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
    .setDescription(`Card Info
LID: ${card.inventoryID} | CID: Not set
Series: Not set
Rarity: Special`).setColor(color.white);
    return await interaction.followUp({embeds: [embedCard]});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addspecialcard')
		.setDescription('Creates a special card')
        .addUserOption(option => 
            option
                .setName("user")
                .setDescription("The user getting the card")
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