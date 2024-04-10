const express = require("express");
const bodyParser = require("body-parser");
const { JSDOM } = require("jsdom");

const getEncryptedText = require("./modules/getEncryptedText");
const getSticket = require("./modules/getSTicket/fromHomepage");
const getCaptchaSolution = require("./modules/captchaSolution");

let app = express();

app.use(bodyParser.json());

app.post("/login-params", async (req, res) => {

	let body = req.body;

	let html = body.html;
	let password = body.password;

	// console.log(body);

	let dom = new JSDOM(html);

	let userNameEl = dom.window.document.querySelector("#tblLogIn #divd > input[type=text][style='border: 1px solid #a0004f; padding: 3px 10px; Width:140px']");
	let passwordEl = dom.window.document.querySelector("#tblLogIn input[type=password]");

	iv = passwordEl.getAttribute("onblur").split("('")[1].split("')")[0].trim();

	uni = userNameEl.getAttribute("id");
	pswi = passwordEl.getAttribute("id");

	scptr = dom.window.document.querySelector("#lblpt").value;
	scptv = scptr;

	let scripts = dom.window.document.querySelectorAll("script");
	let scriptSource;
	for(let i=0; i<scripts.length; i++) {
		if(scripts[i].innerHTML.includes(`_0xeb4d`)) {
			scriptSource = scripts[i].innerHTML;
			break;
		}
	}
	sTicket = await getSticket(scriptSource);

	let pswv = getEncryptedText(iv, password);

	res.json({
		pswv,
		uni,
		pswi,
		scptr,
		scptv,
		sTicket
	});
});

app.post("/captcha-solution", (req, res) => {
	try {
		let imgData = req.body.imgData;
		// console.log(imgData);
		let solution = getCaptchaSolution(imgData);
		console.log(solution);
		res.json({solution});
	} catch(e) {
		console.log(e);
		res.status(500).json();
	}
});

app.listen(8000, ()=>{
	console.log("Server online");
});