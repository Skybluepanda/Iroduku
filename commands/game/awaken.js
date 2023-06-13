const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild, Collection } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()



async function viewPurpleCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
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
    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${char.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${char.characterName}`);
        }
    }
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID: ** ${card.inventoryID} | **CID: ** ${cid}
**Series: ** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity: ** Amethyst
**Weapon: ** ${card.quantity-1} awaken attempts
**Date Pulled: ** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setFields({name: 'Awaken Info', 
value: `Awaken will cost 1000 coins and will attempt
to awaken your cards for a chance to equip them
with a weapon.`})
        .setColor(color.purple);
        const row = await createButton();
        msg = await interaction.reply({embeds: [embedCard], components: [row], fetchReply: true});
        await buttonManager(embedCard, interaction, msg, card, card.quantity-1, card.rarity);
}

async function viewRedCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
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
    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${char.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${char.characterName}`);
        }
    }
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID: ** ${card.inventoryID} | **CID: ** ${cid}
**Series: ** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity: **Ruby
**Weapon: **${card.quantity-1} awaken attempts
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setFields({name: 'Awaken Info', 
value: `Awaken will cost 1000 coins and will attempt
to awaken your cards for a chance to equip them
with a weapon.`})
        .setColor(color.red);
    const row = await createButton();
    msg = await interaction.reply({embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(embedCard, interaction, msg, card, card.quantity-1, card.rarity);
}

async function viewDiaCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    if(!card.quantity) {
        await card.update({quantity: 1});
    }
    let image;
    let url;
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: card.imageID}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*Set image with /diaset*`).setImage(url)
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
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
    }
    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${char.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${char.characterName}`);
        }
    }
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID: ** ${card.inventoryID} | **CID:** ${cid}
**Series: ** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity: **Diamond
**Weapon: **${card.quantity-1} awaken attempts
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setFields({name: 'Awaken Info', 
        value: `Awaken will cost 1000 coins and will attempt
        to awaken your cards for a chance to equip them
        with a weapon.`})
        .setColor(color.diamond);
    const row = await createButton();
    msg = await interaction.reply({embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(embedCard, interaction, msg, card, card.quantity-1, card.rarity);
}

async function viewPinkCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    let image;
    let url;
    if(!card.quantity) {
        await card.update({quantity: 1});
    }
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: card.imageID}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*Set image with /diaset*`).setImage(url)
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
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
    }
    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${char.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${char.characterName}`);
        }
    }
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID: ** ${card.inventoryID} | **CID:** ${cid}
**Series: ** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity: **Pink Diamond
**Weapon: **${card.quantity-1} awaken attempts
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setFields({name: 'Awaken Info', 
value: `Awaken will cost 1000 coins and will attempt
to awaken your cards for a chance to equip them
with a weapon.`})
        .setColor(color.pink);
    const row = await createButton();
    msg = await interaction.reply({embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(embedCard, interaction, msg, card, card.quantity-1, card.rarity);
}

async function viewAzurCard(card, interaction) { 
    const Azurite = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const embedCard = new MessageEmbed();
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    if(!card.quantity) {
        await card.update({quantity: 0});
    }
    //all we get is inventory id and player id
    embedCard.setFooter(`Art by ${Azurite.artist}
*Upload your choice of image of the character using with /stellarupload*`).setImage(Azurite.imageURL);
    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${char.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${char.characterName}`);
        }
    }
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${card.characterID}
**Series: ** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity: **Stellarite
**Weapon: **${card.quantity-1} awaken attempts
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setFields({name: 'Awaken Info', 
value: `Awaken will cost 1000 coins and will attempt
to awaken your cards for a chance to equip them
with a weapon.`})
        .setColor(color.stellar);
    const row = await createButton();
    msg = await interaction.reply({embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(embedCard, interaction, msg, card, card.quantity, card.rarity);
}


async function viewSpeCard(card, interaction) { 
    const special = await database.Special.findOne({where: {cardID: card.cardID}});
    const embedCard = new MessageEmbed();
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    if(!card.quantity) {
        await card.update({quantity: 0});
    }
    //all we get is inventory id and player id
    embedCard.setFooter(`Art by ${special.artist}
*edit card with /spedit*`).setImage(special.imageURL)
    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${special.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${special.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${special.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${special.characterName}`);
        }
    }
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID}
**Series:** ${special.seriesName}
**Rank: **1!
**Rarity: Special**
**Weapon: **${card.quantity-1} awaken attempts
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setFields({name: 'Awaken Info', 
value: `Awaken will cost 1000 coins and will attempt
to awaken your cards for a chance to equip them
with a weapon.`})
        .setColor(special.color);
    const row = await createButton();
    msg = await interaction.reply({embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(embedCard, interaction, msg, card, card.quantity, card.rarity);
}


async function noeffect(embed, card, interaction, attempts) {
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    embed.setFields({name: 'Attmptes',value:`${attempts}`});
    await interaction.editReply({embeds: [embed], fetchReply: true})
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

async function gamble(rarity, attempts) {
    let rare;
    let epic;
    let legendary;
    const rng = Math.floor(Math.random() * 1000);
    switch (await rarity) {
        case 4:
            //rare 5%
            //epic 1%
            //legendary .001%kekdog
            rare = 800-(attempts*30);
            epic = 950-(attempts*5);
            legendary = 999;
            break;

        case 5://ruby
            //rare 1%
            //epic .2%
            //legendary .001%kekdog
            rare = 920-(attempts*5);
            epic = 980-attempts;
            legendary = 999-(attempts/10);
            console.log(rare);
            break;

        case 6://dia
            //rare 5%
            //epic 1%
            //legendary .001%kekdog
            rare = 960-attempts*1;
            epic = 980-attempts*2;
            legendary = 999-(attempts/10);
            break;

        case 7://pinkdia
            //rare 5%
            //epic 1%
            //legendary .001%kekdog
            rare = 920-(attempts*5);
            epic = 980-attempts;
            legendary = 999-attempts/10;
            break;

        case 9://stellar
            //epic .1%
            //legendary .01%kekdog
            rare = 10000;
            epic = 995-attempts;
            legendary = 999-attempts/10;
            break;
    }
    console.log(rng);
    if (rng > legendary) {
        return 3;
    } else if (rng > epic) {
        return 2;
    } else if (rng > rare) {
        return 1;
    } else {
        return 0;
    }
}

async function convertRarity(rarity) {
    switch (rarity) {
        case 1:
            return "Rare";
        case 2:
            return "Epic";
        case 3:
            return "Legendary";
    }
}

async function createWeapon(rarity, embed, card, interaction, attempts) {
    const weaponCount = await database.Weapon.count({where: {rarity: rarity}});
    console.log(weaponCount);
    const rng = await Math.floor(Math.random() * 1000);
    const offset = (rng%weaponCount);
    console.log(`${rarity} ${offset}`);
    const weaponRNG = await database.Weapon.findOne({offset:offset, where: {rarity:rarity}})
    card.update({ quantity: 0 , weapon: weaponRNG.id});
    const rarityText = await convertRarity(rarity);
    embed.setFields({name: `Card Awakened!`,value:`
Awakened Success after ${attempts} attempts!
${rarityText} weapon ${weaponRNG.name} bound to the card!
`}).setThumbnail(weaponRNG.weaponSprite);
    return interaction.editReply({embeds: [embed]});
}

async function createTheWeapon(embed, card, interaction, attempts, weaponRNG) {
    card.update({ quantity: 0 , weapon: weaponRNG.id});
    embed.setFields({name: `Card Awakened!`,value:`
Awakened Success after ${attempts} attempts!
weapon ${weaponRNG.name} bound to the card!
`}).setThumbnail(weaponRNG.weaponSprite);
    return interaction.editReply({embeds: [embed]});
}

async function buttonManager(embed, interaction, msg, card, attempts, rarity) {
    try {
        const uid = interaction.user.id;
        if(attempts == -1) {
            return;
        }
        const weapon = await interaction.options.getInteger("wid");
        const player = await database.Player.findOne({where: {playerID: interaction.user.id}});
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            i.deferUpdate();
            switch (i.customId){
                case 'gone':
                    if(weapon) {
                        const weaponid = await database.Weapon.findOne({where: { id: weapon}});
                        if (weaponid) {
                            return await createTheWeapon(embed, card, interaction, attempts, weaponid);
                        } else {
                            return interaction.channel.send("the weapon doesn't exist.")
                        }
                    }
                    if (player.money < 500) {
                        return interaction.followUp(`You need at least 1000 coins to awaken.`)
                    }
                    attempts += 1;
                    await card.increment('quantity', {by: 1});
                    await player.increment('money', {by: -1000});
                    const result = await gamble(rarity, attempts);
                    if (result > 0) {
                        return await createWeapon(result, embed, card, interaction, attempts);
                    }
                    await noeffect(embed, card, interaction, attempts);
                    await buttonManager(embed, interaction, msg, card, attempts, rarity);
                    break;
                
                case 'gten':
                    var i = 0;
                    if (player.money < 10000) {
                        return interaction.followUp(`You need at least 10000 coins to roll 10 times.`)
                    }
                    while (i < 10){
                        await card.increment('quantity', {by: 1});
                        await player.increment('money', {by: -1000});
                        attempts += 1;
                        const result = await gamble(rarity, attempts);
                        if (result > 0) {
                            return await createWeapon(result, embed, card, interaction, attempts);
                        }
                        await noeffect(embed, card, interaction, attempts);
                        i++;
                    }
                    await buttonManager(embed, interaction, msg, card, attempts, rarity);
                    break;
            }});
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}


async function switchRarity(card, rarity, interaction) {
    switch (rarity) {
        case 4:
            return viewPurpleCard(card, interaction);
            //Purple
        case 5:
            return viewRedCard(card, interaction);
            //red
        case 6:
            return viewDiaCard(card, interaction);

        case 7:
            return viewPinkCard(card, interaction);

        case 9:
            return viewAzurCard(card, interaction);

        default:
            return "error";
            //wtf?
    }
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('awaken')
		.setDescription('Attempt to awaken a card with Amethyst Rarity or Higher')
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("The inventory id of the card.")
                .setRequired(true)
                )
        .addIntegerOption(option => 
            option
                .setName("wid")
                .setDescription("The weapon u want.")
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
            if (card) {
                if (card.rarity >= 5) {
                    if(card.rarity == 10) {
                        return interaction.reply("Can't awaken awakened special cards.");
                    }
                    if (card.weapon) {
                        return interaction.reply("Can't awaken awakened cards.");
                    }
                    if (player.money < 500) {
                        return interaction.reply(`You need at least 500 coins to awaken.`)
                    } else {
                        await switchRarity(card, card.rarity, interaction);
                    }
                } else {
                    return interaction.reply(`Card ${lid} is not amethyst or higher rarity Card. Check your list.`)
                }
            } else {
                return interaction.reply(`Card ${lid} doesn't exist. Check your list.`)
            }
        } catch (error) {
            return interaction.channel.send("Error has occured");
        }
	},
};