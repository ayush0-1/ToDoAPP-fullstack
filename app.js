//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ayush:16112111@cluster0.uwii0wk.mongodb.net/todoListDB");

const listSchema = new mongoose.Schema({
  name: String
});

const List = mongoose.model("List" , listSchema);

const pgSchema = new mongoose.Schema({
   name: String,
   items: [listSchema]
})

const Pg = mongoose.model("Pg" , pgSchema);


app.get("/", function(req, res) {

  List.find().then(items=>{

      res.render("list", {listTitle: "Today" , newListItems: items});
  
  })

});


app.get("/:customListName" , (req , res)=>{
  const customListName =  _.capitalize(req.params.customListName);

  Pg.findOne({name : customListName})
  .then(foundPg=>{
    if(foundPg==null)
    res.render('list' , {listTitle: customListName , newListItems: []})
    else
    res.render('list' , {listTitle: customListName , newListItems:  foundPg.items})

    
    // console.log(foundPg)
  })

})


app.post("/", function(req, res){

  const item = req.body.newItem;
  const page = req.body.list;

  // console.log(page);

  const li = new List({
    name: item
  })
  
  if(page=== "Today"){
    li.save();
    res.redirect('/');
  }
  else{
    Pg.findOne({name: page})
    .then((foundList)=>{
      if(foundList==null)
      {
        const newList = new Pg({
          name: page,
          items: [li]
        }) 
        newList.save()
        res.redirect("/"+page);

      }
      else
      {
        foundList.items.push(li)
        foundList.save()
        res.redirect("/"+page);
      }
      // console.log(foundList)
    })
  }

 

});



app.post("/delete" , (req , res)=>{
 
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  
  console.log(req.body)
  // console.log(listName)
  // console.log(checkedItemID)

  if(listName === "Today")
  {
    List.findByIdAndRemove(checkedItemID).then(()=>{
      res.redirect("/");
    })
  }
  else{
    Pg.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}).exec();
    // Pg.updateOne({name: listName}, {$pull: {items: {_id: checkedItemID}}}).exec();

    res.redirect("/" + listName);
  }

});








app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
