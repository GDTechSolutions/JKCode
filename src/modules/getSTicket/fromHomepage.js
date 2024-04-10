const deobfuscate = require("../deobfuscator");

module.exports = function(inp) {
	source = JSON.stringify(inp);

	return new Promise((resolve, reject) => {
		deobfuscate(source.trim())
		.then(code => {
			let regexp = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;
			let pos = code.search(regexp);
		
			let sticket = "";
			for(let i=pos; i<pos+36; i++) {
				sticket += code[i];
			}
		
			resolve(sticket);
		})
		.catch(reject);
	})
}