//jshint esversion:6
const express= require("express");
const app= express();
const bodyParser=require("body-parser");
const date=require(__dirname +"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
var server_host = process.env.YOUR_HOST || '0.0.0.0';

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-srestha:Test123@cluster0.marn8.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true});

const itemsSchema ={
    name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Welcome to your todolist!."
});
const item2 = new Item({
    name: "Hit the + button to add a new item."
});
const defaultItems= [item1,item2];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);


app.get("/", function(req ,res){

    Item.find({}, function(err, results){
        if(results.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully saved items to db.");
            
                } 
            });
            res.redirect("/");
        }else{
            res.render("list",{listTitle :"Today", newListItem: results});       
        }
    });
 let day= date.getDate();  
});

app.get("/:customListName", function(req, res){

    const customListName =  _.capitalize(req.params.customListName);
    
    List.findOne({name:customListName},function(err, foundList){
        if(!err){
            if(!foundList){
                //Create a new List
                const list = new List({
                    name: customListName,
                    items: defaultItems
                    });
                   
                    list.save();
                    res.redirect("/" + customListName);
            } else {
                //show an existing list

               res.render("list", {listTitle: foundList.name, newListItem: foundList.items});
            }
        }
    });
  
    
});
app.post("/", function(req, res){
    const itemName=req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
       item.save();
       res.redirect("/");

    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        });
    }
});


app.post("/delete", function(req, res){
    const checkedItem=req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItem, function(err){
          if (!err) {
            console.log("Successfully deleted checked item.");
            res.redirect("/");
          }
        })
    } else {
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItem}}},function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }  
 
    
});



app.get("/about",function(req,res){
  res.render("about");
});
app.listen(server_port, server_host, function(){
    console.log("Server started on port 3000");
});