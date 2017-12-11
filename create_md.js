var fs = require('fs');

function createMD(fileName, noteData) {
  var content = _createContent(noteData);
  fs.writeFile('./post/' + fileName + '.md', content, function(err) {
    if (err) {
      throw err;
    }
    console.log('Saved!');
  });
}

function _createContent(data) {
  var noteConfig = "---\ntitle: " + data.title + '\ndate: ' + data.date + '\nauthor: ' + data.author + '\n---\n\n';
  var noteContent = data.noteContent;
  return noteConfig + noteContent;
}

module.exports = createMD;
