const DB_PREFIX = 'IDB_';
const STORAGE_PREFIX = 'LS_';
const UPLOADED_AT_KEY = 'uploadedAt';
const ICON_CLASS = 'yu-button-icon';
const LOADING_CLASS = 'yu-loading';

const backupButtonHtml = `
<button id="Yu-Backup" class="side-bar-button svelte-oetxd8" title="設定をバックアップする">
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
<button id="Yu-Restore" class="side-bar-button svelte-oetxd8" title="設定をリストアする">
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

// --- ユーティリティ関数群 End

async function backup(e) {
  const target = e.currentTarget;
  if (confirm('設定をバックアップします')) {
    toggleLoading(target, true);
    // LocalStorageの内容を取得
    // IndexedDBの内容を取得（3種類）
    // LocalStorageのキーごとにBase64化
    // - Base64化したそれぞれのサイズを取得しておく
    // IndexedDBのDBごとにBase64化
    // - Base64化したそれぞれのサイズを取得しておく
    // 各Base64化した結果がchrome.storage.sync.QUOTA_BYTES_PER_ITEMを超えていないか確認
    // Base64化した結果の合計がchrome.storage.sync.QUOTA_BYTESを超えていないか確認
    // 各Base64データをchrome.storage.syncにアップロードする
    // - LocalStorageのkeyには先頭にSTORAGE_PREFIXを付ける
    // - IndexedDBのDB名には先頭にDB_PREFIXを付ける
    await chrome.storage.sync.clear();
    await chrome.storage.sync.set({[UPLOADED_AT_KEY]: getNowDateTime()});
    toggleLoading(target, false);
  }
}

async function restore(e) {
  const target = e.currentTarget;
  toggleLoading(target, true);
  // chrome.storage.syncの内容を取得
  const storage = await chrome.storage.sync.get();
  console.debug(storage);
  // uploadedAtの内容を取得して、cofirmで確認
  if (confirm(`${storage[UPLOADED_AT_KEY]}にバックアップされた設定を復元します`)) {
    // keyの先頭にSTORAGE_PREFIXが付いているものを取得
    // LocalStorageを空にする
    // LocalStorageに復元
    // keyの先頭にDB_PREFIXが付いているものを取得
    // IndexedDBを空にする
    // IndexedDBに復元
    // ページをリロード
    location.reload();
  }
}

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