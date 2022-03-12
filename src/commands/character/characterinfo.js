const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');

/**
 * Creates an embed for the command.
 * @param {*} interaction the interaction that the bot uses to reply.
 * @returns an embed template for the command.
 */
function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Char Search")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Character Not Found. It's possible that the character doesn't exist.")
        .setColor(color.failred);
    
    return embed;
}

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('prev')
                    .setLabel('prev')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('next')
                    .setLabel('next')
                    .setStyle('PRIMARY')
            )
            // .addComponents(
            //     new MessageButton()
            //         .setCustomId('search')
            //         .setLabel('search')
            //         .setStyle('PRIMARY')
            // )
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function countImage(cid) {
    try {
        const char = await database.Character.findOne({where: {characterID: cid}});
        return await (char.imageCount);
    } catch(error) {
        console.log("Error has occured in countImageg");
    }
}

async function countGif(cid) {
    try {
        const char = await database.Character.findOne({where: {characterID: cid}});
        return await (char.gifCount);
    } catch(error) {
        console.log("Error has occured in countImageg");
    }
}

async function checkInumber(embed, interaction, direction, currentImage, totalImage, imageC, cid){
    try {
        if (currentImage == 1 && direction == -1){
            currentImage = totalImage;
            //going to end of page. If there is a gif view gif, else view image.
        } else if (currentImage == totalImage && direction == 1){
            currentImage = 1;
        } else {
            currentImage += direction;
        }
        await currentImage;
        if (currentImage <= imageC) {
            await viewImage(embed, interaction, currentImage, cid);
        } else {
            const image = currentImage - imageC
            await viewGif(embed, interaction, image, cid);
        }
        await updateEmbed(embed, interaction);
        await buttonManager(embed, interaction, msg, currentImage, totalImage, imageC, cid);
    } catch(error) {
        console.log("Error has occured in checkInumber");
    }
}

async function buttonManager(embed, interaction, msg, currentImage, totalImage, imageC, cid) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    checkInumber(embed, interaction, -1, currentImage, totalImage, imageC, cid);
                    
                    break;
                
                case 'next':
                    checkInumber(embed, interaction, 1, currentImage, totalImage, imageC, cid);
                    break;
                
                case 'search':
                    await interaction.followUp('search is not functional.');
                    buttonManager(embed, interaction, msg, currentImage, totalImage, imageC, cid);
                    break;
            };
            i.deferUpdate();
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}
async function subcommandProcess(embed, interaction) {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
        case "name":
            cinfoName(embed, interaction);
            break;
        
        case "id":
            cinfoID(embed, interaction);
            break;
            
        default:
            interaction.reply("Please use the subcommands");
            break;
    }
}

async function cinfoName(embed, interaction) {
    try {
        const cname = interaction.options.getString("name");
        if (cname.length < 3){
            return interaction.reply("Short names will yield a large list of characters. Use /clist command to find the id than try again with the cinfo id subcommand.");
        } else {
            const charCount = await database.Character.count({ 
                where: { characterName: {[Op.like]: '%' + cname + '%'},}
            })
            console.log(charCount);
            switch (charCount) {
                case 0:
                    interaction.reply({embeds: [embed]});
                    break;
                
                case 1:
                    return sendEmbed(interaction, embed);

                default:
                    charList(interaction, embed);
                };
        } 
    } catch(error) {
        console.log("error has occured in cinfoName");
    }
}

function joinBar(character){
    return [character.characterID, character.characterName].join("| ");
}

async function charList(interaction, embed){
    try {
        const cname = interaction.options.getString("name");
        const list = await database.Character.findAll(
            {attributes: ['characterID', 'characterName'],
            order: ['characterID'],
            limit: 20,
            where: {
                characterName: {[Op.like]: '%' + cname + '%'},
            }}
        );
        const listString = await list.map(joinBar).join(`\n`);
        await embed
            .setTitle("Multiple characters with same name found")
            .setDescription(`
            ${listString}
            If there are 20 listed characters and you don't see yours, try /clist!`)
            .setColor(color.aqua);
        return await interaction.reply({embeds: [embed]});
    } catch(error) {
        console.log("Error has occured with charList");
    }
}

async function viewImage(embed, interaction, imageNumber, cid) {
    try {
        var art = await database.Image.findOne({
            offset: imageNumber-1, 
            order: [['imageNumber', 'ASC']],
            where: {
                characterID: cid,}
            })
        const url = art.imageURL;
        const artist = art.artist;
        const uploader = art.uploader;
        const footer = `
        #${art.imageNumber} Art by ${artist} | Uploaded by ${uploader}\nImage ID is ${art.imageID} report any errors using ID.
        `;
        await embed
            .setImage(url)
            .setFooter(`${footer}`)
    } catch(error) {
        console.log("error has occured with view image");
    }
}

async function viewGif(embed, interaction, gifNumber, cid) {
    try {
        var art = await database.Gif.findOne({
            offset: gifNumber-1, 
            order: [['gifNumber', 'ASC']],
            where: {
                characterID: cid,}
            })
        const url = art.gifURL;
        const artist = art.artist;
        const uploader = art.uploader;
        const footer = `
        #${art.gifNumber} Gif from ${artist} | Uploaded by ${uploader}
Gif ID is ${art.gifID} report any errors using ID.
        `;
        await embed
            .setImage(url)
            .setFooter(`${footer}`)
    } catch(error) {
        console.log("error has occured with view image");
    }
}

async function updateEmbed(embed, interaction){
    await interaction.editReply({ embeds:[embed], fetchReply: true});
}

async function isMain(embed, cid) {
    const main = await interaction.Character.findAll({})
}

async function cinfoID(embed, interaction) {
    try {
        const cid = await interaction.options.getInteger("id");
        const char = await database.Character.findOne({
            where: {
                characterID: cid
            }
        })

        if (char) {
            if (char.imageCount > 0){
                await viewImage(embed, interaction, 1, cid);
                } else if(char.gifCount > 0){
                    await viewGif(embed, interaction, 1, cid)
                } else {
                embed.addField('No images found', 'add some', true);
            }
        const imageC = await countImage(cid);
        const gifC = await countGif(cid);
        const totalImage = imageC + gifC;
        const series = await database.Series.findOne({ where: { seriesID: char.seriesID}})
        const simps = await database.Wishlist.count({where: {characterID: cid}});
        await embed
            .setDescription(`
Character ID: ${char.characterID}
Character Alias: ${char.alias}
Simps: ${simps}
Rank: ${char.rank}
Series: ${char.seriesID} | ${series.seriesName}
Image Count: ${char.imageCount}
Gif Count: ${char.gifCount}
            `)
            .setTitle(`${char.characterName}`)
            .setColor(color.successgreen);
        const row = await createButton();
        msg = await interaction.reply( {embeds: [embed], components: [row], fetchReply: true});
        await buttonManager(embed, interaction, msg, 1, totalImage, imageC, cid);
        }
    } catch(error) {
        console.log("error has occured in cinfoID.");
    }
}

async function sendEmbed(interaction, embed) {
    try {
        const cname = interaction.options.getString("name")
        const char = await database.Character.findOne({
            where: { characterName: {[Op.like]: '%' + cname + '%'},}
            });
        const series = await database.Series.findOne({ where: { seriesID: char.seriesID}})
        const cid = await char.characterID;
        const imageC = await countImage(cid);
        const gifC = await countGif(cid);
        const totalImage = imageC + gifC;
        if (char) {
            if (char.imageCount > 0){
            await viewImage(embed, interaction, 1, cid);
            } else if(char.gifCount > 0){
                await viewGif(embed, interaction, 1, cid)
            } else {
            embed.addField('No images found', 'add some', true);
        }
        const simps = await database.Wishlist.count({where: {characterID: cid}});
        await embed
            .setDescription(`
Character ID: ${char.characterID}
Character Alias: ${char.alias}
Simps: ${simps}
Rank: ${char.rank}
Series: ${char.seriesID} | ${series.seriesName}
Image Count: ${char.imageCount}
Gif Count: ${char.gifCount}
            `)
            .setTitle(`${char.characterName}`)
            .setColor(color.successgreen);
        const row = await createButton();
        msg = await interaction.reply( {embeds: [embed], components: [row], fetchReply: true});
        await buttonManager(embed, interaction, msg, 1, totalImage, imageC, cid);
        }
    } catch(error){
        console.log("error has occured in sendEmbed.");
    }
    
}




module.exports = {
	data: new SlashCommandBuilder()
		.setName('ci')
		.setDescription('Shows information of a character')
        .addSubcommand(subcommand =>
            subcommand
                .setName("name")
                .setDescription("Searches for a character with the name and displays info if they are unique.")
                .addStringOption(option => 
                    option
                        .setName("name")
                        .setDescription("The name you want find")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("id")
                .setDescription("Finds info of a character")
                .addIntegerOption(option => 
                    option
                        .setName("id")
                        .setDescription("The id of the character")
                        .setRequired(true)
                        )),
	async execute(interaction) {
		const embed = createEmbed(interaction);
        try {
            await subcommandProcess(embed, interaction);
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}