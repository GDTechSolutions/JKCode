const fetch = require("node-fetch");

const loginRequest = require("../requests/login");
const otpRequest = require("../requests/otp");

let otps = [];
let wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let loggedInSessions = [];

function keepFetchingOtps(startTimestamp) {
	function getOtps() {
		return new Promise(async (resolve, reject) => {
			try {
				let resp = await fetch(`http://137.184.157.126/get-otps/${startTimestamp}`);
				if(! resp.ok) {
					return;
				}
				if(resp.status != 200) {
					return;
				}

				let jsonResp = await resp.json();
				for(let i=0; i<jsonResp.length; i++) {
					if(! otps.includes(jsonResp[i])) {
						console.log("otps : ", otps);
						otps.push(jsonResp[i]);
					}
				}
			} catch(e) {
				console.error(e);
			}
		});
	}

	let flag = false;

	return {
		start: async function() {
			while(true) {
				try {
					await getOtps();
					if(flag) {
						break;
					}

					await wait(500);
				} catch(e) {
					
				}
			}
		},
		stop: function() {
			flag = true;
		}
	}
}

function getSession() {
	return new Promise(async (resolve, reject) => {
		try {
			let resp = await fetch("http://localhost:8081")		
			if(! resp.ok) {
				return reject("resp.ok is not ok");
			}
			if(resp.status != 200) {
				return reject("status code is not 200");
			}
	
			let jsonResp = await resp.json();
			resolve(jsonResp);
		} catch(e) {
			reject(e);
		}
	});
}

function login(inp) {
	return new Promise(async (resolve, reject) => {
		let waitTime = inp.loginOtpTimerStartAt + global.config.wait_time_login_ms - Date.now();
		if(waitTime > 0) {
			await wait(waitTime);
		}

		loginRequest({
			uni: inp.uni,
			unv: inp.unv,
			pswi: inp.pswi,
			pswv: inp.pswv,
			scptv: inp.scptv,
			captchaSolution: inp.cptv,
			sTicket: inp.sTicket,
			cookie: inp.sessionID,
			resend: false
		})
		.then(resp => {
			if(resp.STATUS == "T") {
				resolve();
			} else {
				reject();
			}
		})
		.catch(reject);
	});
}

function loginOtpRequest(inp) {
	return new Promise(async (resolve, reject) => {
		let waitTime = inp.loginOtpTimerStartAt + global.config.wait_time_otp_ms - Date.now();
		if(waitTime > 0) {
			await wait(waitTime);
		}

		otpRequest({
			uni: inp.uni,
			unv: inp.unv,
			pswi: inp.pswi,
			pswv: inp.pswv,
			scptr: inp.scptr,
			otp: inp.otp,
			captchaSolution: inp.captchaSolution
		})
		.then(resp => {
			if(resp.STATUS == "T") {
				resolve();
			} else {
				reject(resp);
			}
		})
		.catch(err => {
			reject(err);
		});
	});
}

function fetchSessionAndLoginIn() {
	return new Promise(async (resolve, reject) => {
		while(true) {
			try {
				let session = await getSession();
				let waitTime = session.loginTimerStartAt + global.config.wait_time_login_ms - Date.now();
				if(waitTime > 0) {
					await wait(waitTime)
				}
		
				let resp = await login({
					uni: session.uni,
					unv: global.config.username,
					pswi: session.pswi,
					pswv: session.pswv,
					scptv: session.pswv,
					scptr: session.scptr,
					sTicket: session.sTicket,
					cptv: session.cptv,
					sessionID: session.sessionID
				});
				if(resp.STATUS == "T") {
					session.loginOtpTimerStartAt = Date.now();
					loggedInSessions.push(session);
					// loggedInSession.sort((a,b)=>a>b);
					resolve();
					break;
				}
			} catch(e) {
				console.log("fetch session and login : ",e);
				// reject(e);
			}
		}
	});
}

function batchOtpRequest(session) {
	return new Promise((resolve, reject) => {
		let promiseArr = [];
		for(let i=0; i<otps.length; i++) {
			promiseArr.push(loginOtpRequest({
				uni: session.uni,
				unv: global.config.username,
				pswi: session.pswi,
				pswv: session.pswv,
				scptr: session.scptr,
				otp: otps[i],
				captchaSolution: session.cptv
			}));
		}

		Promise.any(promiseArr)
		.then(()=>{
			resolve(session)
		})
		.catch(reject);
	});
}

module.exports = function() {
	return new Promise(async (resolve, reject) => {
		let handle = keepFetchingOtps();
		handle.start();

		for(i=0; i<10; i++) {
			fetchSessionAndLoginIn();
		}

		while(true) {
			try {
				if(loggedInSessions.length == 0) {
					await wait(20);
					continue;
				}
				let session = loggedInSessions[0];
				loggedInSessions = loggedInSessions.shift();
	
				let resp = await batchOtpRequest(session);
				resolve(resp);
				break;
			} catch(e) {
				console.error(e);
			}
		}
	});
}