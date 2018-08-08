const config = require("./config.json");
const Discord = require("discord.js");
const request = require("request");
const fs = require('fs');
const client = new Discord.Client({disableEveryone: true});
const apiKey = config.apiKey; // riotgames developer API key.

var latestGameProcessedId = -1;
fs.readFile('gameId.txt', 'utf8', (error, data) => {
    if (error) throw error;
    latestGameProcessedId = data;
    console.log(latestGameProcessedId);
});

// Simple function to post an embed in a text chat.
function postInChat(k, d, a, cs, dmg) {
    var channel = client.channels.find(channel => channel.name == 'bot'); // find text channel.
    let embed = new Discord.RichEmbed()
    .setTitle("Ronny won a game!")
    .setDescription("Who would've thought?")
    .addField('K/D/A:',''+k+'/'+d+'/'+a)
    .addField('Creep Score:', cs)
    .addField('Damage dealt:', dmg)
    .setColor('#af28c4')
    .setThumbnail('https://s.lolstatic.com/errors/0.0.9/images/lol_logo.png');
    channel.send(embed); // send embed to text channel
}

// function that checks whether the game with gameId was won by playerId
function winCheck(gameId, playerId) {
    console.log("checking if game with ID " + gameId + " was won");
    var options = {
        url: "https://euw1.api.riotgames.com/lol/match/v3/matches/" + gameId,
        headers: {
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Riot-Token": apiKey,
            "Accept-Language": "en-US,en;q=0.9,nb;q=0.8",
            "User-Agent": "request"
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200){
            var data = JSON.parse(body);
            var playerNumber = -1
            data.participantIdentities.forEach(function(pl) {
                if (pl.player.accountId == playerId){
                    playerNumber = pl.participantId;
                    if (data.participants[playerNumber-1].stats.win) {
                        var stats = data.participants[playerNumber-1].stats;
                        var k = stats.kills;
                        var d = stats.deaths;
                        var a = stats.assists;
                        var cs = stats.totalMinionsKilled;
                        var dmg = stats.totalDamageDealtToChampions;
                        postInChat(k, d, a, cs, dmg);
                    }
                }
            });
            if (playerNumber == -1) {
                console.log("player " + playerId + " not found");
            }
        } else {
            console.log(error);
            console.log(response.statusCode);
        }
    })
};

client.on("ready", async () => {
    console.log(`${client.user.username} is online!`);
    client.user.setActivity("with your 💜");
    var i = 1;
    const timer = setInterval(function () {
        console.log("Times checked: " + i++);

        var options = {
            url: "https://euw1.api.riotgames.com/lol/match/v3/matchlists/by-account/202123840?endIndex=1",
            headers: {
                "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Riot-Token": apiKey,
                "Accept-Language": "en-US,en;q=0.9,nb;q=0.8",
                "User-Agent": "request"
            }
        };
        request(
            options,
            function (error, response, body){
                if (!error && response.statusCode == 200){
                    // console.log("     limits: " + response.headers["x-app-rate-limit"]);
                    // console.log("Current use: " + response.headers["x-app-rate-limit-count"]);
                    var data = JSON.parse(body);
                    if (data.matches[0].gameId != latestGameProcessedId){
                        latestGameProcessedId = data.matches[0].gameId;
                        fs.writeFile('gameId.txt', data.matches[0].gameId, (error) => {
                            if (error) throw error;
                        });
                        winCheck(data.matches[0].gameId, config.playerId);
                    }
                }
            }
        );
    }, 60000);

});

client.login(config.token);
