const path = require('path');
const fs   = require('fs');

class Article {
    constructor(title, text) {
        this.title = title;
        this.text  = text;
    }

    toJSON() {
        return JSON.stringify({
            title: this.title,
            text: this.text
        });
    }

    readDataFile() {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, '..', 'data', 'articles.json'), 'utf-8', (err, data) => {
                if (err) reject(err);
    
                resolve(JSON.parse(data));
            });
        });
    }

    async save() {
        const fileContent = await this.readDataFile();
        fileContent.push(this.toJSON());
        
        const writeStream = fs.createWriteStream(path.join(__dirname, '..', 'data', 'articles.json'), {
            encoding: 'utf-8',
            flags: 'r+'
        });

        writeStream.on('finish', () => {
            console.log(`The new article "${this.title}" has been succesfully saved!`);
        });

        writeStream.end(JSON.stringify(fileContent), err => {
            if (err) throw err;
        });
    }
}

module.exports = Article;