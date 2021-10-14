import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import useragent from 'express-useragent';
const bodyParser = require("body-parser");
require("body-parser-xml")(bodyParser);
import routes from './routes/index';
import { options, mongodbURI } from './config';
// var usersRouter = require('./routes/users');

const app = express();
app.use(cors());

mongoose
  .connect(mongodbURI, options)
  .then(() => {
    console.log('Connected to DB');
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('trust proxy', true);
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, Accept, Content-Type, Authorization'
      );
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      next();
    });
    app.use(useragent.express());

    app.use(bodyParser.json());
    app.use(
      bodyParser.xml({
        limit: "1MB", // Reject payload bigger than 1 MB
        xmlParseOptions: {
          normalize: true, // Trim whitespace inside text nodes
          normalizeTags: true, // Transform tags to lowercase
          explicitArray: false, // Only put nodes in array if >1
        },
      })
    );
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use('/api/v1', routes, cors());

    if (process.env.NODE_ENV === 'production') {
      // Set static folder
      app.use(express.static('client/build'));
    }
    // error handler
    app.use((req, res) => {
      res.status(404).json({
        message: ['Request resource not found.'],
        url: req.originalUrl
      });
    });

    const PORT = process.env.PORT || 80;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error Connecting Database... ${err}`);
  });
