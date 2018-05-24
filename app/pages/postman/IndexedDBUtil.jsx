const DB_NAME = 'HistoryDB'
const STORE_NAME = 'history';

class IndexDBUtil {

  constructor() {
    this.indexedDB = null;
    this.dbVersion = 1;
  }

  init() {
    this.indexedDB = window.indexedDB || window.msIndexedDB || window.mozIndexedDB || window.webkitIndexedDB;
  }

  createObjectStore(callback) {
    const request = this.indexedDB.open(DB_NAME, this.dbVersion);
    request.onupgradeneeded = function (e) {
      const db = request.result;
      //如果不存在则重新创建
      if(!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {keyPath: "id"});
      }
    }
    request.onsuccess = function (e) {
      request.result.close();
      callback(e);
    }
  }

  open() {
    this.init();
    if (this.hasIndexedDB()) {
      this.createObjectStore();
    }
  }


  /**
   * 添加
   * @param data
   * @param callback
   */
  add(data, callback) {
    const request = this.indexedDB.open(DB_NAME, this.dbVersion);
    request.onsuccess = function (e) {
      const db = request.result;
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const storeRequest = objectStore.add(data);
      db.close();
      storeRequest.onsuccess = function (e) {
        callback(e);
      }
    }
  }

  /**
   * 通过关键字查找数据
   * @param keyword
   * @param callback
   */
  getData(keyword, callback) {
    const request = this.indexedDB.open(DB_NAME, this.dbVersion);
    let result = [];
    request.onsuccess = function(e) {
      const db = e.target.result;
      const objectStore = db.transaction(STORE_NAME).objectStore(STORE_NAME);
      objectStore.openCursor().onsuccess = function (e) {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.url.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
            result.push(cursor.value);
          }
          cursor.continue();
        } else {
          //No more entries!
        }
        callback(result);
      }
    }
  }


  /**
   * 获取指定存储对象的所有数据
   * @param callback
   */
  getAll(callback) {
    const request = this.indexedDB.open(DB_NAME, this.dbVersion);
    let result = [];
    request.onsuccess = function(e) {
      const db = e.target.result;
      const objectStore = db.transaction(STORE_NAME).objectStore(STORE_NAME);
      objectStore.openCursor().onsuccess = function (e) {
        const cursor = event.target.result;
        if (cursor) {
          result.push(cursor.value);
          cursor.continue();
        }
        callback(result);
      }
    }
  }

  /**
   * 删除指定id的数据
   * @param id
   * @param callback
   */
  deleteById(id, callback) {
    const request = this.indexedDB.open(DB_NAME, this.dbVersion);
    request.onsuccess = function(e) {
      const db = e.target.result;
      db.transaction([STORE_NAME], 'readwrite').objectStore(STORE_NAME).delete(id);
      callback();
    }
  }

  /**
   * 删除数据库
   */
  deleteDB() {
    this.indexedDB.deleteDatabase(DB_NAME);
  }

  hasIndexedDB() {
    if (!this.indexedDB) {
      alert("Don't support IndexedDB");
      return false;
    }
    return true;
  }


}

export default new IndexDBUtil();