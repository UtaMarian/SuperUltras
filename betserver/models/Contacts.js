const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const ContactsSchema = new Schema({
    email: {type: String, required: true},
    title : {type: String, required: true},
    content : {type: String, required: true},
    status: {type: String, enum: ['open', 'closed'], default: 'open'},
    createdAt: {type: Date, default: Date.now},
    assignedTo: {type: Schema.Types.ObjectId, ref: 'User', default: null}
  });

const ContactsModel = model('Contacts', ContactsSchema);

module.exports = ContactsModel;