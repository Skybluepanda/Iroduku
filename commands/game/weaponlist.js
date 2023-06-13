const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild, Message } = require('discord.js');
const { Op } = require("sequelize");
const { MessageActionRow, MessageButton } = require('discord.js');

/**
 * Creates an embed for the command.
 * @param {*} interaction the interaction that the bot uses to reply.
 * @returns an embed template for the command.
 */
function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Listing Weapons")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("List of Weapons")
        .setColor("#00ecff")
    
    return embed;
}

async function checkPage(direction, page, maxPage) {
    if (direction == 1 && page == maxPage) {
        return 1;
    } else if (direction == -1 && page == 1) {
        return maxPage;
    } else {
        return page + direction;
    }
}

async function weaponListSwitch(embed, interaction, page){
    const subCommand = await interaction.options.getSubcommand();
    switch (subCommand) {
        case "id":
            justList(embed, interaction, page);
            break;

        case "name":
            nameList(embed, interaction, page);
            break;

        case "rank":
            rankList(embed, interaction, page);
            break;
    }
}

async function weaponListSwitch2(embed, interaction, page) {
    const subCommand = await interaction.options.getSubcommand();
    switch (subCommand) {

        case "id":
            justList(embed, interaction, page);
            break;

        case "name":
            nameList(embed, interaction, page);
            break;

        case "rank":
            rankList(embed, interaction, page);
            break;
    }
}

async function updateReply(interaction, embed){
    return await interaction.editReply({embeds: [embed]});
}

async function deployButton(interaction, embed){
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('prev')
                .setLabel('previous')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('next')
                .setLabel('next')
                .setStyle('PRIMARY'),
        );
    await interaction.editReply({ embeds: [embed], components: [row]});
}

async function buttonManager(embed, interaction, msg, page, maxPage) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    const prevPage = await checkPage(-1, page, maxPage);
                    await weaponListSwitch2(embed, interaction, prevPage);
                    break;
                
                case 'next':
                    const nextPage = await checkPage(1, page, maxPage);
                    await weaponListSwitch2(embed, interaction, nextPage);
                    break;
                
                default:
                    break;
            };
            i.deferUpdate();
        }
        );
    } catch(error) {
    }
}

function joinBar(weapon){
    // const series = await database.Series.findOne({where: {seriesID: character.seriesID}});
    const weaponList = weapon.id + " | " + weapon.name + " [" +weapon.class+ "]";
    // if (series) {
    //      - " + series.alias;
    // } else {
    //     charlist = character.characterID + " | " + character.characterName + " [" + character.rank+ "] - No series alias set";
    // }
    //CID | Cname -Rank- Series shortened
    return weaponList;
}

async function justList(embed, interaction, page){
    const maxPage =  Math.ceil(await database.Weapon.count()/20);
    if (maxPage > 1) {
        deployButton(interaction, embed);
    }
    const list = await database.Weapon.findAll(
        {
            order: ['id'],
            limit: 20,
            offset: (page-1)*20
        }
    );
    console.log(list);
    const listMap = await list.map(joinBar);
    const listString = await listMap.join(`\n`);
    await embed.setDescription(`${listString}`);
    const total = await database.Weapon.count();
    await embed.setFooter({text: `page ${page} of ${maxPage} | ${total} results found`});
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
};


async function nameList(embed, interaction, page){
    const name = await interaction.options.getString('name');
    const maxPage =  Math.ceil(await database.Weapon.count({
        where: {
            name: {[Op.like]: '%' + name + '%'}
    }}
        )/20);
    if (maxPage > 1) {
        deployButton(interaction, embed);
    }
    const list = await database.Weapon.findAll(
        {
            order: ['id'],
            limit: 20,
            offset: (page-1)*20,
        where: {
            name: {[Op.like]: '%' + name + '%'}
        }}
        );

    const listMap = await list.map(joinBar);
    const listString = await listMap.join(`\n`);
    await embed.setDescription(`${listString}`);
    const total = await database.Weapon.count({where: {
        name: {[Op.like]: '%' + name + '%'}
    }});
    await embed.setFooter({text: `page ${page} of ${maxPage} | ${total} results found`});
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
};

async function rankList(embed, interaction, page){
    const rank = await interaction.options.getInteger('rank');
    const list = await database.Weapon.findAll(
        {
        order: [['final', 'DESC']],
        limit: 20,
        offset: (page-1)*20,
        where: {
            rarity: rank
        }});
    const maxPage =  Math.ceil(await database.Weapon.count({where: {
        rank: rank
    }})/20);
    
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const listMap = await list.map(joinBar);
    const listString = await listMap.join(`\n`);
    await embed.setDescription(`${listString}`);
    const total = await database.Weapon.count({where: {
        rarity: rank
    }});
    await embed.setFooter({text: `page ${page} of ${maxPage} | ${total} results found`});
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
};


/**
 * Listing series
 * Options
 * Name search
 * List all with buttons.
 * Lets say list 20 items per embed
 * Next page, previous page, go to specific page.
 * 
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('weaponlist')
		.setDescription('Shows a list of weapons')
        .addSubcommand(subcommand => 
            subcommand
                .setName("id")
                .setDescription("list by ID"))
        .addSubcommand(subcommand => 
            subcommand
                .setName("name")
                .setDescription("Search by name of characters")
                .addStringOption(option => 
                    option
                        .setName("name")
                        .setDescription("Lists characters that have the same name.")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("rank")
                .setDescription("Search by rarity.")
                .addIntegerOption(option => 
                    option
                        .setName("rank")
                        .setDescription("The rank you want to list.")
                        .setRequired(true)
                        .addChoice('rare', 1)
                        .addChoice('epic', 2)
                        .addChoice('legendary', 3)
                        )),
	async execute(interaction) {
        if (!interaction.options.getSubcommand()) {
            return interaction.reply("Error use subcommands.");
        }
        const embed = createEmbed(interaction);
        
        try {
            await interaction.reply({embeds: [embed]});
            weaponListSwitch(embed, interaction, 1);            
        } catch(error) {
            return interaction.reply("Error has occured");
        }
        
	}
};