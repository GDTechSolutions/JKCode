const https = require("https");
const { performance } = require('perf_hooks');
const {
	Worker, isMainThread, parentPort, workerData
} = require('worker_threads');

function sendRequest(timeout=3000) {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: 'onlinebooking.sand.telangana.gov.in',
			port: 443,
			path: '/Masters/Home.aspx',
			method: 'GET',
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
				"cookie": ""
			}
		}
		
		let resp = "";
		let firstByteAt;
		  
		const req = https.request(options, res => {
			if(res.statusCode > 300 && res.statusCode < 400) {
				reject("redirected");
				return;
			}

			let cookie = res.headers["set-cookie"];

			res.once("readable", ()=>{
				firstByteAt = performance.now();
			});
		  
			res.on('data', d => {
				resp += d;
			});
		
			res.on("end", ()=>{
				let endAt = performance.now();
				resolve({
					html: resp,
					cookie: cookie[0],
					firstByteAt,
					endAt
				});
			});
		});

		setTimeout(()=>{
			req.destroy();
			reject("timeout");
		}, timeout);
		  
		req.on('error', error => {
			reject(error);
		});
		  
		req.end();
	});
}

function spawnInstances() {
	return new Promise((resolve, reject) => {
		let instances = 0;
		let successFlag = false;

		function createInstance() {
			instances++;

			sendRequest()
			.then(success)
			.catch(failed);
		}

		for(let i=0; i<numInstances; i++) {
			createInstance(2000);
		}

		function failed() {
			instances--;

			if(successFlag || instances == 10) {
				return;
			}

			createInstance();
		}

		function success(resp) {
			successFlag = true;
			resolve(resp);
		}
	});
}

module.exports = spawnInstances;