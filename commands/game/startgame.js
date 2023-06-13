const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { createCanvas, loadImage, Canvas } = require('canvas');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
const { Op } = require("sequelize");
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()



async function switchHPointX(unitNumber) {
    //inverse for 1-5
    if(unitNumber < 5) {
        return 1168-248*(unitNumber);
    } else {
        return 176+248*(unitNumber-5);
    }
}

async function switchHPointY(unitNumber) {
    if(unitNumber < 5) {
        return 630;
    } else {
        return 1364;
    }
}

async function findStartX(unitNumber) {
    if(unitNumber < 5) {
        return 1168-248*(unitNumber);
    } else {
        return 176+248*(unitNumber-5);
    }
}

async function findStartY(unitNumber) {
    if(unitNumber < 5) {
        return 678;
    } else {
        return 1412;
    }
}

async function drawHPBAR(interaction, context, unitNumber, hp, maxhp) {
    try {
        let hpy;
        if(hp > maxhp) {
            context.fillStyle = color.blue;
            hpy = 232;
        } else {
            context.fillStyle = "green";
            hpy = 232 * (hp/maxhp);
        }
        const dx = await switchHPointX(unitNumber);
        const dy = await switchHPointY(unitNumber);
        context.fillRect(dx, dy, hpy, 32)
        context.font = '28px "joystix monospace"';
        context.fillStyle = 'white';
        context.fillText(`${hp}/${maxhp}`, dx+3, dy+26);
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in drawhpbar`);
    }
}

async function drawStats(interaction, context, gameid, unitNumber) {
    try {
        console.log(`${unitNumber}'s statuses`);
        const statusList = await database.Status.findAll({order: [['statusID', 'ASC']], where: {gameID: gameid, unitNumber: unitNumber, displayImage: true}});
        console.log(`${statusList.length}: how many status`)
        const uniqueStatusList = statusList.reduce((acc, cur) => {
            if (!acc.find(item => item.statusID === cur.statusID)) {
              acc.push(cur);
            }
            return acc;
          }, []);
        let startX = await findStartX(unitNumber);
        let startY = await findStartY(unitNumber);
        let status
        let image;
        console.log(`${uniqueStatusList.length}: how many unique status`);
        for (let i = 0; i < uniqueStatusList.length && i < 4; i++) {
            console.log(uniqueStatusList[i].statusID);
            console.log(i);
            console.log("incrementing");
            startX = startX + 61*i;
            status = await database.StatusType.findOne({where: {id: uniqueStatusList[i].statusID}});
            image = await loadImage(status.statusSprite);
            context.drawImage(image, startX, startY, 48, 48);
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in drawStats`);
    }
}

async function findWeaponArray(interaction, gameCheck, player1, player2) {
    try {
        const [card1, card2, card3, card4, card5, card6, card7, card8, card9, card10] = await Promise.all([
            database.Card.findOne({where: {playerID:player1, inventoryID: gameCheck.unit1}}),
            database.Card.findOne({where: {playerID:player1, inventoryID: gameCheck.unit2}}),
            database.Card.findOne({where: {playerID:player1, inventoryID: gameCheck.unit3}}),
            database.Card.findOne({where: {playerID:player1, inventoryID: gameCheck.unit4}}),
            database.Card.findOne({where: {playerID:player1, inventoryID: gameCheck.unit5}}),
            database.Card.findOne({where: {playerID:player2, inventoryID: gameCheck.unit6}}),
            database.Card.findOne({where: {playerID:player2, inventoryID: gameCheck.unit7}}),
            database.Card.findOne({where: {playerID:player2, inventoryID: gameCheck.unit8}}),
            database.Card.findOne({where: {playerID:player2, inventoryID: gameCheck.unit9}}),
            database.Card.findOne({where: {playerID:player2, inventoryID: gameCheck.unit10}}),
          ]);

        const weaponIds = [card1.weapon, card2.weapon, card3.weapon, card4.weapon, card5.weapon, card6.weapon, card7.weapon, card8.weapon, card9.weapon, card10.weapon];
        const weaponArray = await Promise.all(weaponIds.map((weaponId) => {
            return database.Weapon.findOne({where: {id: weaponId}});
          }));
        return weaponArray;
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in find weapon array`);
    }
}



async function populateStatus(interaction, gameCheck, weaponArray) {
    try {
      const promises = [];
  
      for (let i = 0; i < 10; i++) {
        promises.push(database.Status.create({
          gameID: gameCheck.id,
          unitNumber: i,
          statusID: 1,
          statusValue: weaponArray[i].health,
          displayImage: false,
          duration: null,
        }));
        promises.push(database.Status.create({
          gameID: gameCheck.id,
          unitNumber: i,
          statusID: 2,
          statusValue: null,
          displayImage: false,
          duration: 0,
        }));
        promises.push(database.Status.create({
          gameID: gameCheck.id,
          unitNumber: i,
          statusID: 3,
          statusValue: null,
          displayImage: false,
          duration: 0,
        }));
        promises.push(database.Status.create({
          gameID: gameCheck.id,
          unitNumber: i,
          statusID: 4,
          statusValue: null,
          displayImage: false,
          duration: 0,
        }));
        promises.push(database.Status.create({
          gameID: gameCheck.id,
          unitNumber: i,
          statusID: 5,
          statusValue: null,
          displayImage: false,
          duration: 0,
        }));
      }
  
      await Promise.all(promises);
    } catch (error) {
      let channel = interaction.guild.channels.cache.get('1089177404209123370');
      channel.send(`${error} in populate status`);
    }
  }

// async function populateStatus(interaction, gameCheck, weaponArray) {
//     try {
//         for(let i = 0; i < 10; i++) {
//             await database.Status.create({
//                 gameID: gameCheck.id,
//                 unitNumber: i,
//                 statusID: 1,
//                 statusValue: weaponArray[i].health,
//                 displayImage: false,
//                 duration: null,
//             });
//             await database.Status.create({
//                 gameID: gameCheck.id,
//                 unitNumber: i,
//                 statusID: 2,
//                 statusValue: null,
//                 displayImage: false,
//                 duration: 0,
//             });
//             await database.Status.create({
//                 gameID: gameCheck.id,
//                 unitNumber: i,
//                 statusID: 3,
//                 statusValue: null,
//                 displayImage: false,
//                 duration: 0,
//             });
//             await database.Status.create({
//                 gameID: gameCheck.id,
//                 unitNumber: i,
//                 statusID: 4,
//                 statusValue: null,
//                 displayImage: false,
//                 duration: 0,
//             });
//             await database.Status.create({
//                 gameID: gameCheck.id,
//                 unitNumber: i,
//                 statusID: 5,
//                 statusValue: null,
//                 displayImage: false,
//                 duration: 0,
//             });
//         }
//     } catch (error) {
//         let channel = interaction.guild.channels.cache.get('1089177404209123370');
//         channel.send(`${error} in populate status`);
//     }
// }

async function portraitX(unitNumber) {
    if(unitNumber < 5) {
        return 1160-(248*(unitNumber));
    } else {
        return 168+248*(unitNumber-5);
    }
}

async function portraitY(unitNumber) {
    if(unitNumber < 5) {
        return 0;
    } else {
        return 734;
    }
}

async function checkTeamWipe(interaction, gameCheck) {
    const team1 = await database.Status.findAll({order: [['unitNumber','ASC']],where: {gameID: gameCheck.id, unitNumber: {[Op.between]: [0, 4]}, statusID: 1, statusValue: {[Op.gt]: 0}}});
    const team2 = await database.Status.findAll({order: [['unitNumber','ASC']],where: {gameID: gameCheck.id, unitNumber: {[Op.between]: [5, 9]}, statusID: 1, statusValue: {[Op.gt]: 0}}});
    if(team1 == 0 || team2 == 0) {
        return true;
    } else {
        return false;
    }
}

async function calculateInit(interaction, weaponArray, gameCheck) {
    try {
        let highestInit = 0;
        let unit = -1;
        for(let i = 0; i < 5; i++) {
            let initMod = 0;
            const acted = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID: 28}});
            const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID: 1}});
            if (hp.statusValue > 0 && !acted) {
                const initDown = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID: 6}});
                const initUp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID: 6}});

                if(initDown) {
                    initMod = initMod - initDown.statusValue;
                }
                if(initUp) {
                    initMod = initMod + initUp.statusValue
                }
                if (weaponArray[i].init + initMod > highestInit) {
                    highestInit = weaponArray[i].init + initMod;
                    unit = i;
                }
            }
        }
        for(let i = 5; i < 10; i++) {
            let initMod = 0;
            const acted = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID: 28}});
            const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID: 1}});
            if (hp.statusValue > 0 && !acted) {
                const initDown = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID: 6}});
                const initUp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID: 6}});
                if(initDown) {
                    initMod = initMod - initDown.statusValue;
                }
                if(initUp) {
                    initMod = initMod + initUp.statusValue
                }
                if (weaponArray[i].init + initMod > highestInit) {
                    highestInit = weaponArray[i].init + initMod;
                    unit = i;
                }
                if (weaponArray[i].init + initMod == highestInit&& gameCheck.ladyluck > 0) {
                    highestInit = weaponArray[i].init + initMod;
                    unit = i;
                }
            }            
        }
        return unit;
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in calculate init`);
    }
}


async function viewField(interaction, gameCheck, weaponArray) {
    try {
        const player1deck = gameCheck.deck1Image;
        const player2deck = gameCheck.deck2Image;
        const user = await interaction.user;
        const target = await interaction.options.getUser('targetuser');
        let player1pfp;
        let player2pfp;
        if (user.id == gameCheck.player1ID) {
            player1pfp = await user.avatarURL({ format: 'png' });
            player2pfp = await target.avatarURL({ format: 'png' });
        } else {
            player2pfp = await user.avatarURL({ format: 'png' });
            player1pfp = await target.avatarURL({ format: 'png' });
        }
        const battlefieldURL = 'https://cdn.discordapp.com/attachments/1086674842893438976/1091732073137590281/field2.png';
        const deadfilterURL = 'https://cdn.discordapp.com/attachments/1086674842893438976/1090130506546434069/deadfiter.png';
        const blueacted = 'https://cdn.discordapp.com/attachments/1086674842893438976/1090130506328313937/acted.png';
        const redacted = 'https://media.discordapp.net/attachments/1086674842893438976/1090130777985003603/redacted.png?width=270&height=676';

        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameCheck.id, unitNumber: {[Op.between]: [0, 9]}, statusID: 1}});
        const actarray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameCheck.id, unitNumber: {[Op.between]: [0, 9]}, statusID: 28}});
        
        const canvas = createCanvas(1576, 1468);
        let context = canvas.getContext('2d');
        //field, deackimage, check hp, if dead, draw filter, then do hpbar and stats;
        const field = await loadImage(battlefieldURL);
        const d1img = await loadImage(player1deck);
        const d2img = await loadImage(player2deck);
        const deadfilter = await loadImage(deadfilterURL);
        const bluefilter = await loadImage(blueacted);
        const redfilter = await loadImage(redacted);
        const pfp1 = await loadImage(player1pfp);
        const pfp2 = await loadImage(player2pfp);
        context.drawImage(field, 0,0,canvas.width,canvas.height);
        context.scale(-1, 1);
        context.drawImage(d1img, -1408,0,1240,622);
        context.scale(-1, 1);
        context.drawImage(d2img, 168,734,1240,622);
        //1248,8
        //8, 742
        context.drawImage(pfp1, 20, 20, 128, 128);
        context.drawImage(pfp2, 1428, 754, 128, 128);
        context.font = '96px "joystix monospace"';
        context.fillStyle = 'white';
        context.fillText(`${gameCheck.round}`, 48, 420);
        context.fillText(`${gameCheck.round}`, 1458, 1152);
        for (let j = 0; j < actarray.length; j++) {
            if(actarray[j].unitNumber < 5) {
                const dx = await portraitX(actarray[j].unitNumber)
                const dy = await portraitY(actarray[j].unitNumber)
                context.drawImage(redfilter, dx, dy, 248, 622);
            } else {
                const dx = await portraitX(actarray[j].unitNumber)
                const dy = await portraitY(actarray[j].unitNumber)
                context.drawImage(bluefilter, dx, dy, 248, 622);
            }
        }
        for (let i = 0; i < 10; i++) {
            if (hparray[i].statusValue > 0) {
                await drawHPBAR(interaction, context, i, hparray[i].statusValue, weaponArray[i].health);
                await drawStats(interaction, context, gameCheck.id, i);
            } else {
                const dx = await portraitX(i)
                const dy = await portraitY(i)
                context.drawImage(deadfilter, dx, dy, 248, 622);
            }
        }
        return attachment = new MessageAttachment(canvas.toBuffer(), 'gameboard.png');
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in viewfield`);
    }
}


async function switchHealthCondition(charArray, gameCheck, unitNumber, weaponArray) {
    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unitNumber, statusID:1}});
    const maxhp = weaponArray[unitNumber].health;
    switch(charArray[1]) {
        case "L"://lower quartile health
            if(hp.statusValue <= (maxhp/4)) {
                return true;
            }
            break;

        case "H"://below half health
            if (hp.statusValue <= (maxhp/2)) {
                return true;
            }
            break;

        case "D"://damaged
            if (hp.statusValue < maxhp) {
                return true;
            }
            break;

        case "F"://full health
            if (hp.statusValue >= maxhp) {
                return true;
            }
            break;

        default:
            return false;
    }
    return false;
}

async function switchRoundCondition(charArray, gameCheck) {
    /*
    B Before
    E Equal
    A After
    */
    const roundNumber = parseInt(charArray[2]);
    switch(charArray[1]) {
        case "B":
            if(gameCheck.round < roundNumber) {
                return true;
            } else {
                return false;
            }
        case "E":
            if(gameCheck.round == roundNumber) {
                return true;
            } else {
                return false;
            }
        case "A":
            if(gameCheck.round > roundNumber) {
                return true;
            } else {
                return false;
            }
        default:
            return false;
    }
}

async function switchAttackCondition(charArray, gameCheck, hit, crit) {
    /*
    M Miss
    H Hit
    C Crit
    */
    switch(charArray[1]) {
        case "M":
            if (!hit) {
                return true;
            }
            break;
        case "H":
            if (hit) {
                return true;
            }
            break;
            
        case "C":
            if (hit && crit) {
                return true;
            }
            break;

        default:
            return false;
    }
    return false;
}

async function switchStatusCondition(charArray, gameCheck, unitNumber) {
    //if unit has matching status id, return true, when doing status always have two digits.
    const statusTendigit = parseInt(charArray[1]);
    const statusOnedigit = parseInt(charArray[2]);
    const status = statusTendigit*10 + statusOnedigit;
    const checkStatus = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unitNumber, statusID: status}});
    if(checkStatus) {
        return true;
    } else {
        return false;
    }
}
/*
probably going to be the section that gets updated the most.
*/
async function switchCondition(interaction, conditionStr, gameCheck, abilityNumber, unitNumber, targetNumber, weaponArray, nameArray,  attackHit, attackCrit) {
    const charArray = [...conditionStr];
    switch(charArray[0]) {
        case "H":
            return switchHealthCondition(charArray, gameCheck, targetNumber, weaponArray); //health related
            
        case "R":
            return switchRoundCondition(charArray, gameCheck); //round related

        case "S":
            return switchStatusCondition(charArray, gameCheck, targetNumber); //Status related

        case "D":
            return processAttackNoEffect(interaction, gameCheck, weaponArray, abilityNumber, nameArray, unitNumber);

        case "A":
            return switchAttackCondition(charArray, gameCheck, attackHit, attackCrit);
 
        case "N":
            return true;

        default:
            return false;
    }
}

async function switchPhase(phaseStr) {
    switch(phaseStr) {
        case "GS":
            return -1;

        case "RS":
            return 0;

        case "US":
            return 1;

        case "UA":
            return 2;

        case "UE":
            return 3;

        case "RE":
            return 4;        
    }
}


//find a target between 0-4
async function switchTargetP1(interaction, gameCheck, targetInt) {
    try {
        switch(targetInt) {
            case 1:
                let first = 0;
                while(first < 5) {
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: first, statusID: 1}});
                    if (hp.statusValue > 0) {
                        return first;
                    }
                    first += 1;
                }
                return;
                //recursively check the first unit that's alive from the first.

            case 5:
                let last = 5;
                while(last >= 0) {
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: last, statusID: 1}});
                    if (hp.statusValue > 0) {
                        return last;
                    }
                    last -= 1;
                }
                //recursively check the last unit that's alive from the last.

            case 6:
                return 6;
            
            case 7:
                while(1) {
                    let randomValue = Math.floor(Math.random() * 5);
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: randomValue, statusID: 1}});
                    if (hp.statusValue > 0) {
                        return randomValue;
                    }
                }

            case 8:
                const lowesthp = await database.Status.findOne({
                    order: [['statusValue', 'ASC']] , 
                    where: {
                        gameID: gameCheck.id, 
                        unitNumber: {[Op.between]: [0, 4]}, 
                        statusID: 1,
                        statusValue: {[Op.gt]: 0}}
                    }
                );
                return lowesthp.unitNumber;

            case 9:
                const highesthp = await database.Status.findOne({
                    order: [['statusValue', 'DESC']] , 
                    where: {
                        gameID: gameCheck.id, 
                        unitNumber: {[Op.between]: [0, 4]}, 
                        statusID: 1,
                        statusValue: {[Op.gt]: 0}}
                    }
                );
                return highesthp.unitNumber;
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in switchTargetP1`);
    }
}

//find a target between 5 and 9
async function switchTargetP2(interaction, gameCheck, targetInt) {
    try {
        switch(targetInt) {
            case 1:
                let first = 5;
                while(first < 10) {
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: first, statusID: 1}});
                    if (hp.statusValue > 0) {
                        return first;
                    }
                    first += 1;
                }
                return;
                //recursively check the first unit that's alive from the first.

            case 5:
                let last = 9;
                while(last >= 5) {
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: last, statusID: 1}});
                    if (hp.statusValue> 0) {
                        return last;
                    }
                    last -= 1;
                }
            //recursively check the last unit that's alive from the last.

            case 6:
                return 6;
            
            case 7:
                while(1) {
                    let randomValue = Math.floor(Math.random() * 5) + 5;
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: randomValue, statusID: 1}});
                    if (hp.statusValue > 0) {
                        return randomValue;
                    }
                }

            case 8:
                const lowesthp = await database.Status.findOne({
                    order: [['statusValue', 'ASC']], 
                    where: {
                        gameID: gameCheck.id, 
                        unitNumber: {[Op.between]: [5, 9]}, 
                        statusID: 1,
                        statusValue: {[Op.gt]: 0}}
                });
                return lowesthp.unitNumber;

            case 9:
                const highesthp = await database.Status.findOne({
                    order: [['statusValue', 'DESC']],
                    where: {
                        gameID: gameCheck.id, 
                        unitNumber: {[Op.between]: [5, 9]}, 
                        statusID: 1,
                        statusValue: {[Op.gt]: 0}}
                });
                return highesthp.unitNumber;
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in switchTargetP2`);
    }
}

async function applyStatus(interaction, gameCheck, abilityNumber, selfNumber, targetInt, effectArray, weaponArray, nameArray) {
    try {
        console.log(targetInt);
        if (abilityNumber == 0) {
            weaponArray[selfNumber].id
            const ability = await database.Ability.findOne({where: {weaponID: weaponArray[selfNumber].id, abilitySlot: 0}});
            await database.Status.update({duration: ability.cooldown},{where: {gameID: gameCheck.id, unitNumber: targetInt, statusID:2}});
        }
        if (effectArray[2] > 5) {
            if(effectArray[2] == 26) {
                const stunres = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: targetInt, statusID:27}});
                if (stunres) {
                    if (Math.floor(Math.random() * 2) == 1) {
                        await updateGamelog(interaction, gameCheck, `${nameArray[targetInt].logName} stunned for ${effectArray[4]} turns`);
                        await database.Status.create({
                            gameID: gameCheck.id,
                            unitNumber: targetInt,
                            statusID: effectArray[2],
                            displayImage: true,
                            statusValue: effectArray[3],
                            duration: effectArray[4]
                        })
                    } else {
                        await updateGamelog(interaction, gameCheck, `Stun resisted by unit ${targetInt}.`);
                    }
                } else {
                const status = await database.StatusType.findOne({where: {id: effectArray[2]}});
                await updateGamelog(interaction, gameCheck, `${nameArray[targetInt].logName} stunned for ${effectArray[4]} turns`);
                await database.Status.create({
                    gameID: gameCheck.id,
                    unitNumber: targetInt,
                    statusID: effectArray[2],
                    displayImage: true,
                    statusValue: effectArray[3],
                    duration: effectArray[4]
                })
                }
            } else {
                const status = await database.StatusType.findOne({where: {id: effectArray[2]}});
                await updateGamelog(interaction, gameCheck, `${nameArray[targetInt].logName} ${status.name} for ${effectArray[4]} turns`);
                await database.Status.create({
                    gameID: gameCheck.id,
                    unitNumber: targetInt,
                    statusID: effectArray[2],
                    displayImage: true,
                    statusValue: effectArray[3],
                    duration: effectArray[4]
                })
            }
            //these don't stack and will always need to create new ones
            
        } else if (effectArray[2] == 1) {
            //it's current hp change. shield!
            if (effectArray[4] == 1) {
                await updateGamelog(interaction, gameCheck, `${nameArray[targetInt].logName} gained ${effectArray[3]} shield.`);
                await database.Status.increment({statusValue: effectArray[3]}, {where: {
                    gameID: gameCheck.id,
                    unitNumber: targetInt,
                    statusID: 1,
                }})
            } else {
                //we need max hp.
                let heal = parseInt(effectArray[3]);
                const maxhp = weaponArray[targetInt].health;
                const currenthp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: targetInt, statusID: 1}});
                if (heal < 0) {
                    await updateGamelog(interaction, gameCheck, `${nameArray[targetInt].logName} took ${heal} damage`);
                    await database.Status.increment({statusValue: heal}, {where: {
                        gameID: gameCheck.id,
                        unitNumber: targetInt,
                        statusID: 1,
                    }})
                } else if((currenthp.statusValue + heal)>= maxhp) {
                    await updateGamelog(interaction, gameCheck, `${nameArray[targetInt].logName} recovered to max health.`);
                    await database.Status.update({statusValue: maxhp}, {where: {
                        gameID: gameCheck.id,
                        unitNumber: targetInt,
                        statusID: 1,
                    }})
                } else {
                    await updateGamelog(interaction, gameCheck, `${nameArray[targetInt].logName} recovered ${heal} health.`);
                    await database.Status.increment({statusValue: heal}, {where: {
                        gameID: gameCheck.id,
                        unitNumber: targetInt,
                        statusID: 1,
                    }})
                }
            }
        } else if (1 < effectArray[2] < 6) {
            await database.Status.update({duration: effectArray[4]},{where: {gameID: gameCheck.id, unitNumber: targetInt, statusID: effectArray[2]}});
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in apply status`);
    }
    
}

async function processEffect(interaction, gameCheck, abilityNumber, effectBracket, weaponArray, nameArray, selfNumber, targetNumber, attackHit, attackCrit) {
    // try {
    //Recieve effect in brackets and split by :
    //ex (target:condition:status:value:duration). All are integers.
    //if unitnumber 0-4 5-9 are enemies
    //if unitnumber 5-9 0-4 are enemies.
    // await updateGamelog(interaction, gameCheck, `Applying ${effectBracket} from ability ${abilityNumber}`);
        effect = await effectBracket.replace(/[{()}]/g, '');
        let effectArray
        if (effect) {
            effectArray = await effect.split(":");
        } else {
            return;
        }
        const targetInt = effectArray[0];
        let targetUnit;
        if (targetInt == 6) {
            if(selfNumber < 5) {
                //attack 5-9
                for (let i = 5; i < 10; i++) {
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID:1}});
                    if (hp.statusValue > 0) {
                        if (await switchCondition(interaction, effectArray[1], gameCheck, abilityNumber, selfNumber, i, weaponArray, nameArray, attackHit, attackCrit)) {
                            await applyStatus(interaction, gameCheck, abilityNumber, selfNumber, i, effectArray, weaponArray, nameArray,);
                        }
                        
                    }
                }
            } else {
                //attack 0-4
                for (let i = 0; i < 5; i++) {
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID:1}});
                    if (hp.statusValue > 0) {
                        if (await switchCondition(interaction, effectArray[1], gameCheck, abilityNumber, selfNumber, i, weaponArray, nameArray, attackHit, attackCrit)) {
                            await applyStatus(interaction, gameCheck, abilityNumber, selfNumber, i, effectArray, weaponArray, nameArray,);
                        }
                    }
                }
            }
        } else if (targetInt == -6) {
            if(selfNumber < 5) {
                //attack 5-9
                for (let i = 0; i < 5; i++) {
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID:1}});
                    if (hp.statusValue > 0) {
                        if (await switchCondition(interaction, effectArray[1], gameCheck, abilityNumber, selfNumber, i, weaponArray, nameArray, attackHit, attackCrit)) {
                            await applyStatus(interaction, gameCheck, abilityNumber, selfNumber, i, effectArray, weaponArray, nameArray,);
                        }
                    }
                }
            } else {
                //attack 0-4
                for (let i = 5; i < 10; i++) {
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID:1}});
                    if (hp.statusValue > 0) {
                        if (await switchCondition(interaction, effectArray[1], gameCheck, abilityNumber, selfNumber, i, weaponArray, nameArray, attackHit, attackCrit)) {
                            await applyStatus(interaction, gameCheck, abilityNumber, selfNumber, i, effectArray, weaponArray, nameArray,);
                        }
                    }
                }
            }
        } else if (targetInt == 2) {
            //target hit
            console.log("target enemies")
            targetUnit = targetNumber;
            if (await switchCondition(interaction, effectArray[1], gameCheck, abilityNumber, selfNumber, targetUnit, weaponArray, nameArray, attackHit, attackCrit)) {
                await applyStatus(interaction, gameCheck, abilityNumber, selfNumber, targetUnit, effectArray, weaponArray, nameArray);
            }
        } else if (targetInt == -2) {
            //target hit
            console.log("Target allies")
            targetUnit = targetNumber;
            console.log(targetNumber);
            if (await switchCondition(interaction, effectArray[1], gameCheck, abilityNumber, selfNumber, targetUnit, weaponArray, nameArray, attackHit, attackCrit)) {
                await applyStatus(interaction, gameCheck, abilityNumber, selfNumber, targetUnit, effectArray, weaponArray, nameArray);
            }
        } else if (targetInt == 0) {
            //target self
            targetUnit = selfNumber;
            if (await switchCondition(interaction, effectArray[1], gameCheck, abilityNumber, selfNumber, targetUnit, weaponArray, nameArray, attackHit, attackCrit)) {
                await applyStatus(interaction, gameCheck, abilityNumber, selfNumber, selfNumber, effectArray, weaponArray, nameArray);
            }
        }
    // } catch (error) {
    //     let channel = interaction.guild.channels.cache.get('1089177404209123370');
    //         channel.send(`${error} in process effect`);
    // }
}

async function processPhase(interaction, gameCheck, currentPhase, abilityNumber, effect, weaponArray, nameArray, unitNumber, targetunit, attackHit, attackCrit) {
    // try {
        if (effect == 0) {
            return;
        }
        const selfArray = effect.split(" ");
        const targetPhase = await switchPhase(selfArray[0]);
        const unitPhase = currentPhase - unitNumber*10;
        if(targetPhase == currentPhase || targetPhase == unitPhase) {
            for (let i = 1; i < selfArray.length; i++) {
                await processEffect(interaction, gameCheck, abilityNumber ,selfArray[i], weaponArray, nameArray, unitNumber, targetunit, attackHit, attackCrit);
            }
        }
    // } catch (error) {
    //     let channel = interaction.guild.channels.cache.get('1089177404209123370');
    //     channel.send(`${error} in process phase`);
    // }
}

/*
how effects and self effects are processed.
Most of the effects are triggered when unit acts UA
some effects especially passives are triggered in other phases
GS GameStart phase = -1
RS RoundStart phase = 0
US UnitStart phase = 1
UA UnitAction phase = 2
UE UnitEnd phase = 3
RE RoundEnd phase = 4
*/
async function processPassives(interaction, gameCheck, weaponArray, passiveArray, nameArray) {
    try {
        for (i = 0; i < 10; i++) {
            const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID: 1}})
            const passiveCD = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID: 2}})
            if (passiveCD.duration == 0 && hp.statusValue > 0) {
                const effect = passiveArray[i].effect;
                const self = passiveArray[i].self;
                if (effect) {
                    await processPhase(interaction, gameCheck, gameCheck.phase, 0, effect, weaponArray, nameArray, i, 0, false, false);
                }
                if (self) {
                    await processPhase(interaction, gameCheck, gameCheck.phase, 0, self, weaponArray, nameArray, i, 0, false, false);
                }
            }
            //else passive on cooldown
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in process passives`);
    }
}

async function processOwnPassive(interaction, gameCheck, weaponArray, passiveArray, nameArray, unit) {
    try {
        const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 1}})
        const passiveCD = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 2}})
        if (passiveCD.duration == 0 && hp.statusValue > 0) {
            const effect = passiveArray[unit].effect;
            const self = passiveArray[unit].self;
            if (effect) {
                await processPhase(interaction, gameCheck, gameCheck.phase, 0, effect, weaponArray, nameArray, unit, 0, false, false);
            }
            if (self) {
                await processPhase(interaction, gameCheck, gameCheck.phase, 0, self, weaponArray, nameArray, unit, 0, false, false);
            }
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in process own passive`);
    }
}

async function findPassiveArray(interaction, weaponArray) {
    try {
        const w1a0 = await database.Ability.findOne({where: {weaponID: weaponArray[0].id, abilitySlot: 0}});
        const w2a0 = await database.Ability.findOne({where: {weaponID: weaponArray[1].id, abilitySlot: 0}});
        const w3a0 = await database.Ability.findOne({where: {weaponID: weaponArray[2].id, abilitySlot: 0}});
        const w4a0 = await database.Ability.findOne({where: {weaponID: weaponArray[3].id, abilitySlot: 0}});
        const w5a0 = await database.Ability.findOne({where: {weaponID: weaponArray[4].id, abilitySlot: 0}});
        const w6a0 = await database.Ability.findOne({where: {weaponID: weaponArray[5].id, abilitySlot: 0}});
        const w7a0 = await database.Ability.findOne({where: {weaponID: weaponArray[6].id, abilitySlot: 0}});
        const w8a0 = await database.Ability.findOne({where: {weaponID: weaponArray[7].id, abilitySlot: 0}});
        const w9a0 = await database.Ability.findOne({where: {weaponID: weaponArray[8].id, abilitySlot: 0}});
        const w10a0 = await database.Ability.findOne({where: {weaponID: weaponArray[9].id, abilitySlot: 0}});
        const passiveArray = [w1a0, w2a0, w3a0, w4a0, w5a0, w6a0, w7a0, w8a0, w9a0, w10a0];
        return passiveArray;
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in find ability array`);
    }
}


async function continueGamePhase4(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray) {
    try{
        await updateGamelog(interaction, gameCheck, `:large_blue_diamond:Round ${gameCheck.round} ended`);
        await processPassives(interaction, gameCheck, weaponArray, passiveArray, nameArray);
        await gameCheck.update({phase: 0});
        await gameCheck.increment({round: 1});
        if (gameCheck.round < 11) {
            await continueGamePhase0(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray);
        } else {
            await processGameEnd(interaction, gameCheck);
        }

    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in phase 4`);
    }
}



async function continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, unitNum) {
    try{
        // await updateGamelog(interaction, gameCheck, `${nameArray[unitNum].logName}'s turn ended.`);
        await gameCheck.increment({phase: 1});
        await processOwnPassive(interaction, gameCheck, weaponArray, passiveArray, nameArray, unitNum);
        await database.Status.increment({duration: -1}, {where: {gameID: gameCheck.id, unitNumber: unitNum, statusID: {
            [Op.between]: [2, 5]}, duration: {[Op.gt]: 0}
        }});
        const breakstun = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unitNum, statusID: 26, duration: 0}});
        if (breakstun) {
            await database.Status.create({
                gameID: gameCheck.id,
                unitNumber: unitNum,
                statusID: 27,
                displayImage: 1,
                duration: 2,
            })
        }
        await database.Status.destroy({where: {
            gameID: gameCheck.id, 
            unitNumber: unitNum, 
            statusID: {[Op.between]: [6, 27]},
            duration: 0
        }});
        await checkTeamWipe(interaction, gameCheck);
        if (await checkTeamWipe(interaction, gameCheck)) {
            await processGameEnd(interaction, gameCheck);
        } else {
            const unit = await calculateInit(interaction, weaponArray, gameCheck);
            if (unit == -1) {
                await gameCheck.update({phase: 4});
                await continueGamePhase4(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray);
            } else {
                await gameCheck.update({phase: unit*10+1});
                await continueGamePhase1(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, unit);
            }
        }
        
        //reduce cooldowns and reduce buffs and debuff duration by 1
         

    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in phase 3`);
    }
}


async function processHitNoEffect(interaction, gameCheck, weaponArray, abilityNumber, nameArray, unit, targetUnit, atk, acc, crt, crd) {
    //need target eva and any evaups they have.
    
    try {
        const target = weaponArray[targetUnit];
        const targetHp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: targetUnit}});
        const ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: abilityNumber}});
        let eva = target.eva;
        let armor = target.armor;
        const statusList = await database.Status.findAll({
            where: {
            gameID: gameCheck.id,
            unitNumber: targetUnit,
            statusID: {
                [Op.between]: [10, 15]
            }
            }
        });
        for(let i = 0; i < statusList.length; i++) {
            switch (statusList[i].statusID) {
                case 10:
                    armor -= statusList[i].statusValue;
                    break;

                case 11:
                    armor += statusList[i].statusValue;
                    break;

                case 14:
                    eva -= statusList[i].statusValue;
                    break;

                case 15:
                    eva += statusList[i].statusValue;
                    break;

                default:
                    break;
            }
        }
        armor -= ability.pen;
        if(armor < 0) {
            armor = 0;
        }
        let hitRoll = Math.ceil(Math.random() * 100);
        let player = -1;
        if(unit < 5) {
            player = 1;
        }
        if(unit < 5 && gameCheck.ladyluck > 10 || unit > 5 && gameCheck.ladyluck < -10) {
            if (hitRoll > acc) {
                hitRoll = Math.ceil(Math.random() * 100);
                gameCheck.increment({ladyluck: -player*10})
            }
        }
        let evaRoll = Math.ceil(Math.random() * 100);
        let crtRoll = Math.ceil(Math.random() * 100);
        const dmgvar = Math.floor(Math.random() * (ability.dmgvar + 1));
        if (ability.damage == 0) {
            await updateGamelog(interaction, gameCheck, `Was this a mistake?`);
            return;
        }
        if (hitRoll > acc) {
            //miss
            await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s missed ${nameArray[targetUnit].logName}.`);
            gameCheck.increment({ladyluck: player*(100-acc)/5})
        } else {
            //hit
            if(evaRoll > eva) {
                //hit
                if(crtRoll < crt) {
                    //total atk*(abilityatk)%*(100+crd)%-armor
                    let critDamage = Math.round(((atk*(ability.damage/100)+dmgvar)*((100+(crd+ability.crd)))/100)-armor);
                    if (critDamage < 0) {
                        critDamage = 0;
                        await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s ${ability.abilityName} critical strike was blocked by ${nameArray[targetUnit].logName}`);
                    } else {
                        await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s ${ability.abilityName} critically strike ${nameArray[targetUnit].logName} for ${critDamage} damage!`);
                        await targetHp.increment({statusValue: -critDamage})
                    }
                    if(targetHp.statusValue <= critDamage) {
                        await targetHp.update({statusValue: 0})
                        await updateGamelog(interaction, gameCheck, `${nameArray[targetUnit].logName} has been eliminated.`);
                    }
                    //nocrit
                } else {
                    let hitDamage = Math.round((atk*(ability.damage/100)+dmgvar)-armor);
                    if (hitDamage < 0) {
                        hitDamage = 0;
                        await  updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s ${ability.abilityName} hit was blocked by ${nameArray[targetUnit].logName}.`);
                    } else {
                        await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s ${ability.abilityName} hit ${nameArray[targetUnit].logName} for ${hitDamage} damage.`);
                        await targetHp.increment({statusValue: -hitDamage})
                    }
                    
                    if(targetHp.statusValue <= hitDamage) {
                        await targetHp.update({statusValue: 0})
                        await updateGamelog(interaction, gameCheck, `${nameArray[targetUnit].logName} has been eliminated.`);
                    }
                    //crit
                }
            } else {
                await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s ${ability.abilityName} was evaded by ${nameArray[targetUnit].logName}.`);
            }
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
            channel.send(`${error} in process hit no effect`);
    }
}

async function processAttackNoEffect(interaction, gameCheck, weaponArray, abilityNumber, nameArray, unit) {
    try {
        const weapon = weaponArray[unit];
        const ability = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: abilityNumber}});
        let atk = weapon.atk;
        let acc = weapon.acc + ability.acc;
        let crt = weapon.crt + ability.crt;
        let crd = weapon.crd + ability.crd;
        const statusList = await database.Status.findAll({
            where: {
            gameID: gameCheck.id,
            unitNumber: unit,
            statusID: {
                [Op.between]: [12, 21]
            }
            }
        });
        for (let i = 1; i < statusList.length; i++) {
            switch(statusList[i].statusID) {
                case 12:
                    atk -= statusList[i].statusValue;
                    break;

                case 13:
                    atk += statusList[i].statusValue;
                    break;
                    
                case 16:
                    acc -= statusList[i].statusValue;
                    break;
                case 17:
                    acc += statusList[i].statusValue;
                    break;
                    
                case 18:
                    crt -= statusList[i].statusValue;
                    break;
                    
                case 19:
                    crt += statusList[i].statusValue;
                    break;
                    
                case 20:
                    crd -= statusList[i].statusValue;
                    break;
                    
                case 21:
                    crd += statusList[i].statusValue;
                    break;

                default:
                    break;
            }
        }
        const targetInt = ability.target;
        let targetUnit
        if (targetInt == 6) {
            if(unit < 5) {
                //attack 5-9
                for (let i = 5; i < 10; i++) {
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID:1}});
                    if (hp.statusValue > 0) {
                        await processHitNoEffect(interaction, gameCheck, weaponArray, abilityNumber, nameArray, unit, i, atk, acc, crt, crd)
                    }
                }
            } else {
                //attack 0-4
                for (let i = 0; i < 5; i++) {
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID:1}});
                    if (hp.statusValue > 0) {
                        await processHitNoEffect(interaction, gameCheck, weaponArray, abilityNumber, nameArray, unit, i, atk, acc, crt, crd)
                    }
                }
            }
        } else if((unit < 5 && targetInt > 0) || (unit >=5 && targetInt < 0)) {
            //target on 5-9
            targetUnit = await switchTargetP2(interaction, gameCheck, Math.abs(targetInt));
            await processHitNoEffect(interaction, gameCheck, weaponArray, abilityNumber, nameArray, unit, targetUnit, atk, acc, crt, crd);
        } else if (targetInt == 0) {
            //target self
            targetUnit = unit;
            await processHitNoEffect(interaction, gameCheck, weaponArray, abilityNumber, nameArray, unit, targetUnit, atk, acc, crt, crd);
        } else if (unit >=5 && targetInt > 0 || unit < 5 && targetInt < 0) {
            targetUnit = await switchTargetP1(interaction, gameCheck, Math.abs(targetInt));
            await processHitNoEffect(interaction, gameCheck, weaponArray, abilityNumber, nameArray, unit, targetUnit, atk, acc, crt, crd);
        }
        return false;
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in processAttacknoeffect`);
    }    
}

async function processHit(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, unit, targetUnit, atk, acc, crt, crd) {
    //need target eva and any evaups they have.
    const target = weaponArray[targetUnit];
    const ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: abilityNumber}});
    const targetHp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: targetUnit, statusID: 1}});
    let eva = target.eva;
    let armor = target.armor;
    const statusList = await database.Status.findAll({
        where: {
          gameID: gameCheck.id,
          unitNumber: targetUnit,
          statusID: {
            [Op.between]: [10, 15]
          }
        }
    });
    for(let i = 0; i < statusList.length; i++) {
        switch (statusList[i].statusID) {
            case 10:
                armor -= statusList[i].statusValue;
                break;

            case 11:
                armor += statusList[i].statusValue;
                break;

            case 14:
                eva -= statusList[i].statusValue;
                break;

            case 15:
                eva += statusList[i].statusValue;
                break;

            default:
                break;
        }
    }
    armor -= ability.pen;
    if(armor < 0) {
        armor = 0;
    }
    let hitRoll = Math.ceil(Math.random() * 100);
    let player = -1;
    if(unit < 5) {
        player = 1;
    }
    if(unit < 5 && gameCheck.ladyluck > 10 || unit > 5 && gameCheck.ladyluck < -10) {
        if (hitRoll > acc) {
            hitRoll = Math.ceil(Math.random() * 100);
            gameCheck.increment({ladyluck: -player*10})
        }
    }
    let evaRoll = Math.ceil(Math.random() * 100);
    let crtRoll = Math.ceil(Math.random() * 100);
    const effect = ability.effect;
    const self = ability.self;
    const dmgvar = Math.floor(Math.random() * (ability.dmgvar + 1));
    if (ability.damage == 0) {
        console.log(`${targetUnit} healing targetting!`);
        await processPhase(interaction, gameCheck, currentPhase, abilityNumber, effect, weaponArray, nameArray, unit, targetUnit, false, false);
        await processPhase(interaction, gameCheck, currentPhase, abilityNumber, self, weaponArray, nameArray, unit, targetUnit, false, false);
    } else if (hitRoll > acc) {
        //miss
        await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s ${ability.abilityName} missed ${nameArray[targetUnit].logName}.`);
        gameCheck.increment({ladyluck: player*(100-acc)/5})
        await processPhase(interaction, gameCheck, currentPhase, abilityNumber ,effect, weaponArray, nameArray, unit, targetUnit, false, false);
        await processPhase(interaction, gameCheck, currentPhase, abilityNumber ,self, weaponArray, nameArray, unit, targetUnit, false, false);
    } else {
        //hit
        if(evaRoll > eva) {
            //hit
            if(crtRoll < crt) {
                //total atk*(abilityatk)%*(100+crd)%-armor
                let critDamage = Math.round(((atk*(ability.damage/100)+dmgvar)*((100+(crd+ability.crd)))/100)-armor);
                if (critDamage <= 0) {
                    critDamage = 0;
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s ${ability.abilityName} critical strike was blocked by ${nameArray[targetUnit].logName}`);
                } else {
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s ${ability.abilityName} critically strike ${nameArray[targetUnit].logName} for ${critDamage} damage!`);
                    await targetHp.increment({statusValue: -critDamage})
                }
                if(targetHp.statusValue <= critDamage) {
                    await targetHp.update({statusValue: 0})
                    await updateGamelog(interaction, gameCheck, `${nameArray[targetUnit].logName} has been eliminated.`);
                }
                await processPhase(interaction, gameCheck, currentPhase, abilityNumber, effect, weaponArray, nameArray, unit, targetUnit, true, true);
                await processPhase(interaction, gameCheck, currentPhase, abilityNumber, self, weaponArray, nameArray, unit, targetUnit, true, true);
                //crit
            } else {
                let hitDamage = Math.round((atk*(ability.damage/100)+dmgvar)-armor);
                if (hitDamage <= 0) {
                    hitDamage = 0;
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s ${ability.abilityName} hit was blocked by ${nameArray[targetUnit].logName}.`);
                } else {
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s ${ability.abilityName} hit ${nameArray[targetUnit].logName} for ${hitDamage} damage.`);
                    await targetHp.increment({statusValue: -hitDamage})
                }
                
                if(targetHp.statusValue <= hitDamage) {
                    await targetHp.update({statusValue: 0})
                    await updateGamelog(interaction, gameCheck, `${nameArray[targetUnit].logName} has been eliminated.`);
                }
                await processPhase(interaction, gameCheck, currentPhase, abilityNumber, effect, weaponArray, nameArray, unit, targetUnit, true, false);
                await processPhase(interaction, gameCheck, currentPhase, abilityNumber, self, weaponArray, nameArray, unit, targetUnit, true, false);
                //nocrit
            }
        } else {
            await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s ${ability.abilityName} was evaded by ${nameArray[targetUnit].logName}.`);
            await processPhase(interaction, gameCheck, currentPhase, abilityNumber, effect, weaponArray, nameArray, unit, targetUnit, false, false);
            await processPhase(interaction, gameCheck, currentPhase, abilityNumber, self, weaponArray, nameArray, unit, targetUnit, false, false);
            //dodge
        }
    }
}

async function processAttack(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, unit, target) {
    try {
        const weapon = weaponArray[unit];
        const ability = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: abilityNumber}});
        const cd = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: abilityNumber+2}});
        if (cd) {
            await cd.update({duration: ability.cooldown});
        }
        let atk = weapon.atk;
        let acc = weapon.acc + ability.acc;
        let crt = weapon.crt + ability.crt;
        let crd = weapon.crd + ability.crd;
        const statusList = await database.Status.findAll({
            where: {
            gameID: gameCheck.id,
            unitNumber: unit,
            statusID: {
                [Op.between]: [12, 21]
            }
            }
        });
        for (let i = 1; i < statusList.length; i++) {
            switch(statusList[i].statusID) {
                case 12:
                    atk -= statusList[i].statusValue;
                    break;

                case 13:
                    atk += statusList[i].statusValue;
                    break;
                    
                case 16:
                    acc -= statusList[i].statusValue;
                    break;
                case 17:
                    acc += statusList[i].statusValue;
                    break;
                    
                case 18:
                    crt -= statusList[i].statusValue;
                    break;
                    
                case 19:
                    crt += statusList[i].statusValue;
                    break;
                    
                case 20:
                    crd -= statusList[i].statusValue;
                    break;
                    
                case 21:
                    crd += statusList[i].statusValue;
                    break;

                default:
                    break;
            }
        }


        const targetInt = ability.target;
        let targetUnit;
        if (targetInt == 1) {
            await processHit(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, unit, target, atk, acc, crt, crd)
        } else if (targetInt == 6) {
            if(unit < 5) {
                //attack 5-9
                for (let i = 5; i < 10; i++) {
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID:1}});
                    if (hp.statusValue > 0) {
                        await processHit(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, unit, i, atk, acc, crt, crd)
                    }
                }
            } else {
                //attack 0-4
                for (let i = 0; i < 5; i++) {
                    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: i, statusID:1}});
                    if (hp.statusValue > 0) {
                        await processHit(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, unit, i, atk, acc, crt, crd)
                    }
                }
            }
        } else if((unit < 5 && targetInt > 0) || (unit >=5 && targetInt < 0)) {
            //target on 5-9
            targetUnit = await switchTargetP2(interaction, gameCheck, Math.abs(targetInt));
            await processHit(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, unit, targetUnit, atk, acc, crt, crd);
        } else if (targetInt == 0) {
            //target self
            targetUnit = unit;
            await processHit(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, unit, targetUnit, atk, acc, crt, crd);
        } else if (unit >=5 && targetInt > 0 || unit < 5 && targetInt < 0) {
            targetUnit = await switchTargetP1(interaction, gameCheck, Math.abs(targetInt));
            await processHit(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, unit, targetUnit, atk, acc, crt, crd);
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in processAttack`);
    }
}

async function updateButton(interaction, row, row2){
    try {
    await interaction.editReply( {components: [row, row2], fetchReply: true});
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in updateButton`);
    }
}

async function createGameLogEmbed(gameCheck, colour, field) {
    const gamelog = await database.Gamelog.findOne({where: {gameID: gameCheck.id}});
    let logstring;
    const logArray = await gamelog.text.split("\n");
    if(logArray.length > 20) {
        const lastTwenty = await logArray.slice(0,20);
        logstring = lastTwenty.reverse().join("\n");
    } else {
        logstring = logArray.reverse().join("\n");
    }
    const embedLog = new MessageEmbed();
    embedLog.setTitle("Game log").setDescription(`${logstring}`).setColor(colour).setImage(field);
    return embedLog;
}

async function createGameLogEmbed2(gameCheck, colour) {
    const gamelog = await database.Gamelog.findOne({where: {gameID: gameCheck.id}});
    let logstring;
    const logArray = await gamelog.text.split("\n");
    if(logArray.length > 20) {
        const lastTwenty = await logArray.slice(0,20);
        logstring = lastTwenty.reverse().join("\n");
    } else {
        logstring = logArray.reverse().join("\n");
    }
    const embedLog = new MessageEmbed();
    embedLog.setTitle("Game log").setDescription(`${logstring}`).setColor(colour);
    return embedLog;
}


async function buttonManager(interaction, msg, embed, row, row2, row3, logViewed, gameCheck, colour, player, player1, player2, weaponArray, passiveArray, nameArray, unit, abilityNumber, field) {
    try {
        if(!logViewed) {
            row = await cdCheck(interaction, gameCheck.id, unit, row, logViewed, weaponArray);
            await interaction.editReply({content: "loading",components: [row, row2, row3], fetchReply: true});
        }
        const filter = i => i.user.id === player;
        let ability;
        let embedLog;
        const currentPhase = gameCheck.phase;
        const currentUnit = unit;
        const collector = await msg.createMessageComponentCollector({ filter, max:1, time: 120000 });
        //if you press a1, a2, or a3, it allows you to press the second row, 
        await collector.on('collect', async i => {
            i.deferUpdate();
            switch (i.customId){
                case 'a1':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: 1}});
                    abilityNumber = 1;
                    row2 = await rangeCheckRed(interaction, gameCheck.id, unit, row2, ability);
                    row3 = await rangeCheckBlue(interaction, gameCheck.id, unit, row3, ability);
                    await interaction.editReply({content: "loading", components: [row, row2, row3], fetchReply: true});
                    return await buttonManager(interaction, msg, embed, row, row2, row3, logViewed, gameCheck, colour, player, 
                        player1, player2, weaponArray, passiveArray, nameArray, unit, abilityNumber, field);
                    //do basic attack
                    break;
                
                case 'a2':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: 2}});
                    abilityNumber = 2;
                    row2 = await rangeCheckRed(interaction, gameCheck.id, unit, row2, ability);
                    row3 = await rangeCheckBlue(interaction, gameCheck.id, unit, row3, ability);
                    await interaction.editReply({content: "loading", components: [row, row2, row3], fetchReply: true});
                    return await buttonManager(interaction, msg, embed, row, row2, row3, logViewed, gameCheck, colour, player, 
                        player1, player2, weaponArray, passiveArray, nameArray, unit, abilityNumber, field);
                    //do ability1
                    break;
                
                case 'a3':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: 3}});
                    abilityNumber = 3;
                    row2 = await rangeCheckRed(interaction, gameCheck.id, unit, row2, ability);
                    row3 = await rangeCheckBlue(interaction, gameCheck.id, unit, row3, ability);
                    await interaction.editReply({content: "loading", components: [row, row2, row3], fetchReply: true});
                    return await buttonManager(interaction, msg, embed, row, row2, row3, logViewed, gameCheck, colour, player, 
                        player1, player2, weaponArray, passiveArray, nameArray, unit, abilityNumber, field);
                    //do ability2
                    break;
                    
                case 'skip':
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} skipped turn.`);
                    await database.Status.create({
                        gameID: gameCheck.id,
                        unitNumber: unit,
                        statusID: 28
                    })
                    embedLog = await createGameLogEmbed(gameCheck, colour, field);
                    await interaction.editReply({embeds: [embedLog]})
                    
                    return continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, currentUnit);
                    break;

                case 'log':
                    row = await cdCheck(interaction, gameCheck.id, unit, row, true, weaponArray);
                    embedLog = await createGameLogEmbed(gameCheck, colour, field);
                    msg = await interaction.editReply({embeds: [embedLog], components: [row, row2, row3], fetchReply: true});
                    return await buttonManager(interaction, msg, embed, row, row2, row3, true, gameCheck, colour, player, 
                            player1, player2, weaponArray, passiveArray, nameArray, unit, abilityNumber, field);

                case 'info':
                    row = await cdCheck(interaction, gameCheck.id, unit, row, true, weaponArray);
                    msg = await interaction.editReply({embeds: [embed], components: [row, row2, row3], fetchReply: true});
                    return await buttonManager(interaction, msg, embed, row, row2, row3, false, gameCheck, colour, player, 
                            player1, player2, weaponArray, passiveArray, nameArray, unit, abilityNumber, field);

                case '0':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: abilityNumber}});
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} used ${ability.abilityName}`);
                    await processAttack(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, currentUnit, 0);
                    await database.Status.create({
                        gameID: gameCheck.id,
                        unitNumber: unit,
                        statusID: 28
                    })
                    embedLog = await createGameLogEmbed2(gameCheck, colour);
                    await interaction.editReply({embeds: [embedLog]})
                    return continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, currentUnit);

                case '1':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: abilityNumber}});
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} used ${ability.abilityName}`);
                    await processAttack(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, currentUnit, 1);
                    await database.Status.create({
                        gameID: gameCheck.id,
                        unitNumber: unit,
                        statusID: 28
                    })
                    embedLog = await createGameLogEmbed2(gameCheck, colour);
                    await interaction.editReply({embeds: [embedLog]})
                    return continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, currentUnit);

                case '2':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: abilityNumber}});
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} used ${ability.abilityName}`);
                    await processAttack(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, currentUnit, 2);
                    await database.Status.create({
                        gameID: gameCheck.id,
                        unitNumber: unit,
                        statusID: 28
                    })
                    embedLog = await createGameLogEmbed2(gameCheck, colour);
                    await interaction.editReply({embeds: [embedLog]})
                    return continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, currentUnit);

                case '3':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: abilityNumber}});
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} used ${ability.abilityName}`);
                    await processAttack(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, currentUnit, 3);
                    await database.Status.create({
                        gameID: gameCheck.id,
                        unitNumber: unit,
                        statusID: 28
                    })
                    embedLog = await createGameLogEmbed2(gameCheck, colour);
                    await interaction.editReply({embeds: [embedLog]})
                    return continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, currentUnit);

                case '4':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: abilityNumber}});
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} used ${ability.abilityName}`);
                    await processAttack(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, currentUnit, 4);
                    await database.Status.create({
                        gameID: gameCheck.id,
                        unitNumber: unit,
                        statusID: 28
                    })
                    embedLog = await createGameLogEmbed2(gameCheck, colour);
                    await interaction.editReply({embeds: [embedLog]})
                    return continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, currentUnit);

                case '5':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: abilityNumber}});
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} used ${ability.abilityName}`);
                    await processAttack(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, currentUnit, 5);
                    await database.Status.create({
                        gameID: gameCheck.id,
                        unitNumber: unit,
                        statusID: 28
                    })
                    embedLog = await createGameLogEmbed2(gameCheck, colour);
                    await interaction.editReply({embeds: [embedLog]})
                    return continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, currentUnit);

                case '6':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: abilityNumber}});
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} used ${ability.abilityName}`);
                    await processAttack(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, currentUnit, 6);
                    await database.Status.create({
                        gameID: gameCheck.id,
                        unitNumber: unit,
                        statusID: 28
                    })
                    embedLog = await createGameLogEmbed2(gameCheck, colour);
                    await interaction.editReply({embeds: [embedLog]})
                    return continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, currentUnit);

                case '7':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: abilityNumber}});
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} used ${ability.abilityName}`);
                    await processAttack(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, currentUnit, 7);
                    await database.Status.create({
                        gameID: gameCheck.id,
                        unitNumber: unit,
                        statusID: 28
                    })
                    embedLog = await createGameLogEmbed2(gameCheck, colour);
                    await interaction.editReply({embeds: [embedLog]})
                    return continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, currentUnit);

                case '8':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: abilityNumber}});
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} used ${ability.abilityName}`);
                    await processAttack(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, currentUnit, 8);
                    await database.Status.create({
                        gameID: gameCheck.id,
                        unitNumber: unit,
                        statusID: 28
                    })
                    embedLog = await createGameLogEmbed2(gameCheck, colour);
                    await interaction.editReply({embeds: [embedLog]})
                    return continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, currentUnit);

                case '9':
                    ability = await database.Ability.findOne({where: {weaponID: weaponArray[unit].id, abilitySlot: abilityNumber}});
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} used ${ability.abilityName}`);
                    await processAttack(interaction, gameCheck, currentPhase, weaponArray, abilityNumber, nameArray, currentUnit, 9);
                    await database.Status.create({
                        gameID: gameCheck.id,
                        unitNumber: unit,
                        statusID: 28
                    })
                    embedLog = await createGameLogEmbed2(gameCheck, colour);
                    await interaction.editReply({embeds: [embedLog]})
                    return continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, currentUnit);

                

                default:
                    break;
            };
            
        }
        );
        //
    } catch(error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in buttonmanager`);
    }
}

async function checkPos(interaction, gameID, unitNumber) {
    try {
        let pos = 1;
        
        if(unitNumber < 5) {
            //player 1 side
            for(let i = 0; i < unitNumber; i++) {
                const hp = await database.Status.findOne({where: {gameID: gameID, unitNumber: i, statusID:1}});
                if(hp.statusValue > 0) {
                    pos+=1;
                }
            }
        } else {
            for(let i = 5; i < unitNumber; i++) {
                const hp = await database.Status.findOne({where: {gameID: gameID, unitNumber: i, statusID:1}});
                if(hp.statusValue > 0) {
                    pos+=1;
                }
            }
        }
        
        return pos;
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in checkPos`);
    }
}

//find target pos.

async function cdCheck(interaction, gameID, unitNumber, row, logViewed, weaponArray) {
    try {
        const cd1 = await database.Status.findOne({where: {gameID:gameID, unitNumber: unitNumber, statusID: 3}})
        const cd2 = await database.Status.findOne({where: {gameID:gameID, unitNumber: unitNumber, statusID: 4}})
        const cd3 = await database.Status.findOne({where: {gameID:gameID, unitNumber: unitNumber, statusID: 5}})
        const a1 = await database.Ability.findOne({where: {weaponID: weaponArray[unitNumber].id, abilitySlot:1}});
        const a2 = await database.Ability.findOne({where: {weaponID: weaponArray[unitNumber].id, abilitySlot:2}});
        const a3 = await database.Ability.findOne({where: {weaponID: weaponArray[unitNumber].id, abilitySlot:3}});
        const pos = await checkPos(interaction, gameID, unitNumber);
        //also do range check
        if (cd1.duration == 0 && a1.range >= pos) {
            row.components[0].setDisabled(false);
        } else {
            row.components[0].setDisabled(true);
        }
        if (cd2.duration == 0 && a2.range >= pos) {
            row.components[1].setDisabled(false);
        } else {
            row.components[1].setDisabled(true);
        }
        if (cd3.duration == 0 && a3.range >= pos) {
            row.components[2].setDisabled(false);
        } else {
            row.components[2].setDisabled(true);
        }
        if (logViewed) {
            row.components[4].setCustomId('info').setLabel('info').setDisabled(false);
        } else {
            row.components[4].setCustomId('log').setLabel('log').setDisabled(false);
        }
        return row;
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in cd check`);
    }
}


async function rangeCheckRedSelf(unitNumber, row) {
    //unit number between 0-9
    //if 0-4 red, if 5-9 blue. And self slot is lit.
    if (unitNumber < 5) {
        const target = Math.abs(unitNumber-4)
        row.components[target].setDisabled(false);
    } else {
        row.components[0].setDisabled(true);
        row.components[1].setDisabled(true);
        row.components[2].setDisabled(true);
        row.components[3].setDisabled(true);
        row.components[4].setDisabled(true);
    }
    return row;
}

async function rangeCheckRedEnemy(gameID, unitNumber, row, reach) {
    //unit number between 0-9
    //if 0-4 red, if 5-9 blue. And self slot is lit. Activate Reach buttons ignoring dead enemies.
    //This is for blue attacking red. checks 4 then 3, then 2, then 1.
    if (unitNumber > 4) {
        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameID, unitNumber: {[Op.between]: [0, 4]}, statusID: 1}});
        for(let i = 4, j = reach, k = 0; i > -1 && j > 0; i--, k++) {
            if (hparray[k].statusValue > 0) {
                row.components[i].setDisabled(false);
                j--;
            }
        }
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;
}

async function rangeCheckRedAllEnemies(gameID, unitNumber, row, reach) {
    if (unitNumber > 4) {
        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameID, unitNumber: {[Op.between]: [0, 4]}, statusID: 1}});
        for(let i = 4, j = reach, k = 0; i > -1 && j > 0; i--, k++) {
            if (hparray[k].statusValue > 0) {
                row.components[i].setDisabled(false);
                j--;
            }
        }
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;
}

async function rangeCheckRedREnemies(gameID, unitNumber, row, reach) {
    if (unitNumber > 4) {
        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameID, unitNumber: {[Op.between]: [0, 4]}, statusID: 1}});
        for(let i = 4, j = reach, k = 0; i > -1 && j > 0; i--, k++) {
            if (hparray[k].statusValue > 0) {
                row.components[i].setDisabled(false);
                j--;
            }
        }
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;
}

async function rangeCheckRedAlly(gameID, unitNumber, row) {
    if (unitNumber < 5) {
        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameID, unitNumber: {[Op.between]: [0, 4]}, statusID: 1}});
        for(let i = 4, k = 0; i > -1; i--, k++) {
            if (hparray[k].statusValue > 0) {
                row.components[i].setDisabled(false);
            }
        }
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;    
}

async function rangeCheckRedAllAllies(gameID, unitNumber, row) {
    if (unitNumber < 5) {
        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameID, unitNumber: {[Op.between]: [0, 4]}, statusID: 1}});
        for(let i = 4, k = 0; i > -1; i--, k++) {
            if (hparray[k].statusValue > 0) {
                row.components[i].setDisabled(false);
            }
        }
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;
}

async function rangeCheckRedRAllies(gameID, unitNumber, row) {
    if (unitNumber < 5) {
        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameID, unitNumber: {[Op.between]: [0, 4]}, statusID: 1}});
        for(let i = 4, k = 0; i > -1; i--, k++) {
            if (hparray[k].statusValue > 0) {
                row.components[i].setDisabled(false);
            }
        }
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;
}

async function rangeCheckBlueSelf(unitNumber, row) {
    //unit number between 0-9
    //if 0-4 red, if 5-9 blue. And self slot is lit.
    if (unitNumber > 4) {
        const target = unitNumber-5
        row.components[target].setDisabled(false);
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;
}

async function rangeCheckBlueEnemy(gameID, unitNumber, row, reach) {
    //unit number between 0-9
    //if 0-4 red, if 5-9 blue. And self slot is lit. Activate Reach buttons ignoring dead enemies.
    if (unitNumber < 5) {
        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameID, unitNumber: {[Op.between]: [5, 9]}, statusID: 1}});
        for(let i = 0, j = reach; i < 5 && j > 0; i++) {
            if (hparray[i].statusValue > 0) {
                row.components[i].setDisabled(false);
                j--;
            }
        }
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;
}

async function rangeCheckBlueAllEnemies(gameID, unitNumber, row, reach) {
    if (unitNumber < 5) {
        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameID, unitNumber: {[Op.between]: [5, 9]}, statusID: 1}});
        for(let i = 0, j = reach; i < 5 && j > 0; i++) {
            if (hparray[i].statusValue > 0) {
                row.components[i].setDisabled(false);
                j--;
            }
        }
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;
}

async function rangeCheckBlueREnemies(gameID, unitNumber, row, reach) {
    if (unitNumber < 5) {
        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameID, unitNumber: {[Op.between]: [5, 9]}, statusID: 1}});
        for(let i = 0, j = reach; i < 5 && j > 0; i++) {
            if (hparray[i].statusValue > 0) {
                row.components[i].setDisabled(false);
                j--;
            }
        }
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;
}

async function rangeCheckBlueAlly(gameID, unitNumber, row) {
    if (unitNumber > 4) {
        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameID, unitNumber: {[Op.between]: [5, 9]}, statusID: 1}});
        for(let i = 0; i < 5; i++) {
            if (hparray[i].statusValue > 0) {
                row.components[i].setDisabled(false);
            }
        }
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;    
}

async function rangeCheckBlueAllAllies(gameID, unitNumber, row) {
    if (unitNumber > 4) {
        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameID, unitNumber: {[Op.between]: [5, 9]}, statusID: 1}});
        for(let i = 0; i < 5; i++) {
            if (hparray[i].statusValue > 0) {
                row.components[i].setDisabled(false);
            }
        }
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;
}

async function rangeCheckBlueRAllies(gameID, unitNumber, row) {
    if (unitNumber > 4) {
        const hparray = await database.Status.findAll({order: [['unitNumber','ASC']], where: {gameID: gameID, unitNumber: {[Op.between]: [5, 9]}, statusID: 1}});
        for(let i = 0; i < 5; i++) {
            if (hparray[i].statusValue > 0) {
                row.components[i].setDisabled(false);
            }
        }
    } else {
        row.components[0].setDisabled(true)
        row.components[1].setDisabled(true)
        row.components[2].setDisabled(true)
        row.components[3].setDisabled(true)
        row.components[4].setDisabled(true)
    }
    return row;
}

async function rangeCheckRed(interaction, gameID, unitNumber, row, ability) {
    try {
        //edits row 2
        const target = ability.target;
        const range = ability.range;
        const pos = await checkPos(interaction, gameID, unitNumber);
        const reach = range - pos;
        switch(target) {
            case 0:
                row = await rangeCheckRedSelf(unitNumber, row);
                //self
                break;
            
            case 1:
                row = await rangeCheckRedEnemy(gameID, unitNumber, row, reach);
                //choose enemy within range
                break;
            
            case 6:
                row = await rangeCheckRedAllEnemies(gameID, unitNumber, row, reach);
                //all enemies within range
                break;

            case 7:
                row = await rangeCheckRedREnemies(gameID, unitNumber, row, reach);
                //A random enemy within range
                break;

            case -1:
                row = await rangeCheckRedAlly(gameID, unitNumber, row);
                //choose all allies
                break;
            
            case -6:
                row = await rangeCheckRedAllAllies(gameID, unitNumber, row);
                //choose all allies
                break;

            case -7:
                row = await rangeCheckRedRAllies(gameID, unitNumber, row);
                //choose a random ally.
                break;

            default:
                break;
        }
        return row;
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in rangeChecks`);
    }
}

async function rangeCheckBlue(interaction, gameID, unitNumber, row, ability) {
    try {
        //edits row 3
        const target = ability.target;
        const range = ability.range;
        const pos = await checkPos(interaction, gameID, unitNumber);
        const reach = range - pos;
        switch(target) {
            case 0:
                row = await rangeCheckBlueSelf(unitNumber, row);
                //self
                break;
            
            case 1:
                row = await rangeCheckBlueEnemy(gameID, unitNumber, row, reach);
                //choose enemy within range
                break;
            
            case 6:
                row = await rangeCheckBlueAllEnemies(gameID, unitNumber, row, reach);
                //all enemies within range
                break;

            case 7:
                row = await rangeCheckBlueREnemies(gameID, unitNumber, row, reach);
                //A random enemy within range
                break;

            case -1:
                row = await rangeCheckBlueAlly(gameID, unitNumber, row);
                //choose all allies
                break;
            
            case -6:
                row = await rangeCheckBlueAllAllies(gameID, unitNumber, row);
                //choose all allies
                break;

            case -7:
                row = await rangeCheckBlueRAllies(gameID, unitNumber, row);
                //choose a random ally.
                break;

            default:
                break;
        }
        return row;
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in rangeChecks`);
    }
}



async function createButton() {
    try {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('a1')
                    .setLabel('Attack')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('a2')
                    .setLabel('Primary')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('a3')
                    .setLabel('Secondary')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('skip')
                    .setLabel('skip')
                    .setStyle('SECONDARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('log')
                    .setLabel('log')
                    .setStyle('SECONDARY')
            )
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function createButtonRed() {
    try {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('4')
                    .setLabel('5')
                    .setStyle('DANGER')
                    .setDisabled(true)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('3')
                    .setLabel('4')
                    .setStyle('DANGER')
                    .setDisabled(true)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('2')
                    .setLabel('3')
                    .setStyle('DANGER')
                    .setDisabled(true)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('1')
                    .setLabel('2')
                    .setStyle('DANGER')
                    .setDisabled(true)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('0')
                    .setLabel('1')
                    .setStyle('DANGER')
                    .setDisabled(true)
            )
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton2");
    }
}

async function createButtonBlue() {
    try {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('5')
                    .setLabel('1')
                    .setStyle('PRIMARY')
                    .setDisabled(true)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('6')
                    .setLabel('2')
                    .setStyle('PRIMARY')
                    .setDisabled(true)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('7')
                    .setLabel('3')
                    .setStyle('PRIMARY')
                    .setDisabled(true)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('8')
                    .setLabel('4')
                    .setStyle('PRIMARY')
                    .setDisabled(true)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('9')
                    .setLabel('5')
                    .setStyle('PRIMARY')
                    .setDisabled(true)
            )
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton2");
    }
}


async function findUnitID(gameCheck, unit) {
    switch (unit) {
        case 0:
            return gameCheck.unit1;
        case 1:
            return gameCheck.unit2;
        case 2:
            return gameCheck.unit3;
        case 3:
            return gameCheck.unit4;
        case 4:
            return gameCheck.unit5;
        case 5:
            return gameCheck.unit6;
        case 6:
            return gameCheck.unit7;
        case 7:
            return gameCheck.unit8;
        case 8:
            return gameCheck.unit9;
        case 9:
            return gameCheck.unit10;
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


async function switchRarityColour(rarity) {
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

async function switchWRarityColour(weaponRarity) {
    switch (weaponRarity) {
        case 1:
            return color.blue;
        case 2:
            return color.purple;
        case 3:
            return color.stellar;
    }
}

async function makeProfileCard(imageURL, cardRarity, weaponRarity, wclass, hp, maxhp, init, armor, atk, eva, acc, crt, crd, gameCheck, unit) {
    try {
        const canvas = createCanvas(496, 438);
        const context = canvas.getContext('2d');
        const frameURL = 'https://cdn.discordapp.com/attachments/1086674842893438976/1091613791596314694/profile.png';
        const frame = await loadImage(frameURL);
        const charImage = await loadImage(imageURL);
        context.drawImage(frame, 0, 0, 496, 438);
        context.drawImage(charImage, 12, 76, 225, 350);
        const cardColour = await switchRarityColour(cardRarity);
        context.strokeStyle = cardColour;
        context.lineWidth = 6;
        context.strokeRect(11, 75, 227, 352);
        const weaponColour = await switchWRarityColour(weaponRarity);
        context.font = '48px "joystix monospace"';
        context.fillStyle = weaponColour;
        context.fillText(`${wclass}`, 15, 48, 466);
        let hpy;
        if(hp > maxhp) {
            context.fillStyle = color.blue;
            hpy = 232;
        } else {
            context.fillStyle = "green";
            hpy = 232 * (hp/maxhp);
        }
        context.fillRect(256, 72, hpy, 32);
        context.font = '28px "joystix monospace"';
        context.fillStyle = 'white';
        context.fillText(`${hp}/${maxhp}`, 262, 97);
        context.fillText(`${init}`, 390, 201);
        context.fillText(`${armor}`, 390, 239);
        context.fillText(`${atk}`, 390, 277);
        context.fillText(`${acc}`, 390, 315);
        context.fillText(`${eva}`, 390, 353);
        context.fillText(`${crt}`, 390, 391);
        context.fillText(`${crd}`, 390, 429);
        const statusList = await database.Status.findAll({order: [['statusID', 'ASC']], where: {gameID: gameCheck.id, unitNumber: unit, displayImage: true}});
        const uniqueStatusList = statusList.reduce((acc, cur) => {
            if (!acc.find(item => item.statusID === cur.statusID)) {
              acc.push(cur);
            }
            return acc;
          }, []);
        let status
        let image;
        for (let i = 0; i < uniqueStatusList.length && i < 4; i++) {
            status = await database.StatusType.findOne({where: {id: uniqueStatusList[i].statusID}});
            image = await loadImage(status.statusSprite);
            context.drawImage(image, 256+62*i, 116, 48, 48);
        }
        const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-card.png');
        return attachment;
    } catch (error) {
        console.log(error);
    }
}


async function viewPinkCard(card, interaction, colour, gameCheck, unit) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    const weapon = await database.Weapon.findOne({where: {id: card.weapon}});
    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 1}});
    const a0cd = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 2}});
    const a1cd = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 3}});
    const a2cd = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 4}});
    const a3cd = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 5}});
    const statusList = await database.Status.findAll({
        where: {
          gameID: gameCheck.id,
          unitNumber: unit,
          statusID: {
            [Op.between]: [6, 27]
          }
        }
    });
    let init = weapon.init;
    let maxhp = weapon.health
    let armor = weapon.armor;
    let atk = weapon.atk;
    let eva = weapon.eva;
    let acc = weapon.acc;
    let crt = weapon.crt;
    let crd = weapon.crd;
    let initstr = "";
    let maxhpstr = "";
    let hpStr = "";
    let armorstr = "";
    let atkstr = "";
    let evastr = "";
    let accstr = "";
    let crtstr = "";
    let crdstr = "";
    let a1str = "";
    let a2str = "";
    let a3str = "";
    for (let i = 0; i < statusList.length; i++) {
        switch (statusList[i].statusID) {
            case 6:
                init -= statusList[i].statusValue;
                initstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 7:
                init += statusList[i].statusValue;
                initstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 8:
                maxhp -= statusList[i].statusValue;
                maxhpstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                
            case 9:
                maxhp += statusList[i].statusValue;
                maxhpstr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
            
            case 10:
                armor -= statusList[i].statusValue;
                armorstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 11:
                armor += statusList[i].statusValue;
                armorstr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 12:
                atk -= statusList[i].statusValue;
                atkstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;    
                
            case 13:
                atk += statusList[i].statusValue;
                atkstr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 14:
                eva -= statusList[i].statusValue;
                evastr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 15:
                eva += statusList[i].statusValue;
                evastr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 16:
                acc -= statusList[i].statusValue;
                accstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 17:
                acc += statusList[i].statusValue;
                accstr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 18:
                crt -= statusList[i].statusValue;
                crtstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 19:
                crt += statusList[i].statusValue;
                crtstr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 20:
                crd -= statusList[i].statusValue;
                crdstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 21:
                crd += statusList[i].statusValue;
                crdstr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
            
            case 22:
                a2str = `(Silenced[${statusList[i].duration}])`;
                a3str = `(Silenced[${statusList[i].duration}])`;
                break;

            case 23:
                a1str = `(Disarmed[${statusList[i].duration}])`;
                break;

            case 24:
                hpStr.concat(`(DoT: ${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 25:
                hpStr.concat(`(HoT: ${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 26:
                a1str = `(Stunned[${statusList[i].duration}])`;
                a2str = `(Stunned[${statusList[i].duration}])`;
                a3str = `(Stunned[${statusList[i].duration}])`;
                break;
            
            default:
                break;
        }
    }
    let image;
    let url;
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: card.imageID}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*Set image with /diaset*`)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.setFooter("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.
*Set image with /diaset*`)
        } else {
            url = 'https://cdn.discordapp.com/attachments/948195855742165013/998254327523180685/stockc.png';
            embedCard.setFooter("no image found", "Send an official image for this character.")
        }
    } else {
        url = 'https://cdn.discordapp.com/attachments/948195855742165013/998254327523180685/stockc.png';
        embedCard.setFooter("no image found", "Send an official image for this character. Then update the card!")
    }
    const rarityText = await switchRarityText(card.rarity);
    const profileImage = await makeProfileCard(url, card.rarity, weapon.rarity, weapon.class, hp.statusValue, maxhp, init, armor, atk, eva, acc, crt, crd, gameCheck, unit);
    let channel = interaction.guild.channels.cache.get('1089177404209123370');
    const message = await channel.send({ files: [profileImage] });
    const sentMessage = await message.channel.messages.fetch(message.id);
    const attachment = sentMessage.attachments.first();
    const attachmentURL = attachment.proxyURL;
    embedCard.setTitle(`${char.characterName}`)
        .setDescription(`Card Info
**LID: ** ${card.inventoryID} | **CID:** ${cid}
**Series: ** ${char.seriesID} | ${series.seriesName}
**Rarity: **${rarityText}
**Weapon: **${weapon.name}`)
        .setColor(colour)
        .setThumbnail(`${weapon.weaponSprite}`)
        .setImage(attachmentURL);
    const ability0 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 0}});
    const ability1 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 1}});
    const ability2 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 2}});
    const ability3 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 3}});
    if(ability0) {
        embedCard.addFields({name: `Passive: ${ability0.abilityName} | ${a0cd.duration}`, value: `${ability0.abilityText}`});
    }
    if(ability1) {
        embedCard.addFields({name: `Attack: ${ability1.abilityName} | ${a1cd.duration}${a1str}`, value: `${ability1.abilityText}`});
    }
    if(ability2) {
        embedCard.addFields({name: `Primary: ${ability2.abilityName} | ${a2cd.duration}${a2str}`, value: `${ability2.abilityText}`});
    }
    if(ability3) {
        embedCard.addFields({name: `Secondary: ${ability3.abilityName} | ${a3cd.duration}${a3str}`, value: `${ability3.abilityText}`});
    }
    return embedCard;
}

async function viewAzurCard(card, interaction, colour, gameCheck, unit) { 
    const Azurite = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const embedCard = new MessageEmbed();
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    const weapon = await database.Weapon.findOne({where: {id: card.weapon}});
    const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 1}});
    const a0cd = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 2}});
    const a1cd = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 3}});
    const a2cd = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 4}});
    const a3cd = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 5}});
    const statusList = await database.Status.findAll({
        where: {
          gameID: gameCheck.id,
          unitNumber: unit,
          statusID: {
            [Op.between]: [6, 27]
          }
        }
    });
    let init = weapon.init;
    let hpStr = "";
    let maxhp = weapon.health
    let armor = weapon.armor;
    let atk = weapon.atk;
    let eva = weapon.eva;
    let acc = weapon.acc;
    let crt = weapon.crt;
    let crd = weapon.crd;
    let initstr = "";
    let maxhpstr = "";
    let armorstr = "";
    let atkstr = "";
    let evastr = "";
    let accstr = "";
    let crtstr = "";
    let crdstr = "";
    let a1str = "";
    let a2str = "";
    let a3str = "";
    for (let i = 0; i < statusList.length; i++) {
        switch (statusList[i].statusID) {
            case 6:
                init -= statusList[i].statusValue;
                initstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 7:
                init += statusList[i].statusValue;
                initstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 8:
                maxhp -= statusList[i].statusValue;
                maxhpstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                
            case 9:
                maxhp += statusList[i].statusValue;
                maxhpstr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
            
            case 10:
                armor -= statusList[i].statusValue;
                armorstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 11:
                armor += statusList[i].statusValue;
                armorstr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 12:
                atk -= statusList[i].statusValue;
                atkstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;    
                
            case 13:
                atk += statusList[i].statusValue;
                atkstr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 14:
                eva -= statusList[i].statusValue;
                evastr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 15:
                eva += statusList[i].statusValue;
                evastr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 16:
                acc -= statusList[i].statusValue;
                accstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 17:
                acc += statusList[i].statusValue;
                accstr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 18:
                crt -= statusList[i].statusValue;
                crtstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 19:
                crt += statusList[i].statusValue;
                crtstr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 20:
                crd -= statusList[i].statusValue;
                crdstr.concat(` (-${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
                
            case 21:
                crd += statusList[i].statusValue;
                crdstr.concat(` (+${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;
            
            case 22:
                a2str = `(Silenced[${statusList[i].duration}])`;
                a3str = `(Silenced[${statusList[i].duration}])`;
                break;

            case 23:
                a1str = `(Disarmed[${statusList[i].duration}])`;
                break;

            case 24:
                hpStr.concat(`(DoT: ${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 25:
                hpStr.concat(`(HoT: ${statusList[i].statusValue}[${statusList[i].duration}])`);
                break;

            case 26:
                a1str = `(Stunned[${statusList[i].duration}])`;
                a2str = `(Stunned[${statusList[i].duration}])`;
                a3str = `(Stunned[${statusList[i].duration}])`;
                break;
            
            default:
                break;
        }
    }
    //all we get is inventory id and player id
    embedCard.setFooter(`Art by ${Azurite.artist}
*Upload your choice of image of the character using with /stellarupload*`).setImage(Azurite.imageURL);
    const profileImage = await makeProfileCard(url, card.rarity, weapon.rarity, weapon.class, hp.statusValue, maxhp, init, armor, atk, eva, acc, crt, crd, gameCheck, unit);
    let channel = interaction.guild.channels.cache.get('1089177404209123370');
    const message = await channel.send({ files: [profileImage] });
    const sentMessage = await message.channel.messages.fetch(message.id);
    const attachment = sentMessage.attachments.first();
    const attachmentURL = attachment.proxyURL;
    embedCard.setTitle(`${char.characterName}`)
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${card.characterID}
**Series: **${char.seriesID} | ${series.seriesName}
**Rarity: **Stellarite
**Weapon: **${weapon.name}`)
        .setColor(colour)
        .setThumbnail(`${weapon.weaponSprite}`)
        .setImage(attachmentURL);
    const ability0 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 0}});
    const ability1 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 1}});
    const ability2 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 2}});
    const ability3 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 3}});
    if(ability0) {
        embedCard.addFields({name: `Passive: ${ability0.abilityName} | ${a0cd.duration}`, value: `${ability0.abilityText}`});
    }
    if(ability1) {
        embedCard.addFields({name: `Attack: ${ability1.abilityName} | ${a1cd.duration}${a1str}`, value: `${ability1.abilityText}`});
    }
    if(ability2) {
        embedCard.addFields({name: `Primary: ${ability2.abilityName} | ${a2cd.duration}${a2str}`, value: `${ability2.abilityText}`});
    }
    if(ability3) {
        embedCard.addFields({name: `Secondary: ${ability3.abilityName} | ${a3cd.duration}${a3str}`, value: `${ability3.abilityText}`});
    }
    return embedCard;
}

async function switchRarityText(rarity) {
    switch (rarity) {
        case 4:
            return "Amethyst"
            //Purple
        case 5:
            return "Ruby";
            //red
        case 6:
            return "Diamond";

        case 7:
            return "Pink Diamond";

        default:
            return "error";
            //wtf?
    }
}

async function continueGamePhase2(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, unit) {
    try{
        //view reset
        let fieldLink;
        const attachment = await viewField(interaction, gameCheck, weaponArray);
        await interaction.editReply({ files: [attachment] });
        const message = await interaction.fetchReply();
        await message.attachments.forEach(attachment => {
            fieldLink = attachment.proxyURL;
        })
        const row = await createButton();
        const row2 = await createButtonRed();
        const row3 = await createButtonBlue();
        let player;
        let colour;
        if (unit < 5) {
            player = player1;
            colour = "#e83b3b"

        } else {
            player = player2;
            colour = "#4d9be6"
        }
        const unitID = await findUnitID(gameCheck, unit);
        const card = await database.Card.findOne({where: {playerID: player, inventoryID: unitID}});
        let embed
        if(card.rarity == 9) {
            embed = await viewAzurCard(card, interaction, colour, gameCheck, unit)
        } else {
            embed = await viewPinkCard(card, interaction, colour, gameCheck, unit)
        }
        msg = await interaction.editReply( {embeds: [embed], components: [row, row2, row3], fetchReply: true});
        return await buttonManager(interaction, msg, embed, row, row2, row3, false, gameCheck, colour, player, player1, player2, weaponArray, passiveArray, nameArray, unit, 0, fieldLink);
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in phase 2`);
    }
}


async function processStatusEffects(interaction, gameCheck, unit, weaponArray, nameArray) {
    //silenced, disarmed, dot, hot, stunned
    try {
        const maxhp = weaponArray[unit].health;
        const hp = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 1}});
        const a1cd = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 3}});
        const a2cd = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 4}});
        const a3cd = await database.Status.findOne({where: {gameID: gameCheck.id, unitNumber: unit, statusID: 5}}); 
        const statusList = await database.Status.findAll({where: {gameID: gameCheck.id, unitNumber: unit, statusID: {
            [Op.between]: [22, 26]
          }}});
        for (let i = 0; i < statusList.length; i++) {
            switch (statusList[i].statusID) {
                case 22: // silenced
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} is silenced.`);
                    if (a2cd.duration == 0) {
                        await a2cd.increment({duration:1});
                    }
                    if (a3cd.duration == 0) {
                        await a3cd.increment({duration:1});
                    }
                    break;

                case 23: // disarmed
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} is disarmed.`);
                    if (a1cd.duration == 0) {
                        await a1cd.increment({duration:1});
                    }
                    break;

                case 24: // dot
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} took ${statusList[i].statusValue} damage from DoT.`);
                    await hp.increment({statusValue: -statusList[i].statusValue});
                    break;

                case 25: // hot                    
                    if (hp.statusValue + statusList[i].statusValue > maxhp) {
                        await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} reached maximum health from HoT.`);
                        await hp.update({statusValue: maxhp});
                    } else {
                        await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} healed ${statusList[i].statusValue} health from HoT.`);
                        await hp.increment({statusValue: statusList[i].statusValue});
                    }
                    break;

                case 26: // stunned
                    await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName} is stunned.`);
                    if (a1cd.duration == 0) {
                        await a1cd.increment({duration:1});
                    }
                    if (a2cd.duration == 0) {
                        await a2cd.increment({duration:1});
                    }
                    if (a3cd.duration == 0) {
                        await a3cd.increment({duration:1});
                    }
                    break;
            }
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in process status effects`);
    }
}



//if phase is 1 unit turn has started, handle statuses that affect you at the start, and passives
async function continueGamePhase1(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, unit) {
    try{
        await updateGamelog(interaction, gameCheck, `${nameArray[unit].logName}'s turn.`);
        await processOwnPassive(interaction, gameCheck, weaponArray, passiveArray, nameArray, unit);
        await processStatusEffects(interaction, gameCheck, unit, weaponArray, nameArray);
        await database.Status.increment({duration: -1}, {where: {gameID: gameCheck.id, unitNumber: unit, statusID: {
            [Op.between]: [6, 27]}, duration: {[Op.gt]: 0}
        }});
        await database.Game.increment({phase: 1},{where: {id: gameCheck.id}});
        const gameCheck1 = await database.Game.findOne({where: {id: gameCheck.id}});
        const hp = await database.Status.findOne({where: {gameID: gameCheck1.id, unitNumber: unit, statusID: 1}})
        if (hp.statusValue > 0) {
            await gameCheck1.update({phase: unit*10+2});
            await continueGamePhase2(interaction, gameCheck1, player1, player2, weaponArray, passiveArray, nameArray, unit);
        } else {
            await hp.update({statusValue: 0})
            await updateGamelog(interaction, gameCheck1, `${nameArray[unit].logName} has been eliminated.`);
            const unit = await calculateInit(interaction, weaponArray, gameCheck1);
            if (unit == -1) {
                await updateGamelog(interaction, gameCheck, `All units finished their turn.`);
                await gameCheck1.update({phase: 4});
                await continueGamePhase4(interaction, gameCheck1, player1, player2, weaponArray, passiveArray, nameArray);
            } else {
                await gameCheck1.update({phase: unit*10+1});
                await continueGamePhase1(interaction, gameCheck1, player1, player2, weaponArray, passiveArray, nameArray, unit);
            }
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in phase 1`);
    }
}



//if phase is 0 round has started. Do round start passives, find initiative and start a unit's turn. Remove acted statuses
async function continueGamePhase0(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray) {
    try{
        const gameCheck1 = await database.Game.findOne({where: {id: gameCheck.id}});
        await updateGamelog(interaction, gameCheck1, `:large_blue_diamond:Round ${gameCheck1.round} started`);
        await processPassives(interaction, gameCheck1, weaponArray, passiveArray, nameArray);
        //remove all acted status
        await database.Status.destroy({where: {gameID: gameCheck1.id, statusID: 28}});
        const unit = await calculateInit(interaction, weaponArray, gameCheck1);
        //log round and round start.
        await gameCheck1.update({phase: unit*10+1});
        await continueGamePhase1(interaction, gameCheck1, player1, player2, weaponArray, passiveArray, nameArray, unit);
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in phase 0`);
    }
}

async function processGameEnd(interaction, gameCheck) {
    const team1 = await database.Status.findAll({order: [['unitNumber','ASC']],where: {gameID: gameCheck.id, unitNumber: {[Op.between]: [0, 4]}, statusID: 1, statusValue: {[Op.gt]: 0}}});
    const team2 = await database.Status.findAll({order: [['unitNumber','ASC']],where: {gameID: gameCheck.id, unitNumber: {[Op.between]: [5, 9]}, statusID: 1, statusValue: {[Op.gt]: 0}}});
    if (team1 > team2) {
        await endGame(interaction, gameCheck.player2ID);
    } else if (team1 < team2) {
        await endGame(interaction, gameCheck.player1ID);
    } else {
        await endGame(interaction, 0);
    }
}

async function continueGame3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray) {
    //we handle phase 0-4
    //if phase is 0 round has started. Do round start passives, find initiative and start a unit's turn. Remove acted statuses
    //if phase is 1 unit turn has started, handle statuses that affect you at the start, and passives
    //if phase is 2 unit can now choose their abilities using the buttons, process abilities
    //if phase is 3 reduce all status duration  by 1. and give them acted status
    //if phase is 4 round has ended, do end of round passives and go to round 0.
    try {
        while(gameCheck.round < 11) {
            const phase = gameCheck.phase%10;
            const unit = (gameCheck.phase - phase)/10;
            switch (phase) {
                case 0:
                    return continueGamePhase0(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray);
                    break;

                case 1:
                    return continueGamePhase1(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, unit);
                    break;

                case 2:
                    return continueGamePhase2(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, unit);
                    break;

                case 3:
                    return continueGamePhase3(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray, unit);
                    break;

                case 4:
                    return continueGamePhase4(interaction, gameCheck, player1, player2, weaponArray, passiveArray, nameArray);
                    break;

                default:
                    return;
            }
        }
        await processGameEnd(interaction, gameCheck);
    //endgame
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in continue game 3`);
    }
}

async function populateNames(interaction, gameCheck, player1, player2, weaponArray) {
    try {
        const [card1, card2, card3, card4, card5, card6, card7, card8, card9, card10] = await Promise.all([
            database.Card.findOne({where: {playerID:player1, inventoryID: gameCheck.unit1}}),
            database.Card.findOne({where: {playerID:player1, inventoryID: gameCheck.unit2}}),
            database.Card.findOne({where: {playerID:player1, inventoryID: gameCheck.unit3}}),
            database.Card.findOne({where: {playerID:player1, inventoryID: gameCheck.unit4}}),
            database.Card.findOne({where: {playerID:player1, inventoryID: gameCheck.unit5}}),
            database.Card.findOne({where: {playerID:player2, inventoryID: gameCheck.unit6}}),
            database.Card.findOne({where: {playerID:player2, inventoryID: gameCheck.unit7}}),
            database.Card.findOne({where: {playerID:player2, inventoryID: gameCheck.unit8}}),
            database.Card.findOne({where: {playerID:player2, inventoryID: gameCheck.unit9}}),
            database.Card.findOne({where: {playerID:player2, inventoryID: gameCheck.unit10}}),
          ]);

        const characterIDs = [card1.characterID, card2.characterID, card3.characterID, card4.characterID, card5.characterID, card6.characterID, card7.characterID, card8.characterID, card9.characterID, card10.characterID];
        const nameArray = await Promise.all(characterIDs.map((charID) => {
            return database.Character.findOne({where: {characterID: charID}});
        }));
        let color;
        for (let i = 0; i < 10; i++) {
            if (i < 5) {
                color = ":red_square:";
            } else {
                color = ":blue_square:";
            }
            const logName = `${color}${nameArray[i].characterName}(${weaponArray[i].class})`;
            await database.UnitName.create({
                gameID: gameCheck.id,
                unitNumber: i,
                logName: logName
            });
            await updateGamelog(interaction, gameCheck, `${logName} joins the battle!`);
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in find weapon array`);
    }
}

async function continueGame2(interaction, gameCheck, player1, player2) {
    try {
        let weaponArray = await findWeaponArray(interaction, gameCheck, player1, player2);
        let passiveArray = await findPassiveArray(interaction, weaponArray);
        if (gameCheck.round == -1) {
            if(gameCheck.unit5 && gameCheck.unit10) {
                gameCheck.increment({round: 2});
                await populateStatus(interaction, gameCheck, weaponArray);
                await populateNames(interaction, gameCheck, player1, player2, weaponArray);
                let nameArray = await database.UnitName.findAll({order: [['unitNumber','ASC']],where: {gameID: gameCheck.id}});
                await processPassives(interaction, gameCheck, weaponArray, passiveArray, nameArray);
                
                //proccess gamestart effects
                gameCheck.increment({phase: 1});
                //phase is now at 0. Round starts
            } else {
                return interaction.reply("Both players must select a deck before starting the game.");
            }
            //check if decks are chosen, if so populate stats.
            //round is 0 here and phase should progress to 0;
        }
        let nameArray = await database.UnitName.findAll({order: [['unitNumber','ASC']],where: {gameID: gameCheck.id}});
        const gameCheck1 = await database.Game.findOne({where: {id:gameCheck.id}});
        await interaction.reply("loading");
        // const attachment = await viewField(interaction, gameCheck1, weaponArray);
        // await interaction.editReply({ files: [attachment] });
        //after viewing the board
        await continueGame3(interaction, gameCheck1, player1, player2, weaponArray, passiveArray, nameArray);
        //calculate highest initiative
        //phase 0 round start
        //phase 1 first unit turn start (process silence, disarm, stun, dot, healot)
        //phase 2 unit action choice turn and process abilities
        //phase 3 unit status duration goes down, and goes to phase 1 again until
        //all units that are alive had their turn
        //if all unit had thier turn round counter goes up by 1.
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in continue game 2`);
    }
}

//check where in the game we are.
async function continueGame(interaction) {
    try {
        const user = await interaction.user.id
        const target = await interaction.options.getUser('targetuser');
        const gameCheck1 = await database.Game.findOne({where: {player1ID: user, player2ID: target.id}})
        const gameCheck2 = await database.Game.findOne({where: {player2ID: user, player1ID: target.id}})
        if (gameCheck1) {
            await continueGame2(interaction, gameCheck1, user, target.id);
        } else if (gameCheck2) {
            await continueGame2(interaction, gameCheck2, target.id, user);
        } else {
            return interaction.reply("There isn't a game to continue. Start a new game.");
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in continue game`);
    }
}


async function acceptGame() {
    try {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('accept')
                    .setLabel('Accept')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('decline')
                    .setLabel('Decline')
                    .setStyle('DANGER')
            )
        return row;
    } catch(error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in accept game`);
    }
}

async function acceptGameManager(interaction, msg) {
    try {
        const target = await interaction.options.getUser('targetuser');
        const filter = i => i.user.id === target.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'accept':
                    await createGame(interaction);
                    break;
                
                case 'decline':
                    interaction.editReply("Game Declined.")
                    break;
            };
            i.deferUpdate();
        }
        );

    } catch(error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in accept game manager`);
    }
}

async function createGame(interaction) {
    try {
        const user = await interaction.user.id
        const target = await interaction.options.getUser('targetuser');
        const game = await database.Game.create({
            gameType: 1,
            round: -1,
            phase: -1,
            player1ID: user,
            player2ID: target.id,
            ladyluck: -1
        });
        await database.Gamelog.create({
            gameID: game.id,
            player1: user,
            player2: target.id,
            text: "Game Created\n",
        });
        return await interaction.editReply(`A new game with ${interaction.user.toString()} and ${target.toString()}. Both players need to use /select deck command to pick their deck.`);
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in create game`);
    }
}

async function startGame(interaction) {
    try {
        if(await findGame(interaction)) {
            return interaction.reply("There's a game in progress with the player, continue or end before starting a new game with the player");
        }
        //this is where we would check if we do blind or draft
        const row = await acceptGame();
        const target = await interaction.options.getUser('targetuser');
        msg = await interaction.reply({content: `${target.toString()}, you've been invited to a pvp match by ${interaction.user.toString()}.`, components: [row], fetchReply: true});
        await acceptGameManager(interaction, msg);
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in start game`);
    }
}

async function updateGamelog(interaction, gameCheck, text) {
    try {
        const gamelog = await database.Gamelog.findOne({where: {gameID: gameCheck.id}});
        let log = gamelog.text;
        let update = text.concat("\n", log);
        await gamelog.update({result: gamelog.player1, text: update});
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in update game log`);
    }
}


async function endGame(interaction, loser) {
    try {
        const gameCheck = await findGame(interaction);
        const user =  interaction.user.id;
        let winner;
        if (loser == user) {
            winner = interaction.options.getUser('targetuser');
        } else {
            winner = interaction.user;
        }

        if(gameCheck) {
            const gamelog = await database.Gamelog.findOne({where: {gameID: gameCheck.id}});
            let text = gamelog.text;
            if(loser == 0) {
                let endgame = text.concat("\n", "Game ended, draw!");
                await gamelog.update({result: 0, text: endgame});
                await interaction.channel.send("Game ended, Draw");   
            } else {
                let endgame = text.concat("\n", `Game ended, ${winner.toString()} won!`);
                await gamelog.update({result: winner.id, text: endgame});
                await interaction.channel.send(`Game ended, ${winner.toString()} won!`);   
            }
            await database.Status.destroy({where: {gameID: gameCheck.id}});
            await database.Game.destroy({where: {id: gameCheck.id}});
            return;
        } else {
            return await interaction.channel.send("No game found.");   
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in end game`);
    }
    
    //also destroy all the status with that gameid...
}

/**
 * Looks for exisint game.
 * @param {} interaction 
 */
async function findGame(interaction) {
    try {
        const user = await interaction.user.id
        const target = await interaction.options.getUser('targetuser');
        const gameCheck1 = await database.Game.findOne({where: {player1ID: user, player2ID: target.id}})
        const gameCheck2 = await database.Game.findOne({where: {player2ID: user, player1ID: target.id}})
        if (gameCheck1) {
            return gameCheck1;
        } else if (gameCheck2) {
            return gameCheck2;
        } else {
            return false;
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in find game`);
    }
}

async function subCommandSwitch(interaction){
    try {
        const subCommand = await interaction.options.getSubcommand();
        const user = await interaction.user.id
        const target = await interaction.options.getUser('targetuser');
        switch (subCommand) {
            case "start":
                startGame(interaction);
                break;

            case "cont":
                continueGame(interaction);
                break;

            case "end":
                const loser = interaction.user.id;
                endGame(interaction, loser);
                break;
        }
    } catch (error) {
        let channel = interaction.guild.channels.cache.get('1089177404209123370');
        channel.send(`${error} in subcommand switch`);
    }
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('pvpgame')
		.setDescription('main command to start, continue or end a game with another player.')
        .addSubcommand(subcommand => 
            subcommand
                .setName("start")
                .setDescription("Start a new Game with a player")
                .addUserOption(option => 
                    option
                        .setName("targetuser")
                        .setDescription("The player you want to play against.")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("gamemode")
                        .setDescription("Either ~~draft~~ or choose deck.")
                        .setRequired(true)
                        .addChoice('deck', 1)
                        ))
        .addSubcommand(subcommand => 
            subcommand
                .setName("cont")
                .setDescription("Continue existing game with a player")
                .addUserOption(option => 
                    option
                        .setName("targetuser")
                        .setDescription("The player you want to play against.")
                        .setRequired(true)
                        ))
                        
        .addSubcommand(subcommand =>
            subcommand
                .setName("end")
                .setDescription("End an existing game with a player. Game ends in a draw.")
                .addUserOption(option => 
                    option
                        .setName("targetuser")
                        .setDescription("The player you want to play against.")
                        .setRequired(true)
                        )),
	async execute(interaction) {
        try {
            const user = await interaction.user.id
            const target = await interaction.options.getUser('targetuser');
            await subCommandSwitch(interaction);
        } catch (error) {
            let channel = interaction.guild.channels.cache.get('1089177404209123370');
            channel.send(`${error} at the start`);
        }      
    }
}