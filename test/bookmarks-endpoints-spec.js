const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { testBookmarksArray } = require('./bookmarks.fixtures');

describe.only('Bookmarks Endpoints', () => {
  let db

  before('make knex instance', () => {
    db=knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('bookmarks_lists').truncate())

  afterEach('cleanup', () => db('bookmarks_lists').truncate())

  describe(`Unauthorized requests`, () => {
    it(`GET /bookmarks responds with 401`, () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(401, {error: 'Unauthorized request'})
    })
    it(`GET /bookmarks/:id responds with 401`, () => {
      const testBookmarks = testBookmarksArray()
      const thirdBookmark = testBookmarks[2]

      before('insert articles', () => {
        return db
          .into('bookmarks_lists')
          .insert(testBookmarks)
      })
      return supertest(app)
        .get(`/bookmarks/:${thirdBookmark.id}`)
        .expect(401, {error: 'Unauthorized request'})
    })
  })

  describe(`GET /bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, [])
      })
    })
  })

  describe(`GET /bookmarks/:id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId=1234
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {error: {message: `Bookmark not found`}})
      })
    })
  })

  describe(`GET /bookmarks`, () => {
    context('Given there are bookmarks in the db', () => {
      const testBookmarks = testBookmarksArray()

      beforeEach('insert articles', () => {
        return db
          .into('bookmarks_lists')
          .insert(testBookmarks)
      })

      it('responds 200 with all the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testBookmarks)
      })
    })
  })

  describe('GET /bookmarks/:id', () => {
    context('Given there are bookmarks in the db', () => {
      const testBookmarks = testBookmarksArray()

      beforeEach('insert articles', () => {
        return db
          .into('bookmarks_lists')
          .insert(testBookmarks)
      })

      it('responds 200 and specified bookmark', () => {
        const bookmarkId = 2
        const expectedBookmark = testBookmarks[bookmarkId - 1]
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedBookmark)
      })
    })
  })
})

