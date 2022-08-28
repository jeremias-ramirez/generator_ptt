require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const generatorPtt = require('./src/app/generatorPtt/generatorPtt.api');

(async function main() {
    try {
        const argsIn = process.argv.slice(2);
        console.log("argIn:", argsIn);

        const folderPath = argsIn[0];
        const filesName = await fs.readdir(folderPath);

        //const fileName = filesName[0];
        //const src = path.join(folderPath, fileName);
        //const name = fileName.slice(0, -4);
        //const presentation = await generatorPtt.generatePtt({ src, name });

        for (let i = 0; i < filesName.length; i++) {
            const fileName = filesName[i];
            const src = path.join(folderPath, fileName);
            const name = fileName.slice(0, -4);
            const presentation = await generatorPtt.generatePtt({ src, name });


        }
        //filesName.forEach(async (fileName) => {
        //    const src = path.join(folderPath, fileName);
        //    const name = fileName.slice(0, -4);
        //    const presentation = await generatorPtt.generatePtt({ src, name });

        //});


        //const presentation = await generatorPtt.generatePtt({ src: argsIn[0], name: argsIn[1] });
        //console.log("Presentation: ", presentation);

    } catch (error) {
        console.log("Error api call: ", error);
    }
})();