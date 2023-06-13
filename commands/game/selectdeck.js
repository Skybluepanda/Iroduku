const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()

/**
 * Looks for exisint game.
 * @param {} interaction 
 */
async function selectDeck(interaction) {
    const user = await interaction.user.id
    const target = await interaction.options.getUser('targetuser');
    const deckid = await interaction.options.getInteger('deckid');
    const gameCheck1 = await database.Game.findOne({where: {player1ID: user, player2ID: target.id, round: -1}})
    const gameCheck2 = await database.Game.findOne({where: {player2ID: user, player1ID: target.id, round: -1}})
    const deck = await database.Deck.findOne({where: {playerID: user, deckNumber: deckid}});
    let deckimage;
    let unit1;
    let unit2;
    let unit3;
    let unit4;
    let unit5;

    if (deck) {
        deckimage = deck.deckImage;
        unit1 = deck.unit1;
        unit2 = deck.unit2;
        unit3 = deck.unit3;
        unit4 = deck.unit4;
        unit5 = deck.unit5;
    } else {
        return interaction.reply("Invalid deck number!");
    }
    if (gameCheck1) {
        await gameCheck1.update({
            deck1Image: deckimage, 
            unit1:unit1, 
            unit2:unit2, 
            unit3:unit3,
            unit4:unit4, 
            unit5:unit5
        });
        //you are player 1
    } else if (gameCheck2) {
        await gameCheck2.update({
            deck2Image: deckimage, 
            unit6:unit1, 
            unit7:unit2, 
            unit8:unit3, 
            unit9:unit4, 
            unit10:unit5
        });
        //you are player 2
    } else {
        return interaction.reply(`You are not in a game with ${target.toString()}`)
    }
    return interaction.reply(`Deck ${deckid} was chosen for the game with ${target.toString()}`);
}


async function subCommandSwitch(interaction){
    const subCommand = await interaction.options.getSubcommand();
    const user = await interaction.user.id
    const target = await interaction.options.getUser('targetuser');
    switch (subCommand) {
        case "deck":
            await selectDeck(interaction);
            break;

        default:
            break;
    }
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('select')
		.setDescription('main command to start, continue or end a game with another player.')
        .addSubcommand(subcommand => 
            subcommand
                .setName("deck")
                .setDescription("Start a new Game with a player")
                .addUserOption(option => 
                    option
                        .setName("targetuser")
                        .setDescription("The player you want to play against.")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("deckid")
                        .setDescription("Either ~~draft~~ or choose deck.")
                        .setRequired(true)
                        ))
        // .addSubcommand(subcommand => 
        //     subcommand
        //         .setName("draft")
        //         .setDescription("Continue existing game with a player")
        //         .addUserOption(option => 
        //             option
        //                 .setName("targetuser")
        //                 .setDescription("The player you want to play against.")
        //                 .setRequired(true)
        //                 )
        //         .addUserOption(option => 
        //             option
        //                 .setName("cardid")
        //                 .setDescription("The player you want to play against.")
        //                 .setRequired(true)
        //                 )
        //         .addUserOption(option => 
        //             option
        //                 .setName("position")
        //                 .setDescription("The player you want to play against.")
        //                 .setRequired(true)
        //                 ))
        ,
	async execute(interaction) {
        try {
            const user = await interaction.user.id
            const target = await interaction.options.getUser('targetuser');
            return subCommandSwitch(interaction);
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}