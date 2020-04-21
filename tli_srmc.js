const url = 'http://54.191.55.210:3000/tli_sheet'; 
// const url = 'http://54.191.55.210/web/index.php/controller/get_tli_srmc'; 
const url_tvi = 'http://54.191.55.210/web/index.php/controller/get_tvi_srmc';   
const sheet_url = 'https://sheets.googleapis.com/v4/spreadsheets/1Cgv9dVdqQYgjfyF39Dkx8BezffCTmXG1kcFMUXwX4mM/values/Pag%201&2!A:C?dateTimeRenderOption=FORMATTED_STRING&majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&prettyPrint=true&alt=json&key=AIzaSyBXiT2YyBtr9Uu7j1SFA_d7nLNgj2I4QGE';
const now = new Date();
const {GoogleSpreadsheet} = require('google-spreadsheet');
const {promisify} = require('util');
const fetch = require("node-fetch");
const mysql = require('mysql');
const express = require('express'); 
const app = express();
const days = ["Sun","Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const bodyParser = require('body-parser')

var  getDateString = function(date, format) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var days = ["Sun","Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    getPaddedComp = function(comp) {
        return ((parseInt(comp) < 10) ? ('0' + comp) : comp)
    },
    formattedDate = format,
    o = {
        "y+": date.getFullYear(), // year
        "v+": days[date.getDay()], //month
        "M+": months[date.getMonth()], //month
        "L+": getPaddedComp(date.getMonth()+1), //month
        "d+": getPaddedComp(date.getDate()), //day
        "h+": getPaddedComp((date.getHours() > 12) ? date.getHours() % 12 : date.getHours()), //hour
         "H+": getPaddedComp(date.getHours()), //hour
        "m+": getPaddedComp(date.getMinutes()), //minute
        "s+": getPaddedComp(date.getSeconds()), //second
        "S+": getPaddedComp(date.getMilliseconds()), //millisecond,
        "b+": (date.getHours() >= 12) ? 'PM' : 'AM'
    };

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            formattedDate = formattedDate.replace(RegExp.$1, o[k]);
        }
    }
    return formattedDate;
};
const datenow = getDateString(new Date(), "M-d");
const ddownloaded_today = getDateString(new Date(), "y-L-d");
const findatetoday = datenow + "  " + getDateString(new Date(), "v");
const tommorow = new Date()
tommorow.setDate(tommorow.getDate()+1);
var tommorowdate = getDateString(new Date(tommorow), "M-d");
var ddownloaded = getDateString(new Date(tommorow), "y-L-d");
var findate = tommorowdate + "  " + getDateString(new Date(tommorow), "v");


app.use(bodyParser.json({ type: 'application/*+json' }));
app.listen(3000, () => {
    console.log("Connected to server");
});

var con = mysql.createConnection({
  host: "54.191.55.210",
  user: "root",
  password: "APT@123!",
  database: "nmms"
});
app.get('/', (req, res) => {
  res.json({message: "connected"});
})
app.get('/tli_sheet', async(req, res) =>{ 
  const response = await fetch(sheet_url);
  const data = await response.json(); 
  res.json(data.values);
})

app.get('/tli_srmc',async(req,res) => {
    var tli_srmc_today = 0;
    var tli_srmc_tom = 0; 
    const response = await fetch(url);
    const data = await response.json();
    data.forEach(doc => { 
        if(doc[0] === findatetoday){ 
            tli_srmc_today = doc[2]; 
            tli_srmc_today = tli_srmc_today.toString().replace(",","");
          }
          if(doc[0] === findate){ 
            tli_srmc_tom = doc[2]; 
            tli_srmc_tom = tli_srmc_tom.toString().replace(",","");
          }
    })
    const formDataToday = {
        ddownloaded: ddownloaded_today,
        srmc: parseFloat(tli_srmc_today)
      };
      const formData = {
        ddownloaded: ddownloaded,
        srmc: parseFloat(tli_srmc_tom)
      };
      var newopt = {};
      if(tli_srmc_today !=0) {
        newopt = formDataToday;
        }
        if(tli_srmc_tom != 0) {
            newopt = formData;
    }
    var query = con.query('INSERT INTO tli_srmc SET ? ON DUPLICATE KEY UPDATE srmc=VALUES(srmc)', newopt, function(err, result) {
        if(result){
            res.status(200).json(result)
        }else{
            res.status(500).json(err);
        }
        
      });

});
app.get('/tvi_srmc',async(req,res) => {
    var tvi_srmc_today = 0;
    var tvi_srmc_tom = 0; 
    const response = await fetch(url_tvi);
    const data = await response.json();
    data.forEach(doc => { 
        if(doc['Delivery date'] === findatetoday){ 
            tvi_srmc_today = doc["SRMC"]; 
            tvi_srmc_today = tvi_srmc_today.toString().replace(",","");
          }
          if(doc['Delivery date'] === findate){ 
            tvi_srmc_tom = doc["SRMC"]; 
            tvi_srmc_tom = tvi_srmc_tom.toString().replace(",","");
          }
    })
    const formDataToday = {
        ddownloaded: ddownloaded_today,
        srmc: parseFloat(tvi_srmc_today)
      };
      const formData = {
        ddownloaded: ddownloaded,
        srmc: parseFloat(tvi_srmc_tom)
      };
      var newopt = {};
      if(tvi_srmc_today !=0) {
        newopt = formDataToday;
        }
        if(tvi_srmc_tom != 0) {
            newopt = formData;
    }
    var query = con.query('INSERT INTO tvi_srmc SET ? ON DUPLICATE KEY UPDATE srmc=VALUES(srmc)', newopt, function(err, result) {
        if(result){
            res.status(200).json(result)
        }else{
            res.status(500).json(err);
        }
        
      });

});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
 