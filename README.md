# Better-localStorage
Better-localStorage is a lightweight NPM package that provides a simple and efficient alternative to the native localStorage API using indexedDB. This package offers several benefits over the native localStorage API, including the ability to store larger amounts of data, asynchronous and non-blocking operations, on-demand loading, and support for storing JavaScript object data. With Better-localStorage, you can enhance the storage capabilities of your web applications while maintaining optimal performance.


# Key Features
-   Asynchronous and non-blocking operations.
-   Support for storing large amounts of data.
-   Compatibility with various data types supported by indexedDB. Including array and object
-   Lightweight package (10kb uncompressed, unminified).
-   Compatibility with modern web browsers.
-   Event listeners
-   Zero dependency

# Installation
```shell
npm install better-localstorage
```

# Usage
## Importing the Package
To use Better-localStorage in your JavaScript code, you need to import the package:
```js
const MyLocalStorage = require('better-localstorage');
```

## Initializing the API
Start of by creating an instance of your better-localStorage API
```js
const myStorage = new MyLocalStorage();
```

You can also specify the optional database name and table name
```js
const myOtherStorage = new SimpleDB("myDB", "myTable");
```


## Storing a Value
To store a value in the database, you can use either the `set()` or `setItem()` method:

```js
await myStorage.set("someKey", { "someObject": "with the value" });
```

## Retrieving a Value
To retrieve a value from the database, you can use either the `get()` or `getItem()` method:

```js
const value = await myStorage.get("someKey");
console.log(value);
```


## Deleting a Value
To delete a value from the database, you can use either the `delete()` or `removeItem()` method:
```js
await myStorage.delete("someKey");
```

# Methods
The Better-localStorage package provides a set of methods that offer enhanced functionality compared to the native localStorage API. Here's a detailed explanation of each available method:

### `set(key, value)` (alias: `setItem(key, value)`)

The `set()` method allows you to store a value in the local database. It takes a `key` as a string and a `value` that can be of any type supported by indexedDB. This method asynchronously sets the provided key-value pair in the database.

**Example:**
```js
await myStorage.set("key", "value");
// Value successfully stored in the database
```

### `get(key)` (alias: `getItem(key)`)

The `get()` method retrieves the value associated with a given key from the local database. It takes a `key` as a string and returns the corresponding value. If the key doesn't exist in the database, it returns `undefined`.

**Example:**
```js
const value = await myStorage.get("key");
// Value retrieved from the database
``` 

### `getAll()`

Get all record into a key-value pair object

**Example:**
```js
console.log(await myStorage.getAll());
``` 

### `delete(key)` (alias: `removeItem(key)`)

The `delete()` method removes a key-value pair from the local database based on the provided key.

**Example:**
```js
await myStorage.delete("key");
// Key-value pair successfully deleted from the database
``` 

### `clear()`

The `clear()` method clears the entire local database, removing all stored key-value pairs.

**Example:**
```js
await myStorage.clear();
// Local database successfully cleared
``` 

### `drop()`
Removes the current database.

### `on(eventName, callback)`

The `on()` method allows you to add an event listener for a specific event. It takes an `eventName` as a string and a `callback` function to be executed when the event is triggered. Multiple event listeners can be registered for the same event.

**Example:**
```js
myStorage.on("beforeSet", (key, value) => {
  // Event listener callback function
});
``` 

### `one(eventName, callback)`

The `one()` method is similar to `on()`, but it adds a one-time event listener. The event listener is automatically removed after being triggered once.

**Example:**
```js
myStorage.one("beforeSet", (key, value) => {
  // Event listener callback function
});
``` 

### `off(eventName)`

The `off()` method removes one or all event listeners associated with a specific event. It takes the `eventName` as a string and removes the corresponding event listener(s).

**Example:**
```js
myStorage.off("beforeSet");
// Removes all event listeners for "beforeSet" event
``` 

# Events

Better-localStorage provides event listeners for various events. You can use the `on()`, `one()`, and `off()` methods to manage the event listeners:
```js
// Adding an event listener
myStorage.on("change", (key, newValue, oldValue) => {
  console.log(`Value changed for key '${key}': ${oldValue} -> ${newValue}`);
});

// Removing an event listener
myStorage.off("change");
```

## Event list
|Event Name|Description|Callback Function Arguments|
|--- |--- |--- |
|beforeSet|Triggered before a value is set in the local database.|`key` (String): The key of the key-value pair being set.<br /><br />`value` (any): The new value being set.|
|change|Triggered when a value in the local database is changed.|`key` (String): The key of the key-value pair that changed.<br /><br />`newValue` (any): The new value after the change.<br /><br />`oldValue` (any): The previous value before the change.|
|set|Triggered after a value is successfully set in the database.|`key` (String): The key of the key-value pair that was set.<br /><br />`value` (any): The value that was successfully set.|
|beforeDelete|Triggered before a value is deleted from the local database.|`key` (String): The key of the key-value pair being deleted.|
|delete|Triggered after a value is successfully deleted from the database.|`key` (String): The key of the key-value pair that was deleted.|
|beforeClear|Triggered before the local database is cleared.|-|
|clear|Triggered after the local database is successfully cleared.|-|


## Event with Namespace
Better-localStorage package supports namespaced events, which function similarly to jQuery's event system. With a namespaced events, you can add and remove event listeners that are specific to a particular namespace, without affecting other listeners bound to the same event type.


```js
const SimpleDB = require('better-localstorage');

const myStorage = new SimpleDB();

// Adding a namespaced event listener
myStorage.on("beforeSet.scope1", (key, value) => {
  console.log(`Before set event in scope1: ${key} - ${value}`);
});

// Adding another namespaced event listener
myStorage.on("beforeSet.scope2", (key, value) => {
  console.log(`Before set event in scope2: ${key} - ${value}`);
});

// Triggering the event
myStorage.set("someKey", "someValue");
// prints:
// Before set event in scope1: someKey - someValue
// Before set event in scope2: someKey - someValue

// Removing a specific namespaced event listener
myStorage.off("beforeSet.scope1");

// Triggering the event again
myStorage.set("anotherKey", "anotherValue");
// prints:
// Before set event in scope2: anotherKey - anotherValue

```
In this example, we add two namespaced event listeners for the "beforeSet" event: one in the "scope1" namespace and another in the "scope2" namespace. When the `set()` method is called, both event listeners will be triggered and their respective messages will be logged to the console.

After that, we remove the namespaced event listener in the "scope1" namespace using the `off()` method. Now, when we call the `set()` method again, only the event listener in the "scope2" namespace will be triggered, and its corresponding message will be logged to the console.

By using namespaced event listeners, you can selectively add and remove event handlers without affecting other listeners bound to the same event type.