var fs = require('fs');

outputFilename = './questions.json';

module.exports = {

    getQuestions: function () {
        return JSON.parse(fs.readFileSync(outputFilename, 'utf8'));
    },

    saveQuestions: function (data) {
        fs.writeFileSync(outputFilename, JSON.stringify(data, null, 4));
    },

    messageType: function(data) {
        if (data.body.message.text)
            return "text";
        else if (data.body.message.location)
            return "location";
    },

    isCommand: function(data) {
        if (data.charAt(0) == '/')
            return true;
        else
            return false;
    },

    countWords: function(data) {
        return data.split(" ").length;
    }

}