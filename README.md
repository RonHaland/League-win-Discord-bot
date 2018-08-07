# League-win-Discord-bot
A simple discord bot that sends a message in a text channel everytime I win a game in League of Legends.

The bot works by requesting my latest game from the league of legends API every minute and checking whether it is new.
If a new game is found, the bot will request match-data from the API and find out whether my account was on the winning team.


## Plans
There is no point in checking for a win every minute if I can find out whether I am currently in a game or not.
A game will likely take at least 15 minutes but may take as little as 8 in the ARAM game mode.

I should also make sure that when I request the latest game, it has actually been played recently.

I would also like to include information about the match in the message that the bot sends out. 
This would be things like:
* Kills/Deaths/Assists
* Game length
* Character
