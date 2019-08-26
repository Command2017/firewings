# 🔥 Firewings 🔥

<p align="center"><img align="center" height="250px" src="https://github.com/lupas/firewings/blob/master/misc/logo/firewings_logo.png?raw=true"/></p>

> Give Firebase wings! - Useful helper-functions for Firebase's JS SDK.

## Requirements

Make sure you have Firebase installed in your project and Firestore initiated.

```json
"dependencies": {
  "firebase": "^5.7.2"
}
```

## Install

```bash
npm i firewings
```

## Setup

Add the below code to wherever you want to use the functions.

```js
import { queryFirestore } from 'firewings'
//or
import { unwrapFirestoreDoc } from 'firewings'
//or
import { addToFirestore } from 'firewings'
//or
import { setToFirestore } from 'firewings'
//or
import { changeDocId } from 'firewings'
//or
import { DBStandards } from 'firewings'
//or
import { ChangeListener } from 'firewings'
```

# Included Functions

## queryFirestore()

This function gets you an item, an array of items or an object of items from a Firebase query without you having to care about loops or getting the data from the snapshot. You'll just get the objects right away.

And in addition you get the documents `id` and `path` for every object, too.

**TRADITIONAL WAY**:

```js
/** 1.1 Define single-doc ref/query  */
const query = db.collection('cities').doc('cityId')

/** 1.2  Define multi-doc ref/query */
const query = db.collection('cities')

/** 2. Get Snapshot */
const snapshot = await query.get()

/** 3.1 Get data from Snapshot if single-doc query */
const city = snapshot.data()

/** 3.2 Get data from Snapshot if multiple-doc query */
let cities = []
for (const doc of snapshot.docs) {
  let city = doc.data()
  cities.push(city)
}
```

**WITH FIREWINGS**:

```js
// For single-doc queries:
const query = db.collection('cities').doc('cityId')
const city = await queryFirestore(query)
```

```js
// For multi-doc queries:
const query = db.collection('cities')
const cities = await queryFirestore(query)
```

Furthermore you can use the second argument to return the data of a multi-doc querie as an `object` instad of an `array`.

This will retun a array:

```js
// For multi-doc queries which retuns an array:
const query = db.collection('cities')
const cities = await queryFirestore(query)
// or
const cities = await queryFirestore(query, false)
```

```js
// const cities looks like
;[
  {
    id: 'A',
    path: 'cities/A'
  },
  {
    id: 'B',
    path: 'cities/B'
  },
  {
    id: 'C',
    path: 'cities/C'
  }
]
```

This will retun a object:

```js
// For multi-doc queries which retuns an object:
const query = db.collection('cities')
const cities = await queryFirestore(query, true)
```

```js
// const cities looks like
{
  A:{
    id: "A",
    path: "cities/A"
  },
  B:{
    id: "B",
    path: "cities/B"
  },
  C:{
    id: "C",
    path: "cities/C"
  },
}
```

## unwrapFirestoreDoc()

This function unwraps a Firestore snapshot of a single- or multiple-document query and returns the item(s)' data as objects. Either as an array of objects, object of objects or as a single object.

Additionally, it adds the documents `id` and `path` to every item.

**TRADITIONAL WAY**:

```js
/** For single-doc queries */
const city = snapshot.data()
city.id = snapshot.id
city.path = snapshot.ref.path
```

```js
/** For multi-doc queries */
let cities = []
for (const doc of snapshot.docs) {
  let city = doc.data()
  item.id = doc.id
  item.path = doc.ref.path
  items.push(item)
}
```

**WITH FIREWINGS**:

```js
/** For single-doc queries returns an single object*/
const city = unwrapFirestoreDoc(snapshot)
```

```js
/** For multi-doc queries returns an array of objects*/
const cities = unwrapFirestoreDoc(snapshot)
```

```js
/** For multi-doc queries returns an object of objects*/
const cities = unwrapFirestoreDoc(snapshot, true)
```

For more information about returning objects read the chaperter **queryFirestore**.

## addToFirestore()

This function takes a reference and an object as payload and adds it to Firestore. It returns the to added object including its Firebase `id` and `path`.

**TRADITIONAL WAY**:

```js
const ref = await ref.add(data)
data.id = ref.id
data.path = ref.path
return data
```

**WITH FIREWINGS**:

```js
return await addToFirestore(ref, data)
```

## setToFirestore()

This function takes a query and an object as payload and sets (updates or creates) the document in Firestore. Befrore that, the properties `id` and `path` will be removed from the object, so it won't be written to Firestore.

**TRADITIONAL WAY**:

```js
let clone = Object.assign({}, data)
let id = clone.id
delete clone.id
delete clone.path
await ref.doc(id).set(clone)
```

**WITH FIREWINGS**:

```js
await setToFirestore(ref.doc(id), data)
```

It's also possible to do batched writes.

```js
// Get a new write batch
let batch = db.batch()

// Set something
await setToFirestore(ref.doc(id), data, batch)

// Delete something
await batch.delete(ref.doc(id))

//  Set again something
await setToFirestore(ref2.doc(id), data, batch)

// Commit the batch
batch.commit().then(function() {
  // ...
})
```

## changeDocId()

This function changes the id of an existing document to a new id. It does this by creating a new document wwith the new key, and then deleting the old document.

> WARNING: Only do this, if you are sure what you are doing. The old document will be deleted, so any references might be invalid. Also make sure you have no onDelete() actions that you don't want to get triggered.

**TRADITIONAL WAY**:

```js
// First get the document
const doc = await queryFirestore(docRef)
// Then save it under the new id
const newRef = docRef.parent.doc(newKey)
const newDoc = await setToFirestore(newRef, doc)
// Then delete the old document and return the new document
await docRef.delete()
```

**WITH FIREWINGS**:

```js
await changeDocId(ref, 'newId')
```

# Included Classes

## class DBStandards

This class provides the following standard CRUD functions:

- getAll()
- get(id)
- add(data)
- set(data, id)
- delete(id)

### **TRADITIONAL WAY:**:

```js
  async getAll(ref, asObject = false) {
    try {
      return await queryFirestore(ref, asObject)
    } catch (e) {
      console.error('DB error getAll()\n' + e)
    }
  }
  async get(id, ref) {
    try {
      return await queryFirestore(ref.doc(id))
    } catch (e) {
      console.error('DB error get()\n' + e)
    }
  }
  async add(data, ref) {
    try {
      return await addToFirestore(ref, data)
    } catch (e) {
      console.error('DB error add()\n' + e)
    }
  }
  async set(data, id, ref) {
    try {
      return await setToFirestore(ref.doc(id), data)
    } catch (e) {
      console.error('DB error set()\n' + e)
    }
```

### **WITH FIREWINGS:**

You can use just the static functions and provide a reference or you can create a class object and save the following settings there:

```js
export class DBStandards {
  constructor(ref, asObject = false, name = '', log = LOG.error) {
    this.ref = ref
    this.name = name
    this.asObject = asObject
    this.log = log
  }
  //...
}
```

**If you use the static functions:**

```js
// First import the class
import { DBStandards, LOG } from 'firewings'
DBStandards.getAll(ref, asObject, name, LOG.silent)
DBStandards.get(id, ref, name, LOG.error)
DBStandards.add(data, ref, name, LOG.info)
DBStandards.set(data, id, ref, name, LOG.info)
DBStandards.delete(id, ref, name, LOG.info)
```

**If you use the the class object:**

```js
// First import the class
import { DBStandards, LOG } from 'firewings'
const log = LOG.info
const db = new DBStandards(ref, asObject, name, log)

db.getAll()
db.get(id)
db.add(data)
db.set(data, id)
db.delete(id)
```

### **Settings / Parameter**

- ref : firestore reference
  - Reference to the firestore collection.
- asObject : boolean
  - If false the data will be returned as a array list.
  - If true it will be returned as one object which contains the data objects
- name : string
  - The name of the Function will be used to address/name the error masseges. It helps to find problems faster.
- data : object
  - Data you want to set or add to firestore
- id : string
  - The id of the object you want to manupulate.
- log : LOG object
  - If `LOG.silent` nothing will be logged.
  - If `LOG.error` just the errors will be logged
  - If `LOG.info` all events well be logged

---

## class ChangeListener

This class simplifies the usage of a firestore changeListener. With just a few settings it is now possible to add a changeListener to any collection.

### **TRADITIONAL WAY:**:

```js
  async getChangeListener(ref) {
    try {
      const listener = await ref.onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
          const obj = change.doc.data()
          obj.id = change.doc.id
          obj.path = change.doc.ref.path

          if (change.type === 'added') {
            // do something
          }
          if (change.type === 'modified') {
            // do something
          }
          if (change.type === 'removed') {
            // do something
          }
        })
      })
      return listener
    } catch (e) {
      console.error(
        'DB error getChangeListener()\n' + e
      )
      return null
    }
  }
```

### **WITH FIREWINGS:**

```js
// First import the class
import { ChangeListener, objectCommitFunctions, LOG } from 'firewings'

let object = {}
// prvide the object which schould be altered
const commitfunctions = objectCommitFunctions(object)

// prvice the reference, the commitfunctions and some options (optional)
const listenerObj = new ChangeListener(ref, commitFunctions, {
  name: name,
  log: LOG.info
})

// The first parameter is just uesed if you have a non static refernece. Otherwise it schould be {}, undefined or null. See the following chapters for more information.
// resetListener true or false -> see chapter Settings / Parameter
const listener = listenerObj.getListener({}, resetListener)
listener.detachListener()
```

### commitFunctions : object

If the listener register some changes a, depending on the event, commitFunction is called. There it is posible to decide what happens with the data. So befor you can use any ChangeListener you have to create the commitFunctions. For example:

```js
const array = []
const commitFunctions{
  add: obj => {
    array.push(obj)
  },
  update: obj => {
    // pseudo code following ->
    array.update(obj)
  },
  remove: obj => {
    // pseudo code following ->
    array.remove(obj)
  },
  removeAll: () => {
    array = []
  }
}
```

To simplfy this process too, some pre defined functions are provided:

**objectCommitFunctions**

```js
import { objectCommitFunctions } from 'firewings'
let object = {}
const commitfunctions = objectCommitFunctions(object)
```

> Not tested jet

**arrayCommitFunctions**

```js
import { arrayCommitFunctions } from 'firewings'
let array = []
const commitfunctions = arrayCommitFunctions(array)
```

> Not tested jet

**vuexCommitFunctionsForStore**

If you use vuex store you can use the prepared `vuexCommitFunctionsForStore` function.

If you use the standart store mutations:

- mutations names of the vuex store:

  - 'ADD',
  - 'UPDATE'
  - 'REMOVE'
  - 'REMOVE_ALL'

  ```js
  import { vuexCommitFunctionsForStore } from 'firewings'
  import store from '@store/store'
  const commitfunctions = vuexCommitFunctionsForStore(() => store, storeName)
  ```

If you want to use your own nameing:

```js
import { vuexCommitFunctionsForStore } from 'firewings'
import store from '@store/store'

const commitfunctions = vuexCommitFunctionsForStore(
  () => store,
  storeName,
  'ADD_SOMETHING',
  'UPDATE_SOMETHING',
  'DELETE_SOMETHING',
  'DELETE_ALL'
)
```

### **ChangeListener**

You can use just the static functions of the class and provide a reference or you can create a class object and save the following settings there:

```js
export class ChangeListener {
  constructor(ref, commitFunctions, options = {}) {
    this.listeners = []
    this.ref = ref
    this.name = _saveGet(options.name, '')
    this.commitFunctions = commitFunctions
    this.log = _saveGet(options.log, LOG.error)
    this.refFunction = _saveGet(options.refFunction, null)
  }
  //... more code
}
```

**If you use the static functions:**

```js
// First import the class
import { ChangeListener, LOG } from 'firewings'
const listener = ChangeListener.getListener(ref, commitFunctions, {
  name: name,
  log: LOG.info
})
ChangeListener.detachListener(listener)
```

**If you use the the class object with static ref:**

```js
// First import the class
import { ChangeListener, LOG } from 'firewings'
const listenerObj = new ChangeListener(ref, commitFunctions, {
  name: name,
  log: LOG.info
})
// resetListener true or false -> see chapter Settings / Parameter
const listener = listenerObj.getListener({}, resetListener)
listener.detachListener()
```

**If you use the the class object with non static ref:**

```js
// First import the class
import { ChangeListener } from 'firewings'

// provide a refFunction
function refFunction(ref, options) {
  const customer_id = opt.customer_id
  return ref.where('customer_id', '==', customer_id)
}

// create the class object
const listenerObj = new ChangeListener(ref, commitFunctions, {
  name: name,
  log: 'LOG.info,
  refFunction: refFunction
})

// provide the parameter you will need in the refFunction
// resetListener true or false -> see chapter Settings / Parameter
const options = {}
const listener = listenerObj.getListener({ customer_id: 10 }, resetListener)
listener.detachListener()
```

### **Settings / Parameter**

- ref : firestore reference
  - Reference to the firestore collection.
- log : LOG object
  - If `LOG.silent` nothing will be logged.
  - If `LOG.error` just the errors will be logged
  - If `LOG.info` all added, removed, updated events well be logged
- name : string
  - The name of the Class will be used to address/name all the masseges. It helps to find problems faster.
- refFunction : function
  - With this function it is possible to alter the Firestore Reference after it was set in the class object.

# Disclaimer

These are just some quick functions I personally used in different Firebase projects to save some repeating lines of code. Since I used that in every project, I decided to build a node module out of it to easily manage it.
