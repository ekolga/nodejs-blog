const path           = require('path');
const fs             = require('fs');
const { v4: uuidv4 } = require('uuid');
const fnsDate        = require('date-fns/format')

class Article {
    constructor(title, text) {
        this.title        = title;
        this.text         = text;
        this.id           = uuidv4();
        this.created_at   = new Date(Date.now()).toISOString();
        this.visible_date = fnsDate(new Date(Date.now()), 'PPP')
    }

    toJSON() {
        return {
            title: this.title,
            text: this.text,
            id: this.id,
            created_at: this.created_at,
            visible_date: this.visible_date
        };
    }

    static getAll() {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, '..', 'data', 'articles.json'), 'utf-8', (err, data) => {
                if (err) reject(err);
    
                resolve(JSON.parse(data));
            });
        });
    }

    async save() {
        const fileContent = await Article.getAll();
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

    static getTitle(id) {
        return this.title;
    }

    static getText(id) {
        return this.text;
    }

    static getId() {
        return this.id;
    }

    static async getOneById(id) {
        const articles = await Article.getAll();

        return articles.find(article => article.id === id);
    }
}

module.exports = Article;