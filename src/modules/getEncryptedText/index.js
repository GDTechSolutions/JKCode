const crypto = require("crypto");

module.exports = function(key, text) {
	const algorithm = "aes-128-cbc"; 
	
	const initVector = new Buffer.from(key, "utf-8");
	const Securitykey = initVector;
	
	const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
	
	let encryptedData = cipher.update(text, "utf-8", "base64");
	encryptedData += cipher.final("base64");
	
	return encryptedData;
}