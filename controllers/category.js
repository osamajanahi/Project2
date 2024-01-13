const {Category} = require('../models/Category');
const {Event} = require('../models/Event');
const dayjs = require('dayjs')
const uploadCloudinary = require('../config/cloudinaryConfig');
var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

exports.category_add_get = (req, res) =>{
    res.render('category/add');
}

exports.category_add_post = async (req, res) =>{    
    let category = new Category(req.body);
    console.log(req.file);
    let image = `public/images/${req.file.filename}`;
    await uploadCloudinary.upload_single(image)
    .then((imagePath) =>{
        console.log(imagePath.url)
        category.image = imagePath.url;
    })
    .catch((err) =>{
        console.log(err);
    })
    category.save()
    .then(() =>{
        res.redirect("/category/index")
    })
    .catch((err) =>{
        console.log(err);
    })
}

exports.category_index_get = (req, res) => {
    Category.find().populate('event')
    .then((categories) => {
        res.render("category/index", {categories});
    })
    .catch((err) => {
        console.log(err);
    })
}

exports.category_show_get = (req, res) => {
    console.log(req.query.id);
  
    Category.findById(req.query.id).populate('event')
    .then((category) => {
        console.log(category)
        res.render('category/detail', {category, dayjs})
    })
    .catch((err) => {
        console.log(err);
    })

}

exports.category_delete_get = (req, res) => {
    console.log(req.query.id);  // for debugging purpose
    Category.findByIdAndDelete(req.query.id) // a mongoDB method
    .then(() => {
        res.redirect('/category/index');
    })
    .catch((err) => {
        console.log(err);
    });
}

exports.category_edit_get = (req,res) => {
    Category.findById(req.query.id)
    .then(category => {
        res.render('category/edit', {category});
    })
    .catch(err => {
        console.log(err);
    })
}


exports.category_update_post = async (req, res) => {
    console.log(req.body.id);
    // Check if a new image was uploaded
    if (req.file) {
        let image = `public/images/${req.file.filename}`;
        uploadCloudinary.upload_single(image)
        .then((imagePath) =>{
            console.log(imagePath.url)
            console.log(req.body)
            const updateFields = {name: req.body.name, image: imagePath.url};
            Category.findByIdAndUpdate(req.body.id, updateFields)
            .then(() => {
                res.redirect('/category/index');
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send('Internal Server Error');
            });        })
        .catch((err) =>{
            console.log(err);
        })    
    }
    else{
        Category.findByIdAndUpdate(req.body.id, req.body)
        .then(() => {
            res.redirect('/category/index');
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Internal Server Error');
        });
    }
    // Update the category with the new information
};
