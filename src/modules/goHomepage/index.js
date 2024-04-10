const { exec } = require('child_process');
const path = require("path");
const os = require("os");

const root = path.resolve('./'); 

module.exports = function (slot) {
    return new Promise((resolve, reject) => {
        let binaryFile = os.platform == "win32" ? "main.exe" : "main";
        exec(`"${path.join(root, binaryFile)}" -slot=${slot}`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
        
            let json = JSON.parse(stdout);

            console.log(`\nDEBUG`);
            console.log("imgURL : ",json.imgURL);
            console.log("imgData : ");
            console.log(json.imgData);
            console.log(typeof json.imgData);
            console.log("DEBUG\n");

            resolve(json);
        });
    });
}