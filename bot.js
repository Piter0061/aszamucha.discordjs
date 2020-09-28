/////////////////////////////////////////////////////////////////////////////////////////////////////
//////aszamucha bot for discord
//////developed by peter


var cheerio = require("cheerio"); /* Used to extract html content, based on jQuery || install with npm install cheerio */
var request = require("request"); /* Used to make requests to URLs and fetch response  || install with npm install request */
var discord = require("discord.js");
//var token = require("./token.js");// having token in separate file
var client = new discord.Client();

var myArgs = process.argv.slice(2);
//console.log('myArgs: ', myArgs);

//console.log(token.tokenn());
// Login into discord using bot token (do not share token with anyone!).
if (typeof myArgs[0] !== 'undefined'){
	client.login(myArgs[0]);
}else{
	console.log('usage: node bot.js [token]');
	process.exit()
}
client.on("ready", function() {
	console.log("logged in");
	client.user.setPresence({
        status: "online",  //You can show online, idle....
		game: { 
            name: '!help',
            type: 'WATCHING'
        }
    }).then(console.log)
	.catch(console.error);
});


client.on("message", function(message) {

	var parts = message.content.split(" "); // Splits message into an array for every space, our layout: "<command> [search query]" will become ["<command>", "search query"]

	/* Simple command manager */
	if (parts[0] === "!img") { // Check if first part of message is !img command

		image(message, parts); // Pass requester message to image() function
	}
	if (parts[0] === "!hentai") { // Check if first part of message is !hentai command

		goReddit(message, "http://reddit.com/r/hentai.json"); // Pass requester message to hentai() function
	}
	if (parts[0] === "!wiki") { // Check if first part of message is !wiki command
		
		goWiki(message, parts); // Pass requester message to goWiki() function
	}
	if (parts[0] === "!porn") { 
		
		goReddit(message, "http://reddit.com/r/porn.json"); //DONE
	}
	if (parts[0] === "!help") { 
		
		message.channel.send(help);
	}
	if (parts[0] === "!huj") { 
		
		goReddit(message, "http://reddit.com/r/gayporn.json"); // DONE
	}

});
////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////functions////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
function image(message, parts) {

	/* extract search query from message */

	var search = parts.slice(1).join(" "); // Slices of the command part of the array ["!image", "cute", "dog"] ---> ["cute", "dog"] ---> "cute dog"

	var options = {
	    url: "http://results.dogpile.com/serp?qc=images&q=" + search,
	    method: "GET",
	    headers: {
	        "Accept": "text/html",
	        "User-Agent": "Chrome"
	    }
	};
	request(options, function(error, response, responseBody) {
		if (error) {
			// handle error
			return;
		}
		console.log("sent request for image!")
		/* Extract image URLs from responseBody using cheerio */

		$ = cheerio.load(responseBody); // load responseBody into cheerio (jQuery)

		// In this search engine they use ".image a.link" as their css selector for image links
		//var links = $(".image a.link");
		var links = $(".image a.link");
		// We want to fetch the URLs not the DOM nodes, we do this with jQuery's .attr() function
		// this line might be hard to understand but it goes thru all the links (DOM) and stores each url in an array called urls
		var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
		//console.log(urls);
		if (!urls.length) {
			// Handle no results
			console.log("no result!")
			//message.channel.send('no i huj, nie ci w dupe, tylko ni ma tego twojego *"'+search+'"* na necie pizdo');
			return;
		}

		// Send result
		console.log("sending the image!")
		var r = Math.round(Math.random() * 20);

		if (typeof urls[r] !== 'undefined'){	//handle some errors
			message.channel.send( urls[r] );
		}else{
			message.channel.send("err");
		}
		
	});

}
function goReddit(message, redURL) {
	let options = {
	    url: redURL, /////////make reddit api request
	    method: "GET",
	    headers: {
	        "Accept": "text/html",
	        "User-Agent": "Chrome"
	    }
	};
	request.get(options, function (error, response, body) {
		console.error('error:', error); // Print the error if one occurred
		//console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
		//console.log('body:', body); // Print the HTML for the Google homepage.

		if (!error && response.statusCode == 200) {
			var json = JSON.parse(body);
			var r = Math.round(Math.random() * 20);
			
			var hentai_url = json.data.children[r].data.url_overridden_by_dest;

			message.channel.send(hentai_url);

		}
});
}
function goWiki(message, parts){
	let searched = parts.slice(1).join(" ");
	let options = {
	    url: "https://pl.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles="+searched, ///make pl.wikipedia api request
	    method: "GET",
	    headers: {
	        "Accept": "text/html",
	        "User-Agent": "Chrome"
	    }
	};
	request.get(options, function (error, response, body) {
		console.error('error:', error); // Print the error if one occurred
		//console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
		//console.log('body:', body);

		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			let content
			let page = data.query.pages;
			let pageId = Object.keys(data.query.pages)[0];
			console.log(pageId);
			content = page[pageId].extract;/// "content" is now the searched wikipedia article
			//console.log(content);
////////////////////////////////TRIM TOO LONG BODY///////////////////////////////

			var maxLength = 2000 // maximum number of characters that you want to send from wikipedia
			var trimmedString = "no i huj, zjebao sie. jezeli to widzisz zkontaktuj ssie z pioterem i daj mu wpierdol";////handle "undefined" error and this message will be sent if something bad happend

			if (typeof content !== 'undefined'){//Trim and re-trim only when necessary (prevent re-trim when string is shorted than maxLength, it causes last word cut) 

				if(content.length > trimmedString.length){
					//trim the string to the maximum length
					trimmedString = content.substr(0, maxLength);

					//re-trim if we are in the middle of a word and 
					trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))
				}else{trimmedString = content;}

			}else{trimmedString = "ni ma na wikipedji, bida w kraju"} ///this message will be sent if api wont return any results
//////////////////////////////SEND//////////////////////////////
			message.channel.send(trimmedString);
		}
});


if (process.platform === "win32") {
	var rl = require("readline").createInterface({
	  input: process.stdin,
	  output: process.stdout
	});
  
	rl.on("SIGINT", function () {
	  process.emit("SIGINT");
	});
  }
  
  process.on("SIGINT", function () {
	//graceful shutdown

	client.user.setPresence({
		        status: "dnd",  //You can show online, idle...
		    }).then(console.log)
			.catch(console.error);
			
	console.log('exiting');
	process.exit();
  });

}

const help = new discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('pomoc drogowa')
	.setURL('https://discord.js.org/')
	.setAuthor('Asza mucha', 'https://imgur.com/amCq93F.png', 'https://discord.js.org')
	.setDescription('no niestety')
	.setThumbnail('https://i.imgur.com/amCq93F.png')
	.addFields(
		//{ name: 'nie etyczne:', value: '(nie ładnie)'},
		{ name: 'hentai', value: '`!hentai`', inline: true },
		{ name: 'zwykłe porn', value: '`!porn`', inline: true },
		{ name: 'nie pytaj', value: '`!huj`', inline: true },
		{ name: '\u200B', value: '\u200B' },
		//{ name: 'reszta', value: '(no tak, reszta)' },
		{ name: 'wyszukuje zdj w google images', value: '`!img <co wszukac>`'},
	)
	.addField('wyszukuje dany temat w wikipedii', '`!wiki <co znalesc>`')
	.setTimestamp()
	.setFooter('n o', 'https://i.imgur.com/amCq93F.png');