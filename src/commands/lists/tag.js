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

        case "wl":
            wlTag(interaction);
            break;

        case "tag":
            tagTag(interaction);
            break;

        case "lid":
            singleTag(interaction);
    }
}

async function cnameTag(interaction){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    if (tag) {
        if (tag.length > 35) {
            return interaction.reply(`Tag length is too large pick a different tag.`);
        }
    } else {
        tag = null;
    }
    
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
                characterID: {[Op.or]: cidList},
                lock: false
            }}
        );
    } else {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList},
                lock: false
            }}
        );
    }
    return interaction.reply(`Cards with name ${cname} have been tagged with ${tag}`);
}

async function cidTag(interaction){
    const uid = await interaction.user.id;
    const cid = await interaction.options.getInteger('id');
    const char = await database.Character.findOne({where: {characterID: cid}})
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    if (tag) {
        if (tag.length > 35) {
            return interaction.reply(`Tag length is too large pick a different tag.`);
        }
    } else {
        tag = null;
    }
    
    let cardList;
    if (rarity && tag) {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                rarity: rarity,
                playerID: uid,
                characterID: cid,
                lock: false
            }}
        );
    } else {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                playerID: uid,
                characterID: cid,
                lock: false
            }}
        );
    }
    return interaction.reply(`Cards of ${char.characterName} have been tagged with ${tag}`);
}

async function snameTag(interaction){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    if (tag) {
        if (tag.length > 35) {
            return interaction.reply(`Tag length is too large pick a different tag.`);
        }
    } else {
        tag = null;
    }
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
    if (rarity) {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                rarity: rarity,
                playerID: uid,
                characterID: {[Op.or]: cidList},
                lock: false
            }}
        );
    } else {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList},
                lock: false
            }}
        );
    }
    return interaction.reply(`Cards with series ${sname} have been tagged with ${tag}
I hope you know how many series were tagged.`);
}

async function sidTag(interaction){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    if (tag) {
        if (tag.length > 35) {
            return interaction.reply(`Tag length is too large pick a different tag.`);
        }
    } else {
        tag = null;
    }
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
    let cardList;
    console.log(cidList);
    if (rarity && tag) {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                rarity: rarity,
                playerID: uid,
                characterID: {[Op.or]: cidList},
                lock: false
            }}
        );
    } else {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList},
                lock: false
            }}
        );
    }
    return interaction.reply(`Cards in sid ${sid} have been tagged with ${tag}`);
}
async function justTag(interaction){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    
    if (tag) {
        console.log(tag.length);
        if (tag.length > 35) {
            return interaction.reply(`Tag length is too large pick a different tag.`);
        }
    } else {
        tag = null;
    }
    if (rarity) {
        await database.Card.update({tag :tag},
            {
                where: {
                rarity: rarity,
                playerID: uid,
                lock: false
            }}
        );
    } else {
        await database.Card.update({tag :tag},
            {
                where: {
                playerID: uid,
                lock: false
            }}
        );
        
    }
    return interaction.reply(`Cards have been tagged with ${tag}`);
}

async function gacha(interaction) {
    const user = interaction.user.id;
    const rngRarity = Math.floor(Math.random() * 1000);
    const wlist = await database.Wishlist.findAll({where: {playerID: user}})
    const rngChar = Math.floor(Math.random() * 1000);
    const char = (rngChar%wlist.length);
    const cid = await wlist[char].characterID;
    await raritySwitch(cid, rngRarity, interaction);
}



async function wlTag(interaction){
    const uid = await interaction.user.id;
    const wlist = await database.Wishlist.findAll({where: {playerID: uid}});
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    let cidList = [];
    for (let i = 0; i < wlist.length; i++) {
        const cid = wlist[i].characterID;
        cidList[i] = cid;
    }
    if (tag) {
        console.log(tag.length);
        if (tag.length > 35) {
            return interaction.reply(`Tag length is too large pick a different tag.`);
        }
    } else {
        tag = null;
    }
    if (rarity) {
        await database.Card.update({tag :tag},
            {
                where: {
                rarity: rarity,
                playerID: uid,
                characterID: {[Op.or]: cidList},
                lock: false
            }}
        );
    } else {
        await database.Card.update({tag :tag},
            {
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList},
                lock: false
            }}
        );
        
    }
    return interaction.reply(`Cards of characters from wishlist have been tagged with ${tag}`);
}

async function tagTag(interaction){
    const uid = await interaction.user.id;
    let searchtag = await interaction.options.getString("searchtag");
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("settag");
    if (tag) {
        console.log(tag.length);
        if (tag.length > 35) {
            return interaction.reply(`Tag length is too large pick a different tag.`);
        }
    } else {
        tag = null;
    }

    if (!searchtag) {
        searchtag = null;
    }

    let cardList;
    if (rarity) {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                rarity: rarity,
                playerID: uid,
                tag: searchtag,
                lock: false
            }}
        );
    } else {
        cardList = await database.Card.update({tag :tag},
            {
                where: {
                playerID: uid,
                tag: searchtag,
                lock: false
            }}
        );
        
    }
    return interaction.reply(`Cards with tag ${searchtag}have been tagged with ${tag}`);
}

async function singleTag(interaction){
    const uid = await interaction.user.id;
    const lid = await interaction.options.getInteger("lid")
    const tag = await interaction.options.getString("tag");
    const card = await database.Card.findOne({where: {playerID: uid, inventoryID:lid}})
    if (card) {
        if (card.lock) {
            return interaction.reply(`Card ${lid} is locked`);
        }
    } else {
        return interaction.reply(`Card ${lid} is doesn't exist.`);
    }
    if (tag) {
        if (tag.length > 35) {
            return interaction.reply(`Tag length is too large pick a different tag.`);
        }
        await database.Card.update({tag: tag}, {where: {playerID: uid, inventoryID: lid}})
        return interaction.reply(`${lid} have been tagged with ${tag}`);
    } else {
        await database.Card.update({tag: null}, {where: {playerID: uid, inventoryID: lid}})
        return interaction.reply(`${lid}'s tag have been removed.`);
    }
    
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
                .setDescription("Single or Bulk tag with filters based on character name.")
                .addStringOption(option => 
                    option
                        .setName("name")
                        .setDescription("The name you want to find and tag")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Tag you want to apply, leave empty if you want to remove tags")
                        .setRequired(false)
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
                        .addChoice('diamond',6)
                        ))
                
        .addSubcommand(subcommand =>
            subcommand
                .setName("cid")
                .setDescription("Single or Bulk tag with filters based on character id.")
                .addIntegerOption(option => 
                    option
                        .setName("id")
                        .setDescription("The id of the character")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Tag you want to apply, leave empty if you want to remove tags")
                        .setRequired(false)
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
                        .addChoice('diamond',6)
                        )
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName("sname")
                .setDescription("Single or Bulk tag with filters based on series name.")
                .addStringOption(option => 
                    option
                        .setName("sname")
                        .setDescription("The series you want find")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Tag you want to apply, leave empty if you want to remove tags")
                        .setRequired(false)
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
                        .addChoice('diamond',6)
                        )
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName("sid")
                .setDescription("Single or Bulk tag with filters based on series id.")
                .addIntegerOption(option => 
                    option
                        .setName("sid")
                        .setDescription("The id of the series")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Tag you want to apply, leave empty if you want to remove tags")
                        .setRequired(false)
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
                        .addChoice('diamond',6)
                        )
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName("base")
                .setDescription("Bulk tag all cards within the filter.")
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Tag you want to apply, leave empty if you want to remove tags")
                        .setRequired(false)
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
                        .addChoice('diamond',6)
                        )
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName("wl")
                .setDescription("Bulk tag all cards matching your wishlist.")
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Tag you want to apply, leave empty if you want to remove tags")
                        .setRequired(false)
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
                        .addChoice('diamond',6)
                        )
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName("tag")
                .setDescription("Tag cards with the chosen tags, or cards with no tags if empty")
                .addStringOption(option => 
                    option
                        .setName("searchtag")
                        .setDescription("Tag you want to filter, leave empty to tag all nontag cards.")
                        .setRequired(false)
                        )
                .addStringOption(option => 
                    option
                        .setName("settag")
                        .setDescription("Tag you want to apply, leave empty if you want to remove tags")
                        .setRequired(false)
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
                        .addChoice('diamond',6)
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
                        .setDescription("Tag you want to apply, leave empty if you want to remove tags")
                        .setRequired(false)
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