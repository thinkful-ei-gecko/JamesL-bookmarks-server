const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./logger');
const store = require('./store');
const validUrl = require('valid-url');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(store)
  })
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body;
  
    //validations
    if(!title) {
      logger.error('Title is required')
      return res.status(400).send('Invalid data')
    }
    if(!description) {
      logger.error('Description is required')
      return res.status(400).send('Invalid data')
    }
    if(!validUrl.isUri(url)) {
      logger.error('Invalid url')
      return res.status(400).send('Invalid data')
    }
    if(!Number.isInteger(rating) || rating < 1 || rating > 5) {
      logger.error('Invalid rating')
      return res.status(400).send(`Invalid data`)
    }
    const id = uuid();
    const bookmark = {
      id,
      title,
      url,
      description,
      rating
    }
  
    store.push(bookmark);
    logger.info(`Bookmark with id ${id} created`)
    res.status(201).location(`http://localhost:8000/bookmarks/${id}`).json(bookmark);
  })

bookmarkRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params;
    console.log(id)
    const bookmark = store.find(b => b.id == id)
    
    if(!bookmark) {
      logger.error(`Bookmark with id ${id} not found`)
      return res.status(404).send('Bookmark not found')
    }
    res.json(bookmark)
  })
  .delete((req, res) => {
    const { id } = req.params;

    const bookmarkIndex = store.findIndex(bookmark => bookmark.id === id);

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found`);
      return res.status(404).send('Not found');
    }

    store.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${id} deleted`);
    res.status(204).end();
  })

module.exports = bookmarkRouter;