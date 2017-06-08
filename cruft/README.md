# cruft

A very simplistic optimistic locking abstraction over DynamoDB allowing the following operations on items -

* `create` - add a new item
* `read` - retrieve an item by ID
* `update` - update an item
* `find` - retrieve an item by prototype
  * `findAll` - retrieve all items matching prototype
* `truncate` - delete an item by ID

## Symbol.asyncIterator

`Symbol.asyncIterator` has been polyfilled in a hopefully safe way! 
