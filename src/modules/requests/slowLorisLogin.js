const tls = require("tls");
const {performance} = require("perf_hooks");

const host = "onlinebooking.sand.telangana.gov.in";

module.exports = function(inp) {
	return new Promise((resolve, reject) => {
		let t1 = performance.now();

		let client = tls.connect(443, host, {
			rejectUnauthorized: false
		}, async ()=>{

			console.log(client.authorized);
			
			let wait = ms => new Promise(resolve => setTimeout(resolve, ms));
			let timeTakenForTcpConn = performance.now() - t1;
			let timeLeft = inp.timeLeft - timeTakenForTcpConn;

			console.log(timeTakenForTcpConn, timeLeft);

			let body = JSON.stringify({
				"CPTV": inp.captchaSolution,
				"PSWI": inp.pswi,
				"PSWV": inp.pswv,
				"SCPTV": inp.scptv,
				"TOTP": inp.resend ? "N" : "Y",
				"UNI": inp.uni,
				"UNV": inp.unv
			});

			let dataToWrite = [
				`POST /Masters/HOME.aspx/CALLSMSLOGINREG HTTP/1.1`,
				`Host: onlinebooking.sand.telangana.gov.in`,
				`User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0`,
				`Accept: application/json, text/javascript, */*; q=0.01`,
				`Accept-Language: en-US,en;q=0.5`,
				// `Accept-Encoding: gzip, deflate, br`,
				`Referer: https://onlinebooking.sand.telangana.gov.in/`,
				`Content-Type: application/json; charset=utf-8`,
				`X-Requested-With: XMLHttpRequest`,
				`Origin: https://onlinebooking.sand.telangana.gov.in`,
				`Connection: close`,
				`Sec-Fetch-Dest: empty`,
				`Sec-Fetch-Mode: cors`,
				`Sec-Fetch-Site: same-origin`,
				`Content-Length: ${body.length}`
			];

			let interval = parseInt(timeLeft / dataToWrite.length);

			for(let i=0; i<dataToWrite.length; i++) {
				client.write(dataToWrite[i] + "\n");
				console.log(`written ${i}`);
				await wait(interval);
			}

			client.write(`STicket: ${inp.sTicket}\n`);
			client.write(`Cookie: ${inp.cookie}`);

			client.write(`\r\n\r\n${body}`);
		});
		
		client.on("error", err => {
			console.log(err);
			reject(err);
		});

		client.on("data", (data)=>{
			let resp = data.toString("utf8");

			let arr = resp.split("\n");
			if(arr[0].includes("200")) {
				resolve(JSON.parse(arr[arr.length - 1]));
			} else {
				reject(resp);
			}
			// resolve(data);
		});
	});
}