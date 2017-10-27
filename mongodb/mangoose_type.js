var Mongoose=require('mongoose');

var NoteSchema = new Mongoose.Schema({
  noteId: {type: String, isRequired: true},
  title: {type: String, isRequired: true},
  author: {type: String},
  date: {type: String},
  noteContent: {type: String, isRequired: true}
});

module.exports = Mongoose.model('Note',NoteSchema);