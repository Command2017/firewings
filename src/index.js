/********************************************************************************************/
/** Takes a query and a payload *************************************************************/
/** Removes the properties id and path from the copy of a object  and set() it to firebase  */
/********************************************************************************************/

export const setToFirestore = async function(ref, payload, batch = null) {
  let clone = Object.assign({}, payload)
  if (clone.id) delete clone.id
  if (clone.path) delete clone.path

  try {
    if (batch == null) {
      await ref.set(clone)
    } else {
      batch.set(ref, payload)
    }
    clone.id = ref.id
    clone.path = ref.path
    return clone
  } catch (e) {
    return Promise.reject(e)
  }
}

/***************************************************/
/** Takes a query and a payload ********************/
/** Returns the payload with the properties id and path */
/**************************************************/

export const addToFirestore = async function(ref, payload) {
  let clone = Object.assign({}, payload)
  try {
    const docRef = await ref.add(clone)
    clone.id = docRef.id
    clone.path = docRef.path
    return clone
  } catch (e) {
    return Promise.reject(e)
  }
}

/***************************************************/
/** Takes ref and queries it ********************/
/** Returning the JS document as a Javascript Obj */
/**************************************************/

export const queryFirestore = async function(query, asObject = false) {
  try {
    const snapshot = await query.get()
    return unwrapFirestoreDoc(snapshot, asObject)
  } catch (e) {
    return Promise.reject(e)
  }
}

/***************************************************/
/** Takes a Snapshot and returns the queried item */
/** adding _id and _path to the queried document  */
/**************************************************/
export const unwrapFirestoreDoc = function(snapshot, asObject = false) {
  //If it is a multi-document query

  if (snapshot.docs) {
    if (asObject) {
      // returns a Object with all items
      let items = {}
      for (const doc of snapshot.docs) {
        let item = doc.data()
        item.id = doc.id
        item.path = doc.ref.path
        items[item.id] = item
      }
      return items ? items : {}
    } else {
      // returns an array of items
      let items = []
      for (const doc of snapshot.docs) {
        let item = doc.data()
        item.id = doc.id
        item.path = doc.ref.path
        items.push(item)
      }
      return items ? items : []
    }
  }

  //If it is a single-document query
  // returns a single item
  if (!snapshot.docs) {
    let item = snapshot.data()
    if (item) {
      item.id = snapshot.id
      item.path = snapshot.ref.path
    }
    return item
  }
}

/***************************************************************************************/
/** Gets a document, copies it to a document with the new id and deletes the old one****/
/** WARNING: Do this at your own risk, only do this if you are sure what you are doing */
/***************************************************************************************/

export const changeDocId = async function(docRef, newKey) {
  try {
    // First get the document
    const doc = await queryFirestore(docRef)
    // Then save it under the new id
    const newRef = docRef.parent.doc(newKey)
    const newDoc = await setToFirestore(newRef, doc)
    // Then delete the old document and return the new document
    await docRef.delete()
    return newDoc
  } catch (e) {
    return Promise.reject(e)
  }
}

/***************************************************************************************/
/** This class contains the standard C(R)UD functions for a database connection. It can be used as a object or in a static context */
/** WARNING: Do this at your own risk, only do this if you are sure what you are doing */
/***************************************************************************************/
export const LOG = {
  info: 2,
  error: 1,
  silent: 0
}
export class DBStandards {
  constructor(ref, asObject = false, name = '', log = LOG.error) {
    this.ref = ref
    this.name = name
    this.asObject = asObject
    this.log = log
  }

  async getAll() {
    return this.constructor.getAll(this.ref, this.asObject, this.name, this.log)
  }
  async get(id) {
    return this.constructor.get(id, this.ref, this.name, this.log)
  }
  async add(data) {
    return this.constructor.add(data, this.ref, this.name, this.log)
  }
  async set(data, id) {
    return this.constructor.set(data, id, this.ref, this.name, this.log)
  }

  async delete(id) {
    return this.constructor.delete(id, this.ref, this.name, this.log)
  }

  static async getAll(ref, asObject = false, name = '', log = LOG.error) {
    try {
      const data = await queryFirestore(ref, asObject)
      if (log >= LOG.info) console.info('Get objects from DB: ' + data)
      return data
    } catch (e) {
      if (log >= LOG.error)
        console.error('DB error getAll() of ' + name + '\n' + e)
    }
  }
  static async get(id, ref, name = '', log = LOG.error) {
    try {
      const data = await queryFirestore(ref.doc(id))
      if (log >= LOG.info) console.info('Get object from DB: ' + data)
      return data
    } catch (e) {
      if (log >= LOG.error)
        console.error('DB error get() of ' + name + '\n' + e)
    }
  }
  static async add(data, ref, name = '', log = LOG.error) {
    try {
      if (log >= LOG.info) console.info('Add object to DB: ' + data)
      return await addToFirestore(ref, data)
    } catch (e) {
      if (log >= LOG.error)
        console.error('DB error add() in ' + name + '\n' + e)
    }
  }
  static async set(data, id, ref, name = '', log = LOG.error) {
    try {
      if (log >= LOG.info) console.info('Set object to DB: ' + data)
      return await setToFirestore(ref.doc(id), data)
    } catch (e) {
      if (log >= LOG.error)
        console.error('DB error set() in ' + name + '\n' + e)
    }
  }

  static async delete(id, ref, name = '', log = LOG.error) {
    try {
      if (log >= LOG.info) console.info('Delete object from DB with id: ' + id)
      return await ref.doc(id).delete()
    } catch (e) {
      if (log >= LOG.error)
        console.error('DB error delete() in ' + name + '\n' + e)
    }
  }
}

/***************************************************************************************/
/** This class simplifies the workflow to set an onChangeListener of a firestore  */
/** WARNING: Do this at your own risk, only do this if you are sure what you are doing */
/***************************************************************************************/

// example

export function objectCommitFunctions(data) {
  return {
    add: obj => {
      data[obj.id] = obj
    },
    update: obj => {
      data[obj.id] = obj
    },

    remove: obj => {
      delete data[obj.id]
    },
    removeAll: () => {
      data = {}
    }
  }
}

export function arrayCommitFunctions(array) {
  return {
    add: obj => {
      array.push(obj)
    },
    update: obj => {
      for (var i in array) {
        if (array[i].id == obj.id) {
          array[i] = obj
          break
        }
      }
    },

    remove: obj => {
      for (var i in array) {
        if (array[i].id == obj.id) {
          array.splice(i, 1)
          break
        }
      }
    },
    removeAll: () => {
      array = []
    }
  }
}

export function vuexCommitFunctionsForStore(
  storeObj,
  storeName,
  add = 'ADD',
  update = 'UPDATE',
  remove = 'REMOVE',
  removeAll = 'REMOVE_ALL'
) {
  return {
    add: obj => {
      storeObj().commit(storeName + '/' + add, obj)
    },
    update: obj => {
      storeObj().commit(storeName + '/' + update, obj)
    },
    remove: obj => {
      storeObj().commit(storeName + '/' + remove, obj)
    },
    removeAll: () => {
      storeObj().commit(storeName + '/' + removeAll)
    }
  }
}

export class Listener {
  constructor(ref, commitFunctions, options = {}) {
    this.listeners = []
    this.ref = ref
    this.name = _saveGet(options.name, '')
    this.commitFunctions = commitFunctions
    this.log = _saveGet(options.log, LOG.error)
    this.refFunction = _saveGet(options.refFunction, null)
  }
  async getListener(options = {}, resetListener = false) {
    if (options == null) {
      options = {}
    }
    if (this.listeners.length > 1 || resetListener) {
      this.detachListener()
      if (!resetListener)
        if (this.log >= LOG.info)
          console.info(this.name + ': To much listeners all detached')
    }

    if (this.listeners.length === 0) {
      let ref = this.ref
      if (this.refFunction != null) {
        ref = this.refFunction(this.ref, options)
      }

      options.name = this.name
      options.log = this.log
      try {
        const listener = await this.constructor.getListener(
          ref,
          this.commitFunctions,
          options
        )

        if (listener != null) {
          this.listeners.push(listener)
          return listener
        }
      } catch (e) {
        if (this.log >= LOG.error) console.error(e)
        return null
      }
    } else {
      return this.listeners[0]
    }
  }

  static async getListener(ref, commitFunctions, options) {
    const name = _saveGet(options.name, '')
    const log = _saveGet(options.log, LOG.error)

    if (!commitFunctions) throw new Error('No commitFunctions defined')

    commitFunctions['removeAll']()

    try {
      const listener = await ref.onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
          const obj = change.doc.data()
          obj.id = change.doc.id
          obj.path = change.doc.ref.path

          if (change.type === 'added') {
            commitFunctions['add'](obj)

            if (log >= LOG.info) console.info('New ' + name + ': ', obj)
          }
          if (change.type === 'modified') {
            commitFunctions['update'](obj)
            if (log >= LOG.info) console.info('New ' + name + ': ', obj)
          }
          if (change.type === 'removed') {
            commitFunctions['remove'](obj)
            if (log >= LOG.info) console.info('New ' + name + ': ', obj)
          }
        })
      })
      if (log >= LOG.info) console.info('All ' + name + ' listener atached')
      return listener
    } catch (e) {
      if (log >= LOG.error)
        console.error(
          'DB error getListener(ref, commitFunctions, options) in ' +
            name +
            '\n' +
            e
        )
      return null
    }
  }

  detachListener() {
    this.listeners.forEach(item => {
      this.constructor.detachListener(item)
    })
    this.listeners = []

    if (this.log >= LOG.info)
      console.info('All ' + this.name + ' listener Detached')
  }

  static detachListener(listener) {
    listener()
  }
}

function _saveGet(data, default_value) {
  return data ? data : default_value
}
