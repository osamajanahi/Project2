const {Category} = require('../models/Category');
const {Event} = require('../models/Event');
const {Review} = require('../models/Review')
const uploadCloudinary = require('../config/cloudinaryConfig');
const dayjs = require('dayjs')
var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

exports.event_create_get = (req, res)=>{
  Category.find()
  .then((categories)=>{
     res.render('event/add', {categories, dayjs})
  })
  .catch((err)=>{
    console.log(err)
  })

}
exports.event_create_post = async (req, res, next)=>{
    // console.log(req.body);

    let event = new Event(req.body)
    let images;
    if (req.files) {
        images = req.files.map(file => `public/images/${file.filename}`);
    } else {
        images = [];
    }
    // console.log(`/images/${req.file.filename}`);
    // let cloudPath = `public/images/${req.file.filename}`
    // uploadCloudinary.upload_single(cloudPath)
    let pathDb = [];
await uploadCloudinary.upload_multiple(images)
    .then((imagesPath)=>{
    //     console.log("this is the log from Cloud")
    imagesPath.forEach(pathImg =>{
        console.log(pathImg.url)
        pathDb.push(pathImg.url);
    })
    console.log(pathDb)
    event.image = pathDb;
    })
    .catch((err)=>{
        console.log(err)
    })

   
    

    event.save()
    .then(() => {
        req.body.category.forEach(category => {
            Category.findById(category)
            .then((category) => {
                category.event.push(event);
                category.save();
            })
            .catch((err) => {
                console.log(err);
            });
        });
        res.redirect('/event/index');
    })
    .catch((err) => {
        console.log(err);
        res.send("Please try again later!");
    })
}

exports.events_index_get = (req, res)=>{
    Event.find().populate('category')
    .then((events)=>{

        // Create unique id's out of event name
        for(let i=0; i<events.length;i++){
            events[i]['eventName']=events[i]['name'].toLowerCase().replace(/[^a-z]/g,'')+i;
        }

        res.render('event/index', {events, dayjs})
    })
    .catch((err)=>{
        console.log(err)
    })

}

exports.event_show_get = (req, res)=>{
    console.log(req.query.id);
    Event.findById(req.query.id).populate('category')
    .then((event)=>{
        Review.find({event: req.query.id}).populate('user')
        .then((review)=>{
            res.render('event/detail', {event, review, dayjs})
        })
        .catch((err) =>{
            console.log(err);
            res.render('event/detail', {event, dayjs})
        })
    })
    .catch((err) => {
        console.log(err);
    })
}

exports.event_delete_get = (req, res)=>{
    Event.findByIdAndDelete(req.query.id)
    .then(()=>{
        res.redirect('/event/index')
    })
    .catch((err)=>{
     console.log(err)
    })
}

exports.event_edit_get = (req, res)=>{
    Category.find()
    .then((categories)=>
    {
        Event.findById(req.query.id).populate('category')
        .then((event)=>{
            res.render('event/edit', {event, categories, dayjs})
        })
        .catch((err)=>{
            console.log(err)
        })
    })
    .catch((err) => {
        console.log(err);
    })
}

exports.event_edit_post = async (req, res)=>{
// console.log(req.files)
// console.log(req.body)
    if(req.files.length != 0){
        // console.log("in")
        let images;
        let pathDb = [];
        images = req.files.map(file => `public/images/${file.filename}`);
        await uploadCloudinary.upload_multiple(images)
        .then((imagesPath) =>{
            imagesPath.forEach(pathImg =>{
                // console.log(pathImg.url)
                pathDb.push(pathImg.url);
            })
            // const removeArr = req.body.removeArr;
            // const savedValues = removeArr.split(',');
            // console.log(`These are the saved values ${savedValues}`);
            // savedValues.forEach(value =>{    
            //     Category.findById(value)
            //     .then(cat =>{
            //         cat.event.splice(cat.event.indexOf(req.body.id, 1))
            //         cat.save()
            //     })
            //     .catch(err =>{
            //         console.log(err);
            //     })
            // })
            const body = req.body;
            body.image = pathDb
            Event.findByIdAndUpdate(req.body.id, body)
            .then(() => {
                res.redirect('/event/index');
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send('Internal Server Error');
            });
        })
        .catch((err) =>{
            console.log(err);
        })    
    }
    else{
        Event.findByIdAndUpdate(req.body.id, req.body)
        .then(()=>{
            res.redirect('/event/index')
        })
        .catch((err)=>{
            console.log(err)
        })
        }    
    }

    exports.event_review_post = (req, res) =>{
        let review = new Review(req.body)
        review.save()
        .then(() =>{ 
            res.redirect("/event/detail?id="+req.body.event)
        })
        .catch((err) =>{
            console.log(err);
        })
    
    }

exports.review_edit_post = (req, res) =>{
    console.log(req.body.id)
    Review.findByIdAndUpdate(req.body.id, req.body)
    .then(() =>{
        res.redirect("/event/detail?id="+req.body.eventId)
    })
    .catch((err) =>{
        console.log(err);
    })
}

exports.review_delete_post = (req, res) =>{
    console.log(req.body.id);
    Review.findByIdAndDelete(req.body.id)
    .then(() =>{
        res.redirect("/event/detail?id="+req.body.eventId)
    })
    .catch((err) =>{
        console.log(err);
    })
}

// exports.img_delete_post = (req, res) =>{
//     console.log(req.query.id)
//     console.log(req.body.id)
// }