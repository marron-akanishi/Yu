// TOKIMEKI固有の定数
const ACCOUNT_DB_NAME = 'accountDatabase';
const BOOKMARK_DB_NAME = 'bookmarkDatabase';
const THEME_DB_NAME = 'themeDatabase';
const BUTTON_CLASS = 'side-bar-button svelte-oetxd8' // TODO: 使われているボタンから自動取得したい

// chorme.storage.syncに保存する際に利用する定数
const LOCAL_STORAGE_PREFIX = 'LS_';
const DB_LIST = [ACCOUNT_DB_NAME, BOOKMARK_DB_NAME, THEME_DB_NAME];
const DB_PREFIX = 'IDB_';
const DB_VERSION_PREFIX = 'DB_VERSION_';
const UPLOADED_AT_KEY = 'uploadedAt';

// ボタンに使用するクラス名
const ICON_CLASS = 'yu-button-icon';
const LOADING_CLASS = 'yu-loading';

const backupButtonHtml = `
<button id="Yu-Backup" class="${BUTTON_CLASS}" title="設定をバックアップする">
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" class="${ICON_CLASS}" viewBox="-1 -1 18 18" stroke="var(--bar-bottom-icon-color)" stroke-width="0.5" fill="var(--bar-bottom-icon-color)">
    <path fill-rule="evenodd" d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z"></path>
    <path fill-rule="evenodd" d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z"></path>
  </svg>
  <svg class="${LOADING_CLASS}" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="var(--bar-bottom-icon-color)" stroke="var(--bar-bottom-icon-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z">
        <animateTransform attributeName="transform" type="rotate" dur="0.6s" values="0 12 12;360 12 12" repeatCount="indefinite"></animateTransform>
    </path>
  </svg>
</button>
`;

const restoreButtonHtml = `
<button id="Yu-Restore" class="${BUTTON_CLASS}" title="設定をリストアする">
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="var(--bar-bottom-icon-color)" class="${ICON_CLASS}" viewBox="-1 -1 18 18" stroke="var(--bar-bottom-icon-color)" stroke-width="0.5">
    <path d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z"></path>
    <path d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708l3 3z"></path>
  </svg>
  <svg class="${LOADING_CLASS}" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="var(--bar-bottom-icon-color)" stroke="var(--bar-bottom-icon-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z">
      <animateTransform attributeName="transform" type="rotate" dur="0.6s" values="0 12 12;360 12 12" repeatCount="indefinite"></animateTransform>
    </path>
  </svg>
</button>
`;

// --- ユーティリティ関数群 Start

/**
 * IndexedDBに接続
 */
function connectIDB(dbname) {
  const dbp = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(dbname);
    req.onsuccess = ev => resolve(ev.target.result);
    req.onerror = ev => reject('fails to open db');
  });
  return dbp;
}

/**
 * DBをJSONにダンプ
 */
function exportToJson(idbDatabase) {
  return new Promise((resolve, reject) => {
    const exportObject = {}
    if (idbDatabase.objectStoreNames.length === 0) {
      resolve(JSON.stringify(exportObject))
    } else {
      const transaction = idbDatabase.transaction(
        idbDatabase.objectStoreNames,
        'readonly'
      )

      transaction.addEventListener('error', reject)

      for (const storeName of idbDatabase.objectStoreNames) {
        const allObjects = []
        transaction
          .objectStore(storeName)
          .openCursor()
          .addEventListener('success', event => {
            const cursor = event.target.result
            if (cursor) {
              // Cursor holds value, put it into store data
              allObjects.push(cursor.value)
              cursor.continue()
            } else {
              // No more values, store is done
              exportObject[storeName] = allObjects

              // Last store was handled
              if (
                idbDatabase.objectStoreNames.length ===
                Object.keys(exportObject).length
              ) {
                resolve(JSON.stringify(exportObject))
              }
            }
          })
      }
    }
  })
}

/**
 * JSONからDBを復元
 */
function importFromJson(idbDatabase, json) {
  return new Promise((resolve, reject) => {
    const transaction = idbDatabase.transaction(
      idbDatabase.objectStoreNames,
      'readwrite'
    )
    transaction.addEventListener('error', reject)

    var importObject = JSON.parse(json)
    for (const storeName of idbDatabase.objectStoreNames) {
      let count = 0
      for (const toAdd of importObject[storeName]) {
        const request = transaction.objectStore(storeName).add(toAdd)
        request.addEventListener('success', () => {
          count++
          if (count === importObject[storeName].length) {
            // Added all objects for this store
            delete importObject[storeName]
            if (Object.keys(importObject).length === 0) {
              // Added all object stores
              resolve()
            }
          }
        })
      }
    }
  })
}

/**
 * DBを削除
 */
function clearDatabase(idbDatabase) {
  return new Promise((resolve, reject) => {
    const transaction = idbDatabase.transaction(
      idbDatabase.objectStoreNames,
      'readwrite'
    )
    transaction.addEventListener('error', reject)

    let count = 0
    for (const storeName of idbDatabase.objectStoreNames) {
      transaction
        .objectStore(storeName)
        .clear()
        .addEventListener('success', () => {
          count++
          if (count === idbDatabase.objectStoreNames.length) {
            // Cleared all object stores
            resolve()
          }
        })
    }
  })
}

/**
 * gzip圧縮
 */
async function gzip(data) {
	const readableStream = new Blob([data]).stream();
	const compressedStream = readableStream.pipeThrough(
        // メモ: 毎回インスタンス化する必要がある
        new CompressionStream('gzip'),
    );
	const arrayBuffer = await new Response(compressedStream).arrayBuffer();
	return arrayBuffer;
}

/**
 * gzip展開
 */
async function ungzip(data) {
	const readableStream = new Blob([data]).stream();
	const decompressedStream = readableStream.pipeThrough(
        // メモ: 毎回インスタンス化する必要がある
        new DecompressionStream('gzip'),
    );
	const arrayBuffer = await new Response(decompressedStream).arrayBuffer();
	return arrayBuffer;
}

/**
 * uint8ArrayをBinaryStringに変換
 */
function decodeBinaryString(uint8Array) {
  return uint8Array.reduce(
    (binaryString, uint8) => binaryString + String.fromCharCode(uint8),
    '',
  );
}

/**
 * BinaryStringをuint8Arrayに変換
 */
function encodeBinaryString(binaryString) {
  return Uint8Array.from(
	  binaryString,
	  binaryChar => binaryChar.charCodeAt(0),
  );
}

/**
 * HTML文字列からElementを生成
 */
function createElementFromHTML(html) {
  const tempEl = document.createElement('div');
  tempEl.innerHTML = html;
  return tempEl.firstElementChild;
}

/**
 * 現在日時をyyyy/MM/dd HH:mmで取得
 */
function getNowDateTime() {
  const now = new Date();
  return new Intl.DateTimeFormat('jp', options = {
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit',
  }).format(now);
}

/**
 * 指定msだけ処理を止める
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * ローディング表示を切り替える
 */
function toggleLoading(element, isLoading) {
  const icon = element.querySelector(`.${ICON_CLASS}`);
  const loading = element.querySelector(`.${LOADING_CLASS}`);
  icon.style.display = isLoading ? 'none' : 'block';
  loading.style.display = isLoading ? 'block' : 'none';
}

/**
 * テキストをgzip圧縮してBase64に変換
 */
async function compressText(text) {
  return btoa(decodeBinaryString(new Uint8Array(await gzip(text))));
}

/**
 * gzip圧縮されたBase64をテキストに復元
 */
async function decompressText(base64) {
  return new TextDecoder().decode(await ungzip(encodeBinaryString(atob(base64)).buffer));
}

/**
 * テキストのバイトサイズを計測
 */
function getTextByteSize(text) {
  return new Blob([text]).size;
}

// --- ユーティリティ関数群 End

async function backup(e) {
  if (!confirm('設定をバックアップします')) return;

  const target = e.currentTarget;
  toggleLoading(target, true);

  // LocalStorageの内容を取得
  // LocalStorageのキーごとにBase64化
  // - Base64化したそれぞれのサイズを取得しておく
  const ls = {};
  const lsPromises = Object.keys(localStorage).map((key) => {
    return (async () => {
      const value = localStorage[key];
      const base64 = await compressText(value);
      ls[key] = {
        name: `${LOCAL_STORAGE_PREFIX}${key}`,
        value: base64,
        size: getTextByteSize(base64),
      }
    })();
  });
  await Promise.all(lsPromises);

  // IndexedDBの内容を取得（3種類）
  // IndexedDBのDBごとにBase64化
  // - Base64化したそれぞれのサイズを取得しておく
  // - それぞれのDBのバージョンを取得しておく
  const db = {};
  const dbPromises = DB_LIST.map((dbName) => {
    return (async () => {
      const idb = await connectIDB(dbName);
      const version = idb.version;
      const json = await exportToJson(idb);
      const base64 = await compressText(json);
      db[dbName] = {
        versionName: `${DB_VERSION_PREFIX}${dbName}`,
        version,
        name: `${DB_PREFIX}${dbName}`,
        value: base64,
        size: getTextByteSize(base64),
      }
    })();
  });
  await Promise.all(dbPromises);

  console.debug('LocalStorage', ls);
  console.debug('IndexedDB', db);

  // 各Base64化した結果がchrome.storage.sync.QUOTA_BYTES_PER_ITEMを超えていないか確認
  // Base64化した結果の合計がchrome.storage.sync.QUOTA_BYTESを超えていないか確認
  const overSizeLs = Object.keys(ls).filter((key) => (ls[key].size > chrome.storage.sync.QUOTA_BYTES_PER_ITEM));
  const overSizeDb = Object.keys(db).filter((key) => (db[key].size > chrome.storage.sync.QUOTA_BYTES_PER_ITEM));
  const totalSize =
    Object.keys(ls).map((key) => (ls[key].size)).reduce((pv, cv) => (pv + cv))
    + Object.keys(db).map((key) => (db[key].size)).reduce((pv, cv) => (pv + cv));
  if (overSizeLs.length > 0 || overSizeDb.length > 0 || totalSize > chrome.storage.sync.QUOTA_BYTES) {
    alert('設定内容がChrome同期ストレージの容量を超えているため、バックアップできません');
    toggleLoading(target, false);
    return;
  }

  // 各Base64データをchrome.storage.syncにアップロードする
  // - LocalStorageのkeyには先頭にSTORAGE_PREFIXを付ける
  // - IndexedDBのDB名には先頭にDB_PREFIXを付ける
  // - DBのバージョンもバックアップしておく
  const syncStorage = {};
  Object.keys(ls).forEach((key) => {
    syncStorage[ls[key].name] = ls[key].value;
  });
  Object.keys(db).forEach((key) => {
    syncStorage[db[key].versionName] = db[key].version;
    syncStorage[db[key].name] = db[key].value;
  });
  syncStorage[UPLOADED_AT_KEY] = getNowDateTime();
  await chrome.storage.sync.clear();
  await chrome.storage.sync.set(syncStorage);
  toggleLoading(target, false);
}

async function restore(e) {
  const target = e.currentTarget;
  toggleLoading(target, true);
  const storage = await chrome.storage.sync.get();
  console.debug(storage);
  // uploadedAtの内容を取得して、cofirmで確認
  if (!confirm(`${storage[UPLOADED_AT_KEY]}にバックアップされた設定を復元します`)) {
    toggleLoading(target, false);
    return;
  }

  // IndexedDBのバージョンを取得（3種類）
  // chrome.storage.syncに保存されているDBのバージョンを取得
  // 一致しない場合は復元しない
  let notMatchVersion = false;
  const dbVersionKeys = Object.keys(storage).filter((key) => key.startsWith(DB_VERSION_PREFIX));
  const versionPromises = dbVersionKeys.map((key) => {
    return (async () => {
      const dbName = key.replace(DB_VERSION_PREFIX, '');
      const idb = await connectIDB(dbName);
      const version = idb.version;
      const backupVersion = storage[key];
      if (version !== backupVersion) notMatchVersion = true;
    })();
  });
  await Promise.all(versionPromises);
  if (notMatchVersion) {
    alert('DBのバージョンがバックアップ時から更新されているため、復元できません');
    return;
  }

  // IndexedDBにトランザクションがあると復元できないため、リロードしてTOKIMEKIが読み込まれる前に復元処理を行う
  await chrome.storage.local.set({isRestore: true});
  location.reload();
}

async function restoreMain() {
  // chrome.storage.syncの内容を取得
  const storage = await chrome.storage.sync.get();
  
  // keyの先頭にSTORAGE_PREFIXが付いているものを取得
  const lsKeys = Object.keys(storage).filter((key) => key.startsWith(LOCAL_STORAGE_PREFIX));
  // LocalStorageを空にする
  localStorage.clear();
  // LocalStorageに復元
  const lsPromises = lsKeys.map((key) => {
    return (async () => {
      const name = key.replace(LOCAL_STORAGE_PREFIX, '');
      const value = await decompressText(storage[key]);
      localStorage.setItem(name, value);
    })();
  });
  await Promise.all(lsPromises);

  // keyの先頭にDB_PREFIXが付いているものを取得
  const dbKeys = Object.keys(storage).filter((key) => key.startsWith(DB_PREFIX));
  // IndexedDBを空にする
  // IndexedDBに復元
  const dbPromises = dbKeys.map((key) => {
    return (async () => {
      const dbName = key.replace(DB_PREFIX, '');
      const json = await decompressText(storage[key]);
      const idb = await connectIDB(dbName);
      await clearDatabase(idb);
      await importFromJson(idb, json);
    })();
  });
  await Promise.all(dbPromises);

  // ページをリロード
  await chrome.storage.local.set({isRestore: false});
  location.reload();
}

// サイドバーにボタンを追加する
window.onload = async () => {
  let sidebarButtons = null;
  while(!sidebarButtons) {
    await sleep(1000);
    sidebarButtons = document.querySelector('.side-bar__list.side-bar__bottom');
  }
  const backupButton = createElementFromHTML(backupButtonHtml);
  const restoreButton = createElementFromHTML(restoreButtonHtml);
  toggleLoading(backupButton, false);
  toggleLoading(restoreButton, false);
  backupButton.addEventListener('click', backup);
  restoreButton.addEventListener('click', restore);
  sidebarButtons.insertAdjacentElement('afterbegin', restoreButton);
  sidebarButtons.insertAdjacentElement('afterbegin', backupButton);
}

// 復元処理をページ読み込み前に行うか確認する
document.addEventListener('DOMContentLoaded', async () => {
  const storage = await chrome.storage.local.get();
  if (storage.isRestore) await restoreMain();
});