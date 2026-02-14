const DB_NAME = "IronVaultEliteDB";
const DB_VERSION = 2;
let db;

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = function(event) {
  db = event.target.result;

  ["programs","days","exercises","sets","metrics"].forEach(storeName => {
    if(!db.objectStoreNames.contains(storeName)){
      db.createObjectStore(storeName, { keyPath: "id", autoIncrement:true });
    }
  });
};

request.onsuccess = e => db = e.target.result;
request.onerror = e => console.error("DB Error", e.target.error);

// Helper to generalize CRUD
function addItem(storeName, item, callback){
  const tx = db.transaction(storeName,"readwrite");
  const store = tx.objectStore(storeName);
  const req = store.add(item);
  req.onsuccess = () => callback && callback(req.result);
}

function getAllItems(storeName, callback){
  const tx = db.transaction(storeName,"readonly");
  const store = tx.objectStore(storeName);
  const req = store.getAll();
  req.onsuccess = () => callback && callback(req.result);
}

function updateItem(storeName, item, callback){
  const tx = db.transaction(storeName,"readwrite");
  const store = tx.objectStore(storeName);
  const req = store.put(item);
  req.onsuccess = () => callback && callback();
}

function deleteItem(storeName, id, callback){
  const tx = db.transaction(storeName,"readwrite");
  const store = tx.objectStore(storeName);
  const req = store.delete(id);
  req.onsuccess = () => callback && callback();
}

// Specific helpers
function getLastMetric(callback){
  getAllItems("metrics", arr => callback(arr.length ? arr[arr.length-1] : null));
}
