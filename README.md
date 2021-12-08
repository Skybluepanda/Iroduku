# mmoidlebot  
MMO Idle Bot  

install packages  
npm init  
// Main discord package  
npm i discord.js  
// Discord API packages  
npm i @discordjs/builders @discordjs/rest discord-api-types  
// Database  
npm i sequelize sqlite3  
// Autorun package  
npm i -g nodemon    

to run the bot  
    node .  
to run the bot and make it restart each time you save  
    nodemon -e js  

to make a command unusable by normal plebs add
    if (!interaction.member.roles.cache.has('908920221568483368')) return;