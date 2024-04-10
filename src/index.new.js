const fs = require("fs");
const terminalImage = require('terminal-image');
const readline = require("readline");
const { performance } = require('perf_hooks');
const puppeteer = require("puppeteer");
var term = require( 'terminal-kit' ).terminal ;
const yaml = require("js-yaml");
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const https = require("https");
const fetch = require("node-fetch");
require('promise.any').shim();
const argv = yargs(hideBin(process.argv)).argv;
const { session, app, BrowserWindow } = require('electron');

// const fetchCaptcha = require("./modules/fetchCaptchaImage");
const getEncryptedText = require("./modules/getEncryptedText");

const homepageRequest = require("./modules/requests/homepage"); // 200ms timeout
const bookingHomepageRequest = require("./modules/requests/bookingHomepage"); // 300ms timeout
const newBookingRequest = require("./modules/requests/newBooking"); // 300ms timeout
const newBookingPageRequest = require("./modules/requests/newBookingPage");
const getStockpoints = require("./modules/requests/getStockpoints");
const selectStockpoint = require("./modules/requests/selectStockpoint");
const submitVehicleNumber = require("./modules/requests/submitVehicleNumber");
const register = require("./modules/requests/register");
const submitBookingOTP = require("./modules/requests/submitBookingOTP");
const getCaptchaSolutionFromAPI = require("./modules/getCaptcha/index");
const getOtpFromAPI = require("./modules/getOtp");
const { time } = require("console");

global.httpsAgent = new https.Agent({
	keepAlive: true,
})

function establishTcpConns(numConns) {
	let arr = [];

	for(let i=0; i<numConns; i++) {
		arr.push(
			fetch("https://onlinebooking.sand.telangana.gov.in/MASTERS/UPTIME.ASPX", {
				agent: url => global.httpsAgent,
				headers: {
					"Host": "onlinebooking.sand.telangana.gov.in",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
					"Accept": "text/html,application/xhtml+xml,application/json,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"Accept-Language": "en-US,en;q=0.5",
					"Accept-Encoding": "gzip, deflate, br",
					"Referer": "https://onlinebooking.sand.telangana.gov.in/",
					"Origin": "https://onlinebooking.sand.telangana.gov.in",
					"Connection": "keep-alive"
				}
			})
		);
	}

	return Promise.allSettled(arr);
}

const _logInfo = (x,e) => {
	term.bgBlue("INFO").defaultColor("     " + x + "\n");
	if(e) console.log(e);
}
const _logWarn = (x,e) => {
	term.bgYellow("WARN").defaultColor("     " + x + "\n");
	if(e) console.log(e);
}
const _logError = (x,e) =>  {
	term.bgRed("ERROR").defaultColor("    " + x + "\n");
	if(e) console.log(e);
}
const _logSuccess = (x,e) => {
	term.bgGreen("SUCCESS").defaultColor("  " + x + "\n");
	if(e) console.log(e);
}

if (!String.prototype.replaceAll) {
	String.prototype.replaceAll = function(str, newStr){

		// If a regex pattern
		if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
			return this.replace(str, newStr);
		}

		// If a string
		return this.replace(new RegExp(str, 'g'), newStr);

	};
}


function getCaptchaSolution(imgData) {
	return new Promise(async (resolve, reject) => {
		try {
			let imgBuf = new Buffer.from(imgData, "base64");
			console.log(await terminalImage.buffer(imgBuf));
		} catch(e) {
			_logError("Failed to print captcha");
		}

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false
		});
		
		term.bgMagenta("INPUT").defaultColor("    Enter captcha : ");
		rl.on('line', function(solution){
			resolve(solution.toUpperCase());
			rl.close();
		});
	})
}

function getBookingCaptchaSolution(imgData) {
	return new Promise(async (resolve, reject) => {
		let buf = new Buffer.from(imgData.split(",")[1], "base64");
		console.log(await terminalImage.buffer(buf));

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false
		});
		
		term.bgMagenta("INPUT").defaultColor("    Enter captcha : ");
		rl.on('line', function(solution){
			resolve(solution.toUpperCase());
			rl.close();
		});
	});
}

// process.stdin.on("error", ()=>{});

function getOtp() {
	return new Promise(async (resolve) => {
		let solutionObtained = false;
		let wait = ms => new Promise(resolve => setTimeout(resolve, ms));
		
		term.bgMagenta("INPUT").defaultColor("    Enter OTP : ");
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false
		});
		rl.on('line', function(solution){
			resolve(solution.toUpperCase().trim());
			rl.close();
			solutionObtained = true;
		});

		if(config.otpKey) {

			function callback(chunk, key) {
				if(key) {
					if(key.name.toLowerCase() === "d" && key.ctrl) {
						process.stdin.off("keypress", callback);
					}
				}
			}

			process.stdin.setRawMode(true);
			process.stdin.on("keypress", callback);

			while(! solutionObtained) {
				try {
					let otp = await getOtpFromAPI(config.username, config.otpKey);
					console.log(otp);
	
					// process.stdin.write(otp);
					// process.stdin.end();
	
					break;
				} catch(e) {
					// console.log(e);
					await wait(200);
				}
			}
		}

	})
}

function getBookingPageOTP() {
	return new Promise(async (resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false
		});
		
		term.bgMagenta("INPUT").defaultColor("    Enter OTP : ");
		rl.on('line', function(solution){
			resolve(solution.toUpperCase().trim());
			rl.close();
		});

	})
}

function selectStockyard(items) {
	return new Promise((resolve, reject) => {
		term.bgMagenta("INPUT").defaultColor("    Select a stockyard : \n");
		term.gridMenu(items , function( error , response ) {
			if(error) {
				reject(error);
			} else {
				resolve(response.selectedIndex);
			}
		});
	});
}

global.config = {
	username: undefined,
	password: undefined,
	stockyard: undefined,
	vehicleNumber: undefined,
	slot: undefined,
	captchaKey: undefined,
	otpKey: undefined,

	wait_time_login_ms: undefined,
	wait_time_otp_ms: undefined,
	wait_time_booking_ms: undefined,
	wait_time_booking_otp_ms: undefined
}

let browser, page;

let wait = ms => new Promise(resolve => setTimeout(resolve, ms));

process.on("exit", ()=>{
	try {
		browser.process().kill('SIGINT');
	} catch(e) {}
	return true;
});

term.grabInput(false);

term.on( 'key' , function( name , matches , data ) {
	if ( name === 'CTRL_C' ) { 
		term.processExit(0);
	}
});

function loadConfig() {
	return new Promise((resolve, reject) => {
		fs.promises.readFile("./config.yaml", 'utf8')
		.then(data => {
			let input = yaml.load(data);

			config.username = input.username;
			config.password = input.password;
			config.stockyard = input.stockyard;
			config.vehicleNumber = input.vehicle_number;
			config.slot = input.slot.toString();
			config.captchaKey = input.captcha_key;
			config.otpKey = input.otp_key;

			if(typeof config.username != "string") {
				throw new Error("Username must be a string");
			} else if(typeof config.password != "string") {
				throw new Error("Password must be a string");
			} else if(!Array.isArray(config.stockyard)) {
				throw new Error("Stockyard must be an list");
			} else if(typeof config.vehicleNumber != 'string') {
				throw new Error("Vehicle number must be a string");
			} 
			
			if(typeof config.captchaKey != "string") {
				_logWarn("Captcha key is not defined, will default to obtaining captcha from input");
			}

			if(typeof config.otpKey != "string") {
				_logWarn("OTP key is not defined, will default to obtaining OTP from input");
			}

			if(! ["10","12","1","2","3","5"].includes(config.slot)) {
				throw new Error("Invalid slot");
			}

			for(let key in input.timers) {
				if(typeof input.timers[key] != "number") {
					throw new Error(`timers.${key} must be a number`);
				}
			}

			config.wait_time_login_ms = input.timers.login_captcha * 1000;
			config.wait_time_otp_ms = input.timers.login_otp * 1000;
			config.wait_time_booking_ms = input.timers.booking_page * 1000;
			config.wait_time_booking_otp_ms = input.timers.booking_page_otp * 1000;

			resolve();
		})
		.catch(reject);
	});
}

(async ()=>{
	loadConfig()
	.then(()=>{
		let msg = `Username : ${config.username}\n`;
		msg += `Password : ${config.password}\n`;
		msg += `Stockyard : ${config.stockyard}\n`;
		msg += `Vehicle Number : ${config.vehicleNumber}\n`;
		msg += `Slot : ${config.slot}\n`;

		msg += `Login captcha wait time : ${config.wait_time_login_ms} ms\n`;
		msg += `Login otp wait time : ${config.wait_time_otp_ms} ms\n`;
		msg += `Booking page wait time : ${config.wait_time_booking_ms} ms\n`;
		msg += `Booking page otp wait time : ${config.wait_time_booking_otp_ms} ms\n`;

		_logInfo("Configuration", msg);

		if(argv.check) {
			_logSuccess("Configuration is valid");
			term.processExit(0);
		} else {
			return main();
		}
	})
	.catch((e)=>{
		_logError("Failed to load config file", e.toString());
		process.exit(1);
	})
})();

async function main(){
	try {
		let resp, html;

		let t1, t2, t3, t4, t5, t6;
		let t7, t8;
		let timerStartTimestamp;
		let waitTime;
		let paymentGatewayURL;
		let x;

		// for login
		let uni, pswi, scptr, scptv, sTicket, iv, unv, pswv;
		let imgData;
		let cookie;

		// for booking
		let eventTarget, eventArgument;
		let viewState, viewStateGenerator, viewStateEncrpyted, eventValidation;
		let queryString;

		establishTcpConns(10).catch(err => {});
		let handle = setInterval(()=>{
			establishTcpConns(2).catch(err => {});
		}, 2000)

		global_loop:
		while(true) {
			// homepage request
			_logInfo("Fetching homepage...");

			homepage_loop:
			while(true) {
				try {
					let resp = await fetch("http://localhost:9000")
					if(resp.status == 204) {
						await wait(50);
					} else if(resp.status == 200) {
						let json = await resp.json();
						if(json.ok) {
							_logInfo(`Logged in @ ${new Date(Date.now()).toLocaleString()}`);
							if(json.actCookie == "") {
								cookie = `ASP.NET_SessionId=${json.sessionID}`
							} else {
								cookie = `ASP.NET_SessionId=${json.sessionID}; ASPSESSIONIDACTTQAQC=${json.actCookie}`
							}
							console.log(cookie)
							clearInterval(handle)
							break;
						} else {
							_logError("Failed to obtain session!");
							process.exit(1);
						}
					}
				} catch(e) {
					_logError("Error @ login loop", e.toString())
				}
			}

			_logSuccess("Logged in");

			while(true) {
				_logInfo("Trying to fetch booking homepage...");
				let booking_page_req_t1 = performance.now();
				try {
					let resp = await bookingHomepageRequest({
						cookie
					});

					({eventTarget, eventArgument} = resp);
					({viewState, viewStateGenerator, viewStateEncrpyted, eventValidation} = resp);
					break;
				} catch(e) {
					_logError("Error occured @ booking home page : ", e.toString());
				}
				let booking_page_req_t2 = performance.now();
				_logInfo(`Booking page req time : ${booking_page_req_t2 - booking_page_req_t1} ms`);
			}

			_logSuccess("Booking homepage fetched");

			while(true) {
				_logInfo("Trying to fetch new booking page URL...");
				let new_booking_page_t1 = performance.now();
				try {
					queryString = await newBookingRequest({
						cookie,

						eventTarget,
						eventArgument,

						viewState,
						viewStateEncrpyted,
						viewStateGenerator,
						eventValidation
					});
					let new_booking_page_t2 = performance.now();
					_logInfo(`New booking page req time : ${new_booking_page_t2 - new_booking_page_t1} ms`);

					break;
				} catch(e) {
					_logError("Error occured trying to fetch new booking page : ", e.toString());
				}
			}

			_logSuccess("New booking page URL fetched");

			let bookingPageSTicket;
			let lblk, email, bookingPageCaptchaImgData;
			let aq;

			// browser = await puppeteer.launch({
			// 	headless: false,
			// 	args: ["--no-sandbox", "--window-size=1366,768"]
			// });
			// page = await browser.newPage();

			// await page.setCookie({
			// 	name: cookie.split(";")[0].split("=")[0].trim(),
			// 	value: cookie.split(";")[0].split("=")[1].trim(),
			// 	url: "https://onlinebooking.sand.telangana.gov.in",
			// 	domain: "onlinebooking.sand.telangana.gov.in",
			// 	path: "/",
			// 	expires: Date.now() + 1000*60*60*10,
			// 	httpOnly: true,
			// 	secure: true,
			// 	sameSite: "Lax"
			// });

			// if(cookie.split(";").length == 2) {
			// 	await page.setCookie({
			// 		name: cookie.split(";")[1].split("=")[0].trim(),
			// 		value: cookie.split(";")[1].split("=")[1].trim(),
			// 		url: "https://onlinebooking.sand.telangana.gov.in",
			// 		domain: "onlinebooking.sand.telangana.gov.in",
			// 		path: "/",
			// 		expires: Date.now() + 1000*60*60*10,
			// 		httpOnly: true,
			// 		secure: true,
			// 		sameSite: "Lax"
			// 	});
			// }

			// await page.goto("https://onlinebooking.sand.telangana.gov.in/Order/NEWBOOKING.aspx" + "?" + queryString);
			// break;

			// browser = await puppeteer.launch({
			// 	headless: false,
			// 	args: ["--no-sandbox", "--window-size=1366,768"]
			// });
			// page = await browser.newPage();
			// await app.whenReady();
			// app.commandLine.appendSwitch('--no-sandbox');
			// await session.defaultSession.cookies.set({
			// 	name: cookie.split("=")[0].trim(),
			// 	value: cookie.split("=")[1].trim(),
			// 	url: "https://onlinebooking.sand.telangana.gov.in",
			// 	domain: "onlinebooking.sand.telangana.gov.in",
			// 	path: "/",
			// 	expires: Date.now() + 1000*60*60*10,
			// 	httpOnly: true,
			// 	secure: true,
			// 	sameSite: "lax"
			// });
			// const win = new BrowserWindow({
			// 	width: 1000,
			// 	height: 600
			// })
			// await win.loadURL("https://onlinebooking.sand.telangana.gov.in/Order/NEWBOOKING.aspx" + "?" + queryString);
			// break;

			while(true) {
				_logInfo("Loading new booking page...");
				let new_booking_modal_t1 = performance.now();
				try {
					let resp = await newBookingPageRequest({
						cookie,
						queryString
					});

					email = resp.email;
					lblk = resp.lblk;
					bookingPageCaptchaImgData = resp.captchaImgData;

					bookingPageSTicket = resp.sTicket;

					_logSuccess("New booking page loaded", resp);

					break;
				} catch(e) {
					_logError("Error occured while loading new booking page", e.toString());
					await wait(300);
				}
				let new_booking_modal_t2 = performance.now();
				_logInfo(`New booking modal time : ${new_booking_modal_t2 - new_booking_modal_t1} ms`);
			}

			// console.log("booking page sTicket : ", bookingPageSTicket);

			let stockyards;
			let spid, did;
			let stockyardFound = false;

			// await wait(110);

			// 1. Get stockyards
			await wait(500);
			stockyard_loop:
			while(true) {

				while(true) {
					_logInfo("Fetching stockyards...");
					let stockyard_req_t1 = performance.now();
					try {
						stockyards = await getStockpoints({
							cookie,
							sTicket: bookingPageSTicket
						});
						_logInfo("stockyard resp : ", stockyards)
	
						_logSuccess("Stockyards fetched");
						break;
					} catch(e) {
						_logError("Error occured while fetching stockyards", e.toString());
						await wait(100);
					}
					let stockyard_req_t2 = performance.now();
					_logInfo(`Stockyard req time : ${stockyard_req_t2 - stockyard_req_t1} ms`);
				}
	
				for(let i=0; i<stockyards.length; i++) {
					let s = stockyards[i];
					let n = new String(s.STOCK_POINT_NAME).toLowerCase();
					let contains = true;
					for(let j=0; j<config.stockyard.length; j++) {
						if(! n.includes(config.stockyard[j].toLowerCase())) {
							contains = false;
						} 
					}
	
					if(contains) {
						spid = s.STOCK_ID;
						did = s.DISTRICT_ID;
						stockyardFound = true;
						_logSuccess("Pre-configured stockyard found");
						break stockyard_loop;
					}
				}

				if(stockyardFound) {
					break;
				} else { // for readability
					_logError("Preconfigured stockyard not found")
					await wait(200);
					continue stockyard_loop;
				}
			}

			// if(!stockyardFound) {
			// 	_logError("Pre-configured stockyard not found!");

			// 	let items = stockyards.map(val => val.STOCK_POINT_NAME);
			// 	let index = await selectStockyard(items);
			// 	_logInfo(`Selected stockyard : ` + items[index]);

			// 	spid = stockyards[index].STOCK_ID;
			// 	did = stockyards[index].DISTRICT_ID;
			// }

			// 2. Select stockyards
			while(true) {
				_logInfo("Selecting stockyard...");
				try {
					let stockpoint_req_t1 = performance.now();
					resp = await selectStockpoint({
						sTicket: bookingPageSTicket,
						cookie,
		
						cdid: "24",
						spid,
						did
					});
					let stockpoint_req_t2 = performance.now();
					_logInfo(`Stockpoint req time : ${stockpoint_req_t2 - stockpoint_req_t1} ms`);

					// console.log(resp);

					if(resp.STATUS == "T") {
						_logSuccess("Stockyard selected");
						t5 = performance.now();
						aq = resp.SQTYS;
						break;
					} else {
						_logError("Error occured while selecting stockyard", resp);
						await wait(100);
					}
				} catch(e) {
					_logError("Error occured while selecting stockyard", e);
					await wait(100);
				}
			}

			// console.log(spid, did);


			// 3. Submit vehicle #
			while(true) {
				try {
					let vehicle_register_t1 = performance.now();
					resp = await submitVehicleNumber({
						sTicket: bookingPageSTicket,
						cookie,
		
						vehicleNumber: config.vehicleNumber
					});
					let vehicle_register_t2 = performance.now();
					_logInfo(`Vehicle register req time : ${vehicle_register_t2 - vehicle_register_t1} ms`);

					if(resp.STATUS == "T") {
						_logSuccess("Vehicle number submitted", resp);
						break;
					} else {
						_logError("Error occured trying to submit vehicle number", resp.MESSAGE ?? resp);
					}
				} catch(e) {
					_logError("Error occured trying to submit vehicle number", e);
				}
			}

			// console.log(aq);
			let bookingCaptchaSolution = await getBookingCaptchaSolution(bookingPageCaptchaImgData);
			t6 = performance.now();
			waitTime = t6 - t5;
			waitTime = Math.ceil(config.wait_time_booking_ms - waitTime);
			_logInfo(`Time to wait : ${waitTime}ms | Timer ends at : ${new Date(Date.now() + waitTime).toLocaleString()}`);
			if(waitTime > 0) {
				if(waitTime > 30*1000) {
					await wait(30*1000);
					establishTcpConns(5).catch(err => {});
					await wait(waitTime - 30*1000);
				} else {
					establishTcpConns(2).catch(err => {});
					await wait(waitTime);
				}
			}

			// 4. Register
			while(true) {
				_logInfo("Trying to register...");
				try {
					let register_req_t1 = performance.now();
					let json = await register({
						cookie,
						sTicket: bookingPageSTicket,

						aq,
						captcha: bookingCaptchaSolution,
						email,
						lblk,
						vehicleNumber: config.vehicleNumber
					});
					let register_req_t2 = performance.now();
					_logInfo(`Register req time : ${register_req_t2 - register_req_t1} ms`);
					_logInfo("Response : ",json);
					if (json.STATUS == 'T') {
                        if (json.TYPE == 'RE') {
							_logError("Instructed to redirect @ call to register!");
                        }
                        else {
							_logSuccess("Successfully registered!", json);
							t7 = performance.now();
							break;
						}
                    }
                    else if (json.STATUS == 'F') {
                        if (json.TYPE == 'MESS') {
                            _logError("Error: ", json.MESSAGE);
                        }
                        else if (json.TYPE == 'RE') {
                            if (json.MESSAGE != '') {
                                _logError("Error: ", json.MESSAGE);
                            } else {
								_logError("Instructed to redirect @ call to register!");
							}
                        }
                    }

				} catch(e) {
					_logError("An error occured!", e);
				}

				await wait(100);
			}
			
			// 5. Submit otp
			let bookingOTP = await getBookingPageOTP();
			t8 = performance.now();
			waitTime = t8-t7;
			waitTime = Math.ceil(config.wait_time_booking_otp_ms - waitTime);
			if(waitTime > 0) {
				await wait(waitTime);
			}

			let vehicleOtpRetry = false;
			vehicle_otp_loop:
			while(true) {

				if(vehicleOtpRetry) {
					bookingOTP = await getBookingPageOTP();
				}

				_logInfo("Trying to submit OTP...");
				try {
					let booking_otp_req_t1 = performance.now();
					let json = await submitBookingOTP({
						cookie,
						sTicket: bookingPageSTicket,

						aq,
						captcha: bookingCaptchaSolution,
						email,
						lblk,
						vehicleNumber: config.vehicleNumber,
						otp: bookingOTP
					});
					let booking_otp_req_t2 = performance.now();
					_logInfo(`Booking otp req time : ${booking_otp_req_t2 - booking_otp_req_t1} ms`);

					if (json.STATUS == 'T') {
						paymentGatewayURL = json.REDIRECT;
						_logSuccess("OTP Accepted!");
						break;
					}
					else if (json.STATUS == 'F') {
						_logError("Failed to submit OTP", json);
						if(! json.REDIRECT) {
							vehicleOtpRetry = true;
							continue vehicle_otp_loop;
						}
					}
				} catch(e) {
					_logError("Error occured trying to submit otp", e);
				}

				await wait(100);
			}


			// 6. Open payment gateway in browser
			break;
		}

		browser = await puppeteer.launch({
			headless: false,
			args: ["--no-sandbox", "--window-size=1366,768"]
		});
		page = await browser.newPage();

		await page.setCookie({
			name: cookie.split(";")[0].split("=")[0].trim(),
			value: cookie.split(";")[0].split("=")[1].trim(),
			url: "https://onlinebooking.sand.telangana.gov.in",
			domain: "onlinebooking.sand.telangana.gov.in",
			path: "/",
			expires: Date.now() + 1000*60*60*10,
			httpOnly: true,
			secure: true,
			sameSite: "Lax"
		});

		if(cookie.split(";").length == 2) {
			await page.setCookie({
				name: cookie.split(";")[1].split("=")[0].trim(),
				value: cookie.split(";")[1].split("=")[1].trim(),
				url: "https://onlinebooking.sand.telangana.gov.in",
				domain: "onlinebooking.sand.telangana.gov.in",
				path: "/",
				expires: Date.now() + 1000*60*60*10,
				httpOnly: true,
				secure: true,
				sameSite: "Lax"
			});
		}

		await page.goto(paymentGatewayURL);

		// await page.setRequestInterception(true);

		// let listener = async (httpRequest) => {
		// 	let type = httpRequest.resourceType();
		// 	if(type != "fetch" && type != "xhr" && type != "document") {
		// 		return;
		// 	}

		// 	let resp = httpRequest.response();

		// 	try {
		// 		await fs.promises.appendFile("test.txt","\n\n");
		// 		await fs.promises.appendFile("test.txt", `${httpRequest.method()}(${type}) ${httpRequest.url()}` + "\n");
		// 		await fs.promises.appendFile("test.txt", resp.status() + "\n");
		// 		await fs.promises.appendFile("test.txt", JSON.stringify(httpRequest.headers()) + "\n");
		// 		await fs.promises.appendFile("test.txt", (httpRequest.postData() ?? "") + "\n" );

		// 		await fs.promises.appendFile("test.txt", JSON.stringify(resp.headers()) + "\n");
		// 		await fs.promises.appendFile("test.txt", await resp.text());
		// 		await fs.promises.appendFile("test.txt","\n\n");
		// 	} catch(e) {

		// 	}
		// }
		// page.on("requestfinished", listener);

		// page.on("request", (httpRequest) => {
		// 	httpRequest.continue();
		// });

	} catch(e) {
		console.log(e)
	}
}