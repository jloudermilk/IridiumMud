exports.Channels = 
{

'say': {
		name: 'say',
		description: 'Talk to those around you',
		use: function (player,string)
		{
			
			players.broadcastAt("<bold><cyan>" + player.getName() + "</cyan></bold> says '" + args + "'", player);
			players.eachExcept(player, function (p) {
				if (p.getLocation() === player.getLocation()) {
					p.prompt();
				}
			});
		}
	},
	
}