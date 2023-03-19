const { SlashCommandBuilder } = require('@discordjs/builders');
const { createCanvas, loadImage, Canvas } = require('canvas');
const database = require('../../database.js');
const { MessageEmbed, MessageActionRow, MessageButton  } = require('discord.js');
const { MessageAttachment } = require('discord.js');
const color = require('../../color.json');

async function embedNew(interaction) {
    const embedNew = new MessageEmbed();
    embedNew.setTitle("Deck Command")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Command is running.`)
        .setColor(color.purple)
    return embedNew;
};


async function newDeckNumber(interaction) {
    const uid = interaction.user.id;
    const lastDeck = await database.Deck.findOne({order: [['deckNumber', 'DESC'],], where: {playerID: uid}});
    if (!lastDeck) {
        return 1;
    } else {
        if (lastDeck.deckNumber == 10) {
            interaction.followUp(`Maximum of 10 decks reached.`)
            return 11;
        } else {
            console.log(lastDeck.deckNumber);
            const deckNum = lastDeck.deckNumber+1;
            console.log(deckNum);
            return deckNum;
        }
    }
}

async function getUnitImage(card) {
    let imageURL
    if (card.rarity == 9) {
        const stellar = await database.Azurite.findOne({where: {cardID: card.cardID}});
        imageURL = stellar.imageURL;
    } else {
        if (card.imageNumber > 0) {
            const image = await database.Image.findOne({where: {characterID: card.characterID, imageNumber: card.imageNumber}});
            imageURL = image.imageURL;
        } else {
            const char = await database.Character.findOne({where: {characterID: card.characterID}});
            if(char.imageCount > 0) {
                //get the first image.
                const image = await database.Image.findOne({where: {characterID: card.characterID, imageNumber: 1}});
                imageURL = image.imageURL;
            } else {
                imageURL = 'https://cdn.discordapp.com/attachments/948195855742165013/998254327523180685/stockc.png';
            }
        }
        //fetch chosen image or image 1 if gif or hitomi img lmao.

    }
    return imageURL;
}

async function getWeaponImage(card) {
    const weapon = await database.Weapon.findOne({where: {id: card.weapon}});
    const imageURL = weapon.weaponSprite;
    return weapon;
}

async function switchRarityColour(card) {
    const rarity = card.rarity;
    switch (rarity) {
        case 4:
            return color.purple;
        case 5:
            return color.red;
        case 6:
            return color.diamond;
        case 7:
            return color.pink;
        case 9:
            return color.stellar;
    }
}

async function cardCharID(card) {
    const char = await database.Character.findOne({where: {characterID: card.characterID}});
    return char.characterName;
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

async function viewDeckLineup(interaction, deck) {
    const uid = await interaction.user.id;
    const card1 = await database.Card.findOne({where: {playerID: uid, inventoryID: deck.unit1}});
    const card2 = await database.Card.findOne({where: {playerID: uid, inventoryID: deck.unit2}});
    const card3 = await database.Card.findOne({where: {playerID: uid, inventoryID: deck.unit3}});
    const card4 = await database.Card.findOne({where: {playerID: uid, inventoryID: deck.unit4}});
    const card5 = await database.Card.findOne({where: {playerID: uid, inventoryID: deck.unit5}});
    const unit1ImgURL = await getUnitImage(card1);
    const unit2ImgURL = await getUnitImage(card2);
    const unit3ImgURL = await getUnitImage(card3);
    const unit4ImgURL = await getUnitImage(card4);
    const unit5ImgURL = await getUnitImage(card5);
    const img1 = await loadImage(unit1ImgURL);
    const img2 = await loadImage(unit2ImgURL);
    const img3 = await loadImage(unit3ImgURL);
    const img4 = await loadImage(unit4ImgURL);
    const img5 = await loadImage(unit5ImgURL);
    const unit1Weapon = await getWeaponImage(card1);
    const unit2Weapon = await getWeaponImage(card2);
    const unit3Weapon = await getWeaponImage(card3);
    const unit4Weapon = await getWeaponImage(card4);
    const unit5Weapon = await getWeaponImage(card5);
    const wpn1 = await loadImage(unit1Weapon.weaponSprite);
    const wpn2 = await loadImage(unit2Weapon.weaponSprite);
    const wpn3 = await loadImage(unit3Weapon.weaponSprite);
    const wpn4 = await loadImage(unit4Weapon.weaponSprite);
    const wpn5 = await loadImage(unit5Weapon.weaponSprite);
    const canvas = createCanvas(1125, 575);
    const context = canvas.getContext('2d');
    context.drawImage(img1, 0, 0, 225, 350);
    context.drawImage(img2, 225, 0, 225, 350);
    context.drawImage(img3, 450, 0, 225, 350);
    context.drawImage(img4, 675, 0, 225, 350);
    context.drawImage(img5, 900, 0, 225, 350);
    context.drawImage(wpn1, 0, 350, 225, 225);
    context.drawImage(wpn2, 225, 350, 225, 225);
    context.drawImage(wpn3, 450, 350, 225, 225);
    context.drawImage(wpn4, 675, 350, 225, 225);
    context.drawImage(wpn5, 900, 350, 225, 225);
    const col1 = await switchRarityColour(card1);
    const col2 = await switchRarityColour(card2);
    const col3 = await switchRarityColour(card3);
    const col4 = await switchRarityColour(card4);
    const col5 = await switchRarityColour(card5);
    const charname1 = await cardCharID(card1);
    const charname2 = await cardCharID(card2);
    const charname3 = await cardCharID(card3);
    const charname4 = await cardCharID(card4);
    const charname5 = await cardCharID(card5);
    const w1r = await convertRarity(unit1Weapon.rarity);
    const w2r = await convertRarity(unit2Weapon.rarity);
    const w3r = await convertRarity(unit3Weapon.rarity);
    const w4r = await convertRarity(unit4Weapon.rarity);
    const w5r = await convertRarity(unit5Weapon.rarity);
    context.strokeStyle = col1;
    context.lineWidth = 4;
    context.strokeRect(2, 2, 221, 346);
    context.strokeStyle = col2;
    context.strokeRect(227, 2, 221, 346);
    context.strokeStyle = col3;
    context.strokeRect(452, 2, 221, 346);
    context.strokeStyle = col4;
    context.strokeRect(677, 2, 221, 346);
    context.strokeStyle = col5;
    context.strokeRect(902, 2, 221, 346);
    const attachment = await new MessageAttachment(canvas.toBuffer(), 'ayaka.png');
    await interaction.editReply({ files: [attachment] });
    const message = await interaction.fetchReply();
    message.attachments.forEach(attachment => {
        const link = attachment.proxyURL;
        deck.update({deckImage: link});
    })
    const embed = new MessageEmbed();
    embed.setTitle(`Deck ${deck.deckID} | ${deck.deckName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Deck Info`)
        .addFields({name: `Position 1: ${charname1}`, value: `${unit1Weapon.id} | ${unit1Weapon.name}
${w1r} ${unit1Weapon.class}`})
        .addFields({name: `Position 2: ${charname2}`, value: `${unit2Weapon.id} | ${unit2Weapon.name}
${w2r} ${unit2Weapon.class}`})
        .addFields({name: `Position 3: ${charname3}`, value: `${unit3Weapon.id} | ${unit3Weapon.name}
${w3r} ${unit3Weapon.class}`})
        .addFields({name: `Position 4: ${charname4}`, value: `${unit4Weapon.id} | ${unit4Weapon.name}
${w4r} ${unit4Weapon.class}`})
        .addFields({name: `Position 5: ${charname5}`, value: `${unit5Weapon.id} | ${unit5Weapon.name}
${w5r} ${unit5Weapon.class}`})
        .setColor(color.successgreen)
        .setImage(deck.deckImage);
    await interaction.editReply({embeds: [embed]})
    return;
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
        return row;
    } catch(error) {
        console.log("error has occured in createButton");
    }
}

async function checkID(interaction, deckid, direction) {
    const uid = await interaction.user.id;
    const maxdeck = await database.Deck.findOne({order: [['deckNumber', 'DESC']],where: {playerID: uid}});
    let targetID = deckid + direction;
    if(targetID > maxdeck.deckNumber) {
        targetID = 1;
    } else if (targetID == 0) {
        targetID = maxdeck.deckNumber;
    }
    return targetID;
}

async function buttonManager(interaction, deckid, msg){
    try {
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    const newID = await checkID(interaction, deckid, -1);
                    await viewDeck(interaction, newID);
                    break;
                
                case 'next':
                    const nextID = await checkID(interaction, deckid, 1);
                    await viewDeck(interaction, nextID);
                    break;
                };
                i.deferUpdate();
            }
            );
        } catch(error) {
            console.log("Error has occured in button Manager");
        }
}

async function viewDeck(interaction, deckid) {
    const uid = await interaction.user.id;
    const deck = await database.Deck.findOne({where: {deckNumber: deckid, playerID: uid}});
    const card1 = await database.Card.findOne({where: {playerID: uid, inventoryID: deck.unit1}});
    const card2 = await database.Card.findOne({where: {playerID: uid, inventoryID: deck.unit2}});
    const card3 = await database.Card.findOne({where: {playerID: uid, inventoryID: deck.unit3}});
    const card4 = await database.Card.findOne({where: {playerID: uid, inventoryID: deck.unit4}});
    const card5 = await database.Card.findOne({where: {playerID: uid, inventoryID: deck.unit5}});
    const unit1Weapon = await getWeaponImage(card1);
    const unit2Weapon = await getWeaponImage(card2);
    const unit3Weapon = await getWeaponImage(card3);
    const unit4Weapon = await getWeaponImage(card4);
    const unit5Weapon = await getWeaponImage(card5);
    const charname1 = await cardCharID(card1);
    const charname2 = await cardCharID(card2);
    const charname3 = await cardCharID(card3);
    const charname4 = await cardCharID(card4);
    const charname5 = await cardCharID(card5);
    const w1r = await convertRarity(unit1Weapon.rarity);
    const w2r = await convertRarity(unit2Weapon.rarity);
    const w3r = await convertRarity(unit3Weapon.rarity);
    const w4r = await convertRarity(unit4Weapon.rarity);
    const w5r = await convertRarity(unit5Weapon.rarity);
    const embed = new MessageEmbed();
    embed.setTitle(`Deck ${deck.deckID} | ${deck.deckName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Deck Info`)
        .addFields({name: `Position 1: ${charname1}`, value: `${unit1Weapon.id} | ${unit1Weapon.name}
${w1r} ${unit1Weapon.class}`})
        .addFields({name: `Position 2: ${charname2}`, value: `${unit2Weapon.id} | ${unit2Weapon.name}
${w2r} ${unit2Weapon.class}`})
        .addFields({name: `Position 3: ${charname3}`, value: `${unit3Weapon.id} | ${unit3Weapon.name}
${w3r} ${unit3Weapon.class}`})
        .addFields({name: `Position 4: ${charname4}`, value: `${unit4Weapon.id} | ${unit4Weapon.name}
${w4r} ${unit4Weapon.class}`})
        .addFields({name: `Position 5: ${charname5}`, value: `${unit5Weapon.id} | ${unit5Weapon.name}
${w5r} ${unit5Weapon.class}`})
        .setColor(color.successgreen)
        .setImage(deck.deckImage);
    const row = await createButton();
    msg = await interaction.editReply({embeds: [embed], components: [row], fetchReply: true});
    await buttonManager(interaction, deckid, msg);
}

async function deckIDCheck(interaction) {
    const deckid = await interaction.options.getInteger("deckid");
    const uid = await interaction.user.id;
    const deck = await database.Deck.findOne({where: {deckNumber: deckid, playerID: uid}});
    if (deck) {
        await viewDeck(interaction, deckid);
        //actually view
    } else {
        const embed = embedNew(interaction);
        (await embed).setDescription(`Deck number ${deckid} not found.`)
        return await interaction.editReply({embeds: [embed]});
    }
}

async function newDeck(interaction) {
    try {
        const uid = interaction.user.id;
        const newDecknum = await newDeckNumber(interaction);
        if (newDecknum == 11) {
            return;
        }
        const dname = await interaction.options.getString("deckname");
        const pos1 = await interaction.options.getInteger("pos1");
        const pos2 = await interaction.options.getInteger("pos2");
        const pos3 = await interaction.options.getInteger("pos3");
        const pos4 = await interaction.options.getInteger("pos4");
        const pos5 = await interaction.options.getInteger("pos5");
        const unit1 = await database.Card.findOne({where: {playerID: uid, inventoryID: pos1}})
        const unit2 = await database.Card.findOne({where: {playerID: uid, inventoryID: pos1}})
        const unit3 = await database.Card.findOne({where: {playerID: uid, inventoryID: pos1}})
        const unit4 = await database.Card.findOne({where: {playerID: uid, inventoryID: pos1}})
        const unit5 = await database.Card.findOne({where: {playerID: uid, inventoryID: pos1}})
        if (unit1 && unit2 && unit3 && unit4 && unit5) {
            if (unit1.weapon &&unit2.weapon &&unit3.weapon &&unit4.weapon &&unit5.weapon) {
                console.log("All clear!");
            } else {
                return await interaction.followUp("One or more cards aren't awakened.")
            }
        } else {
            return await interaction.followUp("One or more cards don't exist.")
        }
        const deck = await database.Deck.create({
            playerID: uid,
            deckName: dname,
            deckNumber: newDecknum,
            unit1: pos1,
            unit2: pos2,
            unit3: pos3,
            unit4: pos4,
            unit5: pos5,
        });
        return await viewDeckLineup(interaction, deck)
    } catch (error) {
        return console.log(error);
    }
}

async function editDeck(interaction) {
    try {
        const uid = interaction.user.id;
        const deckID = await interaction.options.getInteger("deckid");
        const dname = await interaction.options.getString("deckname");
        const pos1 = await interaction.options.getInteger("pos1");
        const pos2 = await interaction.options.getInteger("pos2");
        const pos3 = await interaction.options.getInteger("pos3");
        const pos4 = await interaction.options.getInteger("pos4");
        const pos5 = await interaction.options.getInteger("pos5");
        const deck = await database.Deck.findOne({where: {playerID: uid, deckNumber: deckID}})
        const unit1 = await database.Card.findOne({where: {playerID: uid, inventoryID: pos1}})
        const unit2 = await database.Card.findOne({where: {playerID: uid, inventoryID: pos1}})
        const unit3 = await database.Card.findOne({where: {playerID: uid, inventoryID: pos1}})
        const unit4 = await database.Card.findOne({where: {playerID: uid, inventoryID: pos1}})
        const unit5 = await database.Card.findOne({where: {playerID: uid, inventoryID: pos1}})
        if (deck) {
            if (dname) {
                await deck.update({deckName:dname});
            }
            if (pos1) {
                if (unit1) {
                    if (unit1.weapon) {
                        await deck.update({unit1:pos1});
                    } else {
                        return await interaction.followUp(`${pos1} isn't awakened.`)
                    }
                } else {
                    return await interaction.followUp(`${pos1} is an invalid card ID.`)
                }
            }
            if (pos2) {
                if (unit2) {
                    if (unit2.weapon) {
                        await deck.update({unit1:pos2});
                    } else {
                        return await interaction.followUp(`${pos2} isn't awakened.`)
                    }
                } else {
                    return await interaction.followUp(`${pos2} is an invalid card ID.`)
                }
            }
            if (pos3) {
                if (unit3) {
                    if (unit3.weapon) {
                        await deck.update({unit1:pos3});
                    } else {
                        return await interaction.followUp(`${pos3} isn't awakened.`)
                    }
                } else {
                    return await interaction.followUp(`${pos3} is an invalid card ID.`)
                }
            }
            if (pos4) {
                if (unit4) {
                    if (unit4.weapon) {
                        await deck.update({unit1:pos4});
                    } else {
                        return await interaction.followUp(`${pos4} isn't awakened.`)
                    }
                } else {
                    return await interaction.followUp(`${pos4} is an invalid card ID.`)
                }
            }
            if (pos5) {
                if (unit5) {
                    if (unit5.weapon) {
                        await deck.update({unit1:pos5});
                    } else {
                        return await interaction.followUp(`${pos5} isn't awakened.`)
                    }
                } else {
                    return await interaction.followUp(`${pos5} is an invalid card ID.`)
                }
            } 
        } else {
            return await interaction.followUp("Can't edit invalid deck.")
        }
        
        return await viewDeckLineup(interaction, deck)
    } catch (error) {
        return console.log(error);
    }
}

async function selectOption(interaction) {
    switch (interaction.options.getSubcommand()) {
        case "new":
            return newDeck(interaction);

        case "edit":
            return editDeck(interaction);

        case "view":
            return deckIDCheck(interaction);

        default:
            return interaction.followUp("something went wrong.")
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deck')
        .setDescription('create or edit deck.')
        .addSubcommand(subcommand => subcommand
            .setName("new")
            .setDescription("Create a new deck")
            .addStringOption(option => 
                option
                    .setName("deckname")
                    .setDescription("Name of the Deck.")
                    .setRequired(true)
                    )
            .addIntegerOption(option => 
                option
                    .setName("pos1")
                    .setDescription("Awakened card you want at position 1")
                    .setRequired(true)
                    )
            .addIntegerOption(option => 
                option
                    .setName("pos2")
                    .setDescription("Awakened card you want at position 2")
                    .setRequired(true)
                    )
            .addIntegerOption(option => 
                option
                    .setName("pos3")
                    .setDescription("Awakened card you want at position 3")
                    .setRequired(true)
                    )
            .addIntegerOption(option => 
                option
                    .setName("pos4")
                    .setDescription("Awakened card you want at position 4")
                    .setRequired(true)
                    )
            .addIntegerOption(option => 
                option
                    .setName("pos5")
                    .setDescription("Awakened card you want at position 5")
                    .setRequired(true)
                    ))
        .addSubcommand(subcommand => subcommand
            .setName("edit")
            .setDescription("edit a deck")
            .addIntegerOption(option => 
                option
                    .setName("deckid")
                    .setDescription("Deck you want to edit")
                    .setRequired(true)
                    )
            .addStringOption(option => 
                option
                    .setName("deckname")
                    .setDescription("Name of the Deck.")
                    .setRequired(false)
                    )
            .addIntegerOption(option => 
                option
                    .setName("pos1")
                    .setDescription("Awakened card you want at position 1")
                    .setRequired(false)
                    )
            .addIntegerOption(option => 
                option
                    .setName("pos2")
                    .setDescription("Awakened card you want at position 2")
                    .setRequired(false)
                    )
            .addIntegerOption(option => 
                option
                    .setName("pos3")
                    .setDescription("Awakened card you want at position 3")
                    .setRequired(false)
                    )
            .addIntegerOption(option => 
                option
                    .setName("pos4")
                    .setDescription("Awakened card you want at position 4")
                    .setRequired(false)
                    )
            .addIntegerOption(option => 
                option
                    .setName("pos5")
                    .setDescription("Awakened card you want at position 5")
                    .setRequired(false)
                    ))
        .addSubcommand(subcommand => subcommand
            .setName("view")
            .setDescription("View Decks")
            .addIntegerOption(option => 
                option
                    .setName("deckid")
                    .setDescription("Deck you want to view")
                    .setRequired(true)
                    )),
    async execute(interaction) {
        try {
            console.log(1);
            const embedN = await embedNew(interaction);
            console.log(1);
            await interaction.reply({ embeds: [embedN] });
            console.log(1);
            await selectOption(interaction);
        }
            catch (error) {
                console.log(error);
        }
    },
};