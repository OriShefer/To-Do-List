
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//const url = 'mongodb://127.0.0.1:27017';
const url = 'mongodb+srv://ori150403:Ori540379@cluster0.xsdpddt.mongodb.net';
const dbPath = "/todolistDB";
mongoose.connect(url + dbPath, { useNewUrlParser: true });



const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);



app.get("/", async function (req, res) {

  const foundItems = await Item.find({})

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  
});

app.get("/:customListName", async function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  const foundList = await List.findOne({name: customListName});

      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        await list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
});


app.post("/", async function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

 
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    const foundList = await List.findOne({name: listName});
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
    }

});

app.post("/delete", async function (req, res) {

  const checkedItemId= req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    await Item.findByIdAndRemove(checkedItemId);
    res.redirect("/");
  } else {
    await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
    res.redirect("/" + listName);
  }


});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
