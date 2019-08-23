"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vuexCommitFunctionsForStore = vuexCommitFunctionsForStore;
exports.Listener = exports.Standards = exports.changeDocId = exports.unwrapFirestoreDoc = exports.queryFirestore = exports.addToFirestore = exports.setToFirestore = void 0;

require("core-js/modules/web.dom.iterable");

/********************************************************************************************/

/** Takes a query and a payload *************************************************************/

/** Removes the properties id and path from the copy of a object  and set() it to firebase  */

/********************************************************************************************/
const setToFirestore = async function setToFirestore(ref, payload) {
  let batch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  let clone = Object.assign({}, payload);
  if (clone.id) delete clone.id;
  if (clone.path) delete clone.path;

  try {
    if (batch == null) {
      await ref.set(clone);
    } else {
      batch.set(ref, payload);
    }

    clone.id = ref.id;
    clone.path = ref.path;
    return clone;
  } catch (e) {
    return Promise.reject(e);
  }
};
/***************************************************/

/** Takes a query and a payload ********************/

/** Returns the payload with the properties id and path */

/**************************************************/


exports.setToFirestore = setToFirestore;

const addToFirestore = async function addToFirestore(ref, payload) {
  let clone = Object.assign({}, payload);

  try {
    const docRef = await ref.add(clone);
    clone.id = docRef.id;
    clone.path = docRef.path;
    return clone;
  } catch (e) {
    return Promise.reject(e);
  }
};
/***************************************************/

/** Takes ref and queries it ********************/

/** Returning the JS document as a Javascript Obj */

/**************************************************/


exports.addToFirestore = addToFirestore;

const queryFirestore = async function queryFirestore(query) {
  let asObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  try {
    const snapshot = await query.get();
    return unwrapFirestoreDoc(snapshot, asObject);
  } catch (e) {
    return Promise.reject(e);
  }
};
/***************************************************/

/** Takes a Snapshot and returns the queried item */

/** adding _id and _path to the queried document  */

/**************************************************/


exports.queryFirestore = queryFirestore;

const unwrapFirestoreDoc = function unwrapFirestoreDoc(snapshot) {
  let asObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  //If it is a multi-document query
  if (snapshot.docs) {
    if (asObject) {
      // returns a Object with all items
      let items = {};

      for (const doc of snapshot.docs) {
        let item = doc.data();
        item.id = doc.id;
        item.path = doc.ref.path;
        items[item.id] = item;
      }

      return items ? items : {};
    } else {
      // returns an array of items
      let items = [];

      for (const doc of snapshot.docs) {
        let item = doc.data();
        item.id = doc.id;
        item.path = doc.ref.path;
        items.push(item);
      }

      return items ? items : [];
    }
  } //If it is a single-document query
  // returns a single item


  if (!snapshot.docs) {
    let item = snapshot.data();

    if (item) {
      item.id = snapshot.id;
      item.path = snapshot.ref.path;
    }

    return item;
  }
};
/***************************************************************************************/

/** Gets a document, copies it to a document with the new id and deletes the old one****/

/** WARNING: Do this at your own risk, only do this if you are sure what you are doing */

/***************************************************************************************/


exports.unwrapFirestoreDoc = unwrapFirestoreDoc;

const changeDocId = async function changeDocId(docRef, newKey) {
  try {
    // First get the document
    const doc = await queryFirestore(docRef); // Then save it under the new id

    const newRef = docRef.parent.doc(newKey);
    const newDoc = await setToFirestore(newRef, doc); // Then delete the old document and return the new document

    await docRef.delete();
    return newDoc;
  } catch (e) {
    return Promise.reject(e);
  }
};
/***************************************************************************************/

/** This class contains the standard C(R)UD functions for a database connection. It can be used as a object or in a static context */

/** WARNING: Do this at your own risk, only do this if you are sure what you are doing */

/***************************************************************************************/


exports.changeDocId = changeDocId;

class Standards {
  constructor(ref) {
    let asObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    this.ref = ref;
    this.name = name;
    this.asObject = asObject;
  }

  async getAll() {
    return this.constructor.getAll(this.ref, this.asObject);
  }

  async get(id) {
    return this.constructor.get(id, this.ref);
  }

  async add(data) {
    return this.constructor.add(data, this.ref);
  }

  async set(data, id) {
    return this.constructor.set(data, id, this.ref);
  }

  async delete(id) {
    return this.constructor.delete(id, this.ref);
  }

  static async getAll(ref) {
    let asObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    try {
      return await queryFirestore(ref, asObject);
    } catch (e) {
      console.error('DB error getAll() of ' + name + '\n' + e);
    }
  }

  static async get(id, ref) {
    let name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    try {
      return await queryFirestore(ref.doc(id));
    } catch (e) {
      console.error('DB error get() of ' + name + '\n' + e);
    }
  }

  static async add(data, ref) {
    let name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    try {
      return await addToFirestore(ref, data);
    } catch (e) {
      console.error('DB error add() in ' + name + '\n' + e);
    }
  }

  static async set(data, id, ref) {
    let name = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

    try {
      return await setToFirestore(ref.doc(id), data);
    } catch (e) {
      console.error('DB error set() in ' + name + '\n' + e);
    }
  }

  static async delete(id, ref) {
    let name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    try {
      return await ref.doc(id).delete();
    } catch (e) {
      console.error('DB error delete() in ' + name + '\n' + e);
    }
  }

}
/***************************************************************************************/

/** This class simplifies the workflow to set an onChangeListener of a firestore  */

/** WARNING: Do this at your own risk, only do this if you are sure what you are doing */

/***************************************************************************************/
// example


exports.Standards = Standards;

function vuexCommitFunctionsForStore(store) {
  return {
    add: (obj, storeName) => {
      store.commit(storeName + '/' + 'ADD', obj);
    },
    update: (obj, storeName) => {
      store.commit(storeName + '/' + 'UPDATE', obj);
    },
    remove: (obj, storeName) => {
      store.commit(storeName + '/' + 'REMOVE', obj);
    },
    removeAll: storeName => {
      store.commit(storeName + '/' + 'REMOVE_ALL');
    }
  };
}

class Listener {
  constructor(ref, commitFunctions) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    this.listeners = [];
    this.ref = ref;
    this.storeName = _saveGet(options.storeName, '');
    this.commitFunctions = commitFunctions;
    this.log = _saveGet(options.log, false);
    this.refFunction = _saveGet(options.refFunction, null);
  }

  async getListener() {
    let resetListener = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    if (this.listeners.length > 1 || resetListener) {
      this.detachListeners;
      console.info(this.storeName + ': To much listeners all detached');
    }

    if (this.listeners.length === 0) {
      let ref = this.ref;

      if (this.refFunction != null) {
        ref = this.refFunction(this.ref, this.options);
      }

      const listener = this.constructor.getListener(ref, this.commitFunctions, {
        storeName: this.storeName,
        log: this.log
      });

      if (listener != null) {
        this.listeners.push(listener);
      }
    }
  }

  static async getListener(ref, commitFunctions, options) {
    const storeName = _saveGet(options.storeName, '');

    const log = _saveGet(options.log, false);

    if (!commitFunctions) console.error('No commitFunctions defined');
    commitFunctions['removeAll'](storeName);

    try {
      const listener = await ref.onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
          const obj = change.doc.data();
          obj.id = change.doc.id;
          obj.path = change.doc.ref.path;

          if (change.type === 'added') {
            commitFunctions['add'](obj, storeName);
            if (log) console.info('New ' + storeName + ': ', obj);
          }

          if (change.type === 'modified') {
            commitFunctions['update'](obj, storeName);
            if (log) console.info('New ' + storeName + ': ', obj);
          }

          if (change.type === 'removed') {
            commitFunctions['remove'](obj, storeName);
            if (log) console.info('New ' + storeName + ': ', obj);
          }
        });
      });
      if (log) console.info('All ' + storeName + ' listener atached');
      return listener;
    } catch (e) {
      console.error('DB error getListener(ref, commitFunctions, options) in ' + storeName + '\n' + e);
      return null;
    }
  }

  detachListeners() {
    this.listeners.forEach(item => {
      this.constructor.detachListeners(item);
    });
    this.listeners = [];
    if (this.log) console.info('All ' + this.storeName + ' listener Detached');
  }

  static detachListeners(listener) {
    listener();
  }

}

exports.Listener = Listener;

function _saveGet(data, default_value) {
  return data ? data : default_value;
}