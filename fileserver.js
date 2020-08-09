const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const crypto = require('crypto');
const sanitize = require("sanitize-filename");
var sqlite3 = require("sqlite3");
var db = new sqlite3.Database("filebin.db");

const app = express();
const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/static'))
app.set('views', __dirname + '/static');
app.set('view engine', 'ejs');


// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

const DESTINATION = 'uploads/'

const storage = multer.diskStorage({
  destination: DESTINATION,
  filename: function (req, file, cb) {

    // TODO: check if a file with file.originalname exists
    // and if exists, add suffix with datetime, else do below
    cb(null, sanitize(file.originalname));
  }
})

app.listen(port, () => console.log(`Listening on port ${port}...`));


app.get('/', (req, res) => {
  crypto.pseudoRandomBytes(16, function (err, raw) {
    if (err) return callback(err);

    res.render('filebin', {
      newurl: raw.toString('hex')
    })
  });
})

app.post('/upload-multiple', (req, res) => {
  let upload = multer({
    storage: storage,
    limits: {
      fieldNameSize: 500, // max string length of filename
      fileSize: 20971520
    },
    fileFilter: (filereq, file, cb) => {

      // cb(null, false)

      cb(null, true)
    }
  })
    .array('multiple_files', 30)

  console.log("inside multiple-upload")

  upload(req, res, function (err) {


    if (req.fileValidationError) {
      return res.send(req.fileValidationError)
    }
    else if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.send(err)
    } else if (!req.files.length) {
      return res.send('You need to select atleast one file and then upload!')
    } 
    else if (err) {
      // An unknown error occurred when uploading.
      return res.send(err)
    }

    // Save unique url and filename, filesize, created_time, is_downloaded in sqlite3 
    var stmt = db.prepare(`
      INSERT INTO filebin 
      (
        page_url,
        file_name,
        file_size,
        file_path,
        mimetype,
        fieldname,
        created_time,
        is_downloaded
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    req.files.forEach(function (file) {

      stmt.run(
        req.body.shareUrl,                // page_url,
        file.filename,                 // file_name,
        file.size,                    // file_size,
        file.path,                    // file_path
        file.mimetype,                // mimetype
        file.fieldname,               // fieldname
        Date.now(),                   // created_time,
        false
      );
    })

    stmt.finalize();


    // redirect user to page with link
    res.redirect(`/share/${req.body.shareUrl}`)
  })
})

app.get('/share/:url', function (req, res) {
  // select * from tablename where page_url = uniqueurl
  db.all("SELECT * FROM filebin where page_url = ?", [req.params.url], (err, files) => {
    if (err) {
      return res.status(500).send('showfiles', {
        files: [],
        error: err
      })
    }
    if (!files.length) {
      return res.status(404).send('404')
    }

    res.render('showfiles', {
      files: files,
      url: `${req.params.url}`
    })
  });

})


app.get('/download/:url/:filename', function (req, res) {
  // select * from tablename where page_url = uniqueurl and filename=filename
  db.all("SELECT * FROM filebin where page_url = ? and file_name = ? LIMIT 1",
    [req.params.url, req.params.filename],
    (err, files) => {
      if (err) {
        return res.render('500')
      }

      if (!files.length) {
        return res.render('404')
      }

      if (files[0].is_downloaded === 1) {
        res.render('message', {
          msg: 'File Download Expired'
        })
        return;
      }

      res.download(`uploads/${req.params.filename}`, req.params.filename, function (err) {
        if (err) {
          // Handle error, but keep in mind the response may be partially-sent
          // so check res.headersSent
          res.render('500')
        } else {
          console.log('inside downloade')
          // update the is_downloaded filed in db to true
          let stmt = `UPDATE filebin SET is_downloaded = 1 WHERE page_url = ? and file_name=?`
          db.run(stmt, [req.params.url, req.params.filename], function(err, rows) {
            console.log(err, rows)
          })
        }
      })
    })

})


db.serialize(function () {
  db.run(`
    CREATE TABLE IF NOT EXISTS filebin (
        page_url TEXT,
        file_name TEXT,
        file_size INTEGER,
        file_path TEXT,
        mimetype TEXT,
        fieldname TEXT,
        created_time INTEGER,
        is_downloaded INTEGER
    )`
  );
});

