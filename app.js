const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});
const item2 = new Item({
  name: "Hit the + button to get a new item",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  // let today = new Date();
  //   var currentDay = today.getDay();
  //   var day = "";

  // let day = today.toLocaleDateString("en-US", options);
  // const day = date.getDate();
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB!");
        }
      });
      res.redirect("/");
    } else {
      res.render("lists", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

//

app.post("/delete", function (req, res) {
  const checkedItemId = _.capitalize(req.body.checkbox);
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findOneAndDelete(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item deleted !");
        res.redirect("/");
      }
    });
  } //if
  else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:newRoute", function (req, res) {
  const customListName = req.params.newRoute;

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        console.log("list exits!");

        res.render("lists", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

// app.get("/work", function (req, res) {
//   res.render("lists", { listTitle: "Work List", newListItems: workItems });
// });

app.post("/", function (req, res) {
  //console.log(req.body);
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// app.get("/about", function (req, res) {
//   res.render("about");
// });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
