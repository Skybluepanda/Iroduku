const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');



function embedSucess(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Listing Inventory")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`List of ${interaction.user.username} Cards`)
        .setColor(color.aqua)
    
    return embed;
}

async function listSwitch(interaction){
    const subCommand = await interaction.options.getSubcommand();
    switch (subCommand) {
        case "cname":
            cnameTag(interaction);
            break;
        
        case "cid":
            cidTag(interaction);
            break;

        case "sname":
            snameTag(interaction);
            break;

        case "sid":
            sidTag(interaction);
            break;

        case "base":
            justTag(interaction);
            break;

        case "lid":
            singleTag(interaction);
    }
}

async function cnameTag(interaction){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    
    const cname = await interaction.options.getString('name');
    const charList = await database.Character.findAll(
        {
            where: {
                characterName: {[Op.like]: '%' + cname + '%'}
            }
        }
    );
    var cidList = [];
    for (let i = 0; i < charList.length; i++) {
        const cid = charList[i].characterID;
        cidList[i] = cid;
    }
    let cardList
    if (rarity && tag) {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    } else {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    }
    return interaction.reply(`${cardList.length} cards with name ${cname} have been tagged with ${tag}`);
}

async function cidTag(interaction){
    const uid = await interaction.user.id;
    const cid = await interaction.options.getInteger('id');
    const char = await database.findOne({where: {characterID: cid}})
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    
    let cardList;
    if (rarity && tag) {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: cid
            }}
        );
    } else {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                playerID: uid,
                characterID: cid
            }}
        );
    }
    return interaction.reply(`${cardList.length} cards of ${char.characterName} have been tagged with ${tag}`);
}

async function snameTag(interaction){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const sname = await interaction.options.getString('sname');
    const seriesList = await database.Series.findAll({
        where: {
            seriesName: {[Op.like]: '%' + sname + '%'},
        }}
            );
    var sidList = [];
    for (let i = 0; i < seriesList.length; i++) {
        const sid = seriesList[i].seriesID;
        sidList[i] = sid;
    }
    const charList = await database.Character.findAll({
        where: {
            seriesID: {[Op.or]: sidList}
        }}
    );
    var cidList = [];
    for (let i = 0; i < charList.length; i++) {
        const cid = charList[i].characterID;
        cidList[i] = cid;
    }
    let cardList
    if (rarity && tag) {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    } else {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    }
    return interaction.reply(`${cardList.length} cards with series ${sname} have been tagged with ${tag}
I hope you know how many series were tagged.`);
}

async function sidTag(interaction){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const sid = await interaction.options.getInteger('sid');
    const charList = await database.Character.findAll(
        {where: {
            seriesID: sid
        }}
    );
    var cidList = [];
    for (let i = 0; i < charList.length; i++) {
        const cid = charList[i].characterID;
        cidList[i] = cid;
    }
    let cardList
    console.log(cidList);
    if (rarity && tag) {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    } else {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    }
    return interaction.reply(`${cardList.length} cards in sid ${sid} have been tagged with ${tag}`);
}
async function justTag(interaction){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    let cardList;
    if (rarity) {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                rarity: rarity,
                playerID: uid,
            }}
        );
    } else {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                playerID: uid,
            }}
        );
        
    }
    return interaction.reply(`${cardList.length} cards have been tagged with ${tag}`);
}

async function singleTag(interaction){
    const uid = await interaction.user.id;
    const lid = await interaction.options.getInteger("lid")
    const tag = await interaction.options.getString("tag");
    await database.Card.update({tag: tag}, {where: {playerID: uid, inventoryID: lid}})
    return interaction.reply(`${lid} have been tagged with ${tag}`);
}

/**
 * cname
 * cid
 * sname
 * sid
 * rarity choice
 * tags
 * 
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('tag')
		.setDescription('Single or Bulk tag with filters.')
        .addSubcommand(subcommand =>
            subcommand
                .setName("cname")
                .setDescription("Searches for a character with the name and lists your cards.")
                .addStringOption(option => 
                    option
                        .setName("name")
                        .setDescription("The name you want find")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Filter cards by tag")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        ))
                
        .addSubcommand(subcommand =>
            subcommand
                .setName("cid")
                .setDescription("Lists cards for character")
                .addIntegerOption(option => 
                    option
                        .setName("id")
                        .setDescription("The id of the character")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Filter cards by tag")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        )
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName("sname")
                .setDescription("Searches for a series with the name and lists your cards.")
                .addStringOption(option => 
                    option
                        .setName("sname")
                        .setDescription("The series you want find")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Filter cards by tag")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        )
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName("sid")
                .setDescription("Lists cards in series")
                .addIntegerOption(option => 
                    option
                        .setName("sid")
                        .setDescription("The id of the series")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Filter cards by tag")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        )
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName("base")
                .setDescription("Lists cards")
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Filter cards by tag")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        )
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName("lid")
                .setDescription("Applies tag to single card with list ID")
                .addIntegerOption(option => 
                    option
                        .setName("lid")
                        .setDescription("The inventory id u want to apply tag to")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Tag you want to apply")
                        .setRequired(true)
                        )),
	async execute(interaction) {
		const embed = embedSucess(interaction);
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
        //rarity filter
        //
        try {
            await listSwitch(interaction);
        } catch (error) {
            return interaction.editReply("Error has occured");
        }
	},
};