const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks_lists')
  },
  insertBookmark(knex, newBookmark) {
    return knex
      .insert(newBookmark)
      .into('bookmarks_lists')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, id) {
    return knex.from('bookmarks_lists').select('*').where('id', id).first()
  },
  deleteBookmark(knex, id) {
    return knex('bookmarks_lists')
      .where({ id })
      .delete()
  },
  updateBookmark(knex, id, newBookmarkFields) {
    return knex('bookmarks_lists')
      .where({ id })
      .update(newBookmarkFields)
  }
}

module.exports = BookmarksService