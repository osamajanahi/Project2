const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    name: String,
    description: String,
    startDate: Date,
    endDate: Date,
    time: String,
    image: [{type:String}], 
    location: String,
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
},{
    timestamps: true
});

const Event = mongoose.model("Event", eventSchema)

module.exports = {Event};