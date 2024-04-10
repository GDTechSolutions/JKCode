const deobfuscate = require("../deobfuscator");

module.exports = function(inp) {
	let regexp = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;
	let pos = inp.search(regexp);

	let sticket = "";
	for(let i=pos; i<pos+36; i++) {
		sticket += inp[i];
	}

	return sticket;
}