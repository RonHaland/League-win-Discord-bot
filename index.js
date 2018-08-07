const config = require("./config.json");
const Discord = require("discord.js");
const request = require("request");

const client = new Discord.Client({disableEveryone: true});
var latestGameProcessedId = -1;
const apiKey = "xxx"


function postInChat() {
  var channel = client.channels.find(channel => channel.name == 'general');
  let embed = new Discord.RichEmbed()
  .setTitle("Ronny won a game!")
  .setDescription("Who would've thought?")
  .setColor('#c14580')
  .setThumbnail('https://s.lolstatic.com/errors/0.0.9/images/lol_logo.png');
  channel.send(embed);
}


function winCheck(gameId) {
  console.log("checking if game was won " + gameId);
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
        if (pl.player.accountId == 202123840){
          playerNumber = pl.participantId;
          if (data.participants[playerNumber-1].stats.win) {
            postInChat();
          }
        }
      });
      if (playerNumber == -1) {
        console.log("player not found");
      }
    } else {
      console.log("error1");
    }
  })
};


client.on("ready", async () => {
  console.log(`${client.user.username} is online!`);
  client.user.setActivity("with your ♥");
  var i = 0;
  const timer = setInterval(function () {
    console.log("Test" + i++)

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
          var data = JSON.parse(body);
          if (data.matches[0].gameId != latestGameProcessedId){
            latestGameProcessedId = data.matches[0].gameId;
            winCheck(data.matches[0].gameId);
          } else {
            console.log("No new games");
          }
        }
      }
    );

  }, 60000);

});
client.login(config.token);
