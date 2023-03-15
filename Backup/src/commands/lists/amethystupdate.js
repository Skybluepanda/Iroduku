const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('amethystupdate')
		.setDescription('Sets an Amethyst card to the new image assigned to the image number.')
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("The inventory id of the Amethyst card.")
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
            console.log("1");
            const uid = interaction.user.id;
            const lid = interaction.options.getInteger('lid');
            const card = await database.Card.findOne({where: {playerID: uid, inventoryID: lid}});
            console.log("2");
            if (card) {
                console.log("3");
                if (card.rarity >= 4) {
                    console.log("4");
                    if (card.imageNumber > 0) {
                        console.log("5");
                        const image = await database.Image.findOne({where: {characterID: card.characterID, imageNumber: card.imageNumber}});
                        if (image) {
                            console.log("6");
                            await card.update({imageID: image.imageID});
                            return interaction.reply(`Card ${lid} has updated its image.`)
                        }
                        return interaction.reply(`Image not found make sure the image number exists.`)
                        
                    } else if (card.imageNumber < 0) {
                        console.log("7");
                        const gif = await database.Gif.findOne({where: {characterID: card.characterID, gifNumber: -card.imageNumber}});
                        if (gif) {
                            console.log("8");
                            card.update({imageID: -gif.gifID});
                            return interaction.reply(`Card ${lid} has updated its gif.`)
                        }
                        return interaction.reply(`Gif not found make sure the image number exists.`)
                    }
                } else {
                    return interaction.reply(`Card ${lid} is not a Amethyst Card. Check your list.`)
                }
            } else {
                return interaction.reply(`Card ${lid} doesn't exist. Check your list.`)
            }
        } catch (error) {
            return interaction.channel.send("Error has occured");
        }
	},
};