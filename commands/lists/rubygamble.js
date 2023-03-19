const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild, Collection } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()
async function gamble(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let image;
    let url;
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: card.imageID}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*you can update image with /amethystupdate*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.
*you can update image with /amethystupdate*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Ruby**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

Ruby Gamble will cost 500 coins and will attempt
To gamble your ruby cards for a chance to upgrade them to
Pink Diamonds. [ 2% Success : 4.5% Fail ]
If successful, your card will become a Pink Diamond Card
On fail, it'll be destroyed.`)
        .setColor(color.red);
    const row = await createButton();
    msg = await interaction.reply({embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(embedCard, interaction, msg, card, 0);
}



async function noeffect(embed, card, interaction, attempts) {
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    embed.setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Ruby**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

Attempts: ${attempts}`);
    await interaction.editReply({embeds: [embed], fetchReply: true})
}

async function fail(embed, card, interaction) {
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    embed.setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Ruby**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

<:pepesalute:959659655783673997>
Unfortunately your card was destroyed`)
        .setColor('#4e0505');
    await interaction.editReply({embeds: [embed], fetchReply: true});
    card.destroy();
}

async function success(embed, card, interaction, attempts) {
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    card.update({ rarity: 7 });
    embed.setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Pink Diamond**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

Congratulations <:pepog:959660462625132564>
Your Ruby Card was upgraded to Pink Diamond after ${attempts} attempts.`)
    .setColor(color.pink);
    await interaction.editReply({embeds: [embed], fetchReply: true});
}

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('gone')
                    .setLabel('x1')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('gten')
                    .setLabel('x10')
                    .setStyle('PRIMARY')
            )
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function buttonManager(embed, interaction, msg, card, attempts) {
    try {
        const uid = interaction.user.id;
        if(attempts == -1) {
            return;
        }
        const player = await database.Player.findOne({where: {playerID: interaction.user.id}});
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            i.deferUpdate();
            switch (i.customId){
                case 'gone':
                    if (player.money < 500) {
                        return interaction.followUp(`You need at least 500 coins to start rubygamble.`)
                    }
                    attempts += 1;
                    await player.increment('money', {by: -500});
                    const gamble = Math.floor(Math.random() * 1000);
                    if (gamble + attempts > 980) {
                        await player.update({rpity: 0});
                        await success(embed, card, interaction, attempts);
                        attempts = -1;
                        break;
                    } else if (gamble - attempts < 45- player.rpity*5) {
                        await player.increment('rpity', {by: 1});
                        await fail(embed, card, interaction);
                        attempts = -1;
                        break;
                    }
                    await noeffect(embed, card, interaction, attempts);
                    buttonManager(embed, interaction, msg, card, attempts);
                    break;
                
                case 'gten':
                    var i = 0;
                    if (player.money < 5000) {
                        return interaction.followUp(`You need at least 5000 coins to roll 10 times.`)
                    }
                    while (i < 10){
                        await player.increment('money', {by: -500});
                        attempts += 1;
                        const gamble = Math.floor(Math.random() * 1000);
                        console.log(gamble);
                        if (gamble + attempts > 980) {
                            await player.update({rpity: 0});
                            await success(embed, card, interaction, attempts);
                            attempts = -1;
                            break;
                        } else if (gamble - attempts < 45 - player.rpity * 15) {
                            await player.increment('rpity', {by: 1});
                            await fail(embed, card, interaction);
                            attempts = -1;
                            break;
                        }
                        await noeffect(embed, card, interaction, attempts);
                        i++;
                    }
                    buttonManager(embed, interaction, msg, card, attempts);
                    break;
            }});
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('rubygamble')
		.setDescription('Attempts an upgrade for a ruby card to pink diamond.')
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("The inventory id of the ruby card.")
                .setRequired(true)
                ),
	async execute(interaction) {
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
        //rarity filter
        //
        try {
            const uid = interaction.user.id;
            const lid = interaction.options.getInteger('lid');
            const card = await database.Card.findOne({where: {playerID: uid, inventoryID: lid}});
            const player = await database.Player.findOne({where: {playerID: uid}});
            console.log(player.rpity);
            if (card) {
                if (card.rarity == 5) {
                    if (card.weapon) {
                        return interaction.reply("Can't rubygamble awakened rubies.");
                    }
                    if (player.money < 500) {
                        return interaction.reply(`You need at least 500 coins to start rubygamble.`)
                    } else {
                        await gamble(card, interaction);
                    }
                } else {
                    return interaction.reply(`Card ${lid} is not a Ruby Card. Check your list.`)
                }
            } else {
                return interaction.reply(`Card ${lid} doesn't exist. Check your list.`)
            }
        } catch (error) {
            return interaction.channel.send("Error has occured");
        }
	},
};