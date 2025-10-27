/**
 * IndexedDB 工具库
 * 提供对IndexedDB数据库的封装操作，包含基础CRUD方法和服务工厂函数
 * 使用Snowflake算法生成分布式唯一ID
 */

import { generateSnowflakeId } from 'sx-snow-flake-id';

/**
 * 获取IndexedDB数据库实例
 * @param {string} database - 数据库名称
 * @param {Array<string>} objectStoreNames - 对象存储名称列表
 * @param {number} version - 数据库版本号（升级时需递增）
 * @returns {Promise<IDBDatabase>} 成功时返回数据库实例
 * @throws {Event} 数据库打开失败时的错误事件
 */
export function $getIndexDbInstance(database, objectStoreNames, version) {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(database, version);
        request.onsuccess = function (event) {
            resolve(event.target.result);
        };
        request.onerror = function (event) {
            reject(event);
        };
        request.onupgradeneeded = function (event) {
            console.log('新版本号', version);
            const db = event.target.result;
            for (let index in objectStoreNames) {
                const objectStoreName = objectStoreNames[index];
                if (!db.objectStoreNames.contains(objectStoreName)) {
                    db.createObjectStore(objectStoreName, {
                        keyPath: 'id',
                        // autoIncrement: true
                    });
                }
            }
        };
    });
}

/**
 * 保存新记录（自动生成ID）
 * @param {IDBDatabase} db - 数据库实例
 * @param {string} objectStoreName - 对象存储名称
 * @param {Object} data - 待保存的数据对象（无需包含id）
 * @returns {Promise<number>} 返回生成的记录ID
 * @throws {Event} 操作失败时的错误事件
 */
function $saveRecord(db, objectStoreName, data) {
    return new Promise((resolve, reject) => {
        const request = db.transaction([objectStoreName], 'readwrite').objectStore(objectStoreName).add(data);
        request.onsuccess = function (evt) {
            resolve(evt.target.result);
        };
        request.onerror = function (evt) {
            reject(evt);
        };
    });
}

/**
 * 更新现有记录
 * @param {IDBDatabase} db - 数据库实例
 * @param {string} objectStoreName - 对象存储名称
 * @param {Object} data - 待更新的数据对象（必须包含id）
 * @returns {Promise<number>} 返回更新的记录ID
 * @throws {Event} 操作失败时的错误事件
 */
function $updateRecord(db, objectStoreName, data) {
    return new Promise((resolve, reject) => {
        const request = db.transaction([objectStoreName], 'readwrite').objectStore(objectStoreName).put(data);
        request.onsuccess = function (evt) {
            resolve(evt.target.result);
        };
        request.onerror = function (evt) {
            reject(evt);
        };
    });
}

/**
 * 根据ID删除记录
 * @param {IDBDatabase} db - 数据库实例
 * @param {string} objectStoreName - 对象存储名称
 * @param {number|string} id - 记录唯一标识
 * @returns {Promise<Event>} 删除操作成功事件
 * @throws {Event} 操作失败时的错误事件
 */
function $deleteRecordById(db, objectStoreName, id) {
    return new Promise((resolve, reject) => {
        const request = db.transaction([objectStoreName], 'readwrite').objectStore(objectStoreName).delete(id);
        request.onsuccess = function (event) {
            resolve(event);
        };
        request.onerror = function (evt) {
            reject(evt);
        };
    });
}

/**
 * 查询所有记录
 * @param {IDBDatabase} db - 数据库实例
 * @param {string} objectStoreName - 对象存储名称
 * @returns {Promise<Array>} 返回记录数组
 * @throws {Event} 操作失败时的错误事件
 */
function $listRecord(db, objectStoreName) {
    return new Promise((resolve, reject) => {
        const list = [];
        const request = db.transaction(objectStoreName).objectStore(objectStoreName).openCursor();
        request.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                list.push(cursor.value);
                cursor.continue();
            } else {
                resolve(list);
            }
        };
        request.onerror = function (evt) {
            reject(evt);
        };
    });
}

/**
 * 根据ID获取单条记录
 * @param {IDBDatabase} db - 数据库实例
 * @param {string} objectStoreName - 对象存储名称
 * @param {number|string} id - 记录唯一标识
 * @returns {Promise<Object|null>} 返回记录对象或null
 * @throws {Event} 操作失败时的错误事件
 */
function $getRecordById(db, objectStoreName, id) {
    return new Promise((resolve, reject) => {
        const request = db.transaction([objectStoreName], 'readonly').objectStore(objectStoreName).get(id);
        request.onerror = function (event) {
            reject(event);
        };
        request.onsuccess = function (event) {
            resolve(request.result);
        };
    });
}

/**
 * 检查记录是否存在
 * @param {IDBDatabase} db - 数据库实例
 * @param {string} objectStoreName - 对象存储名称
 * @param {number|string} key - 待检查的ID
 * @returns {Promise<boolean>} 存在返回true，否则false
 * @throws {Event} 操作失败时的错误事件
 */
function isKeyExist(db, objectStoreName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([objectStoreName]);
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.getAllKeys();
        request.onerror = function (event) {
            reject(event);
        };
        request.onsuccess = function (event) {
            const isExist = request?.result?.includes(key) || false;
            resolve(isExist);
        };
    });
}

/**
 * 获取所有记录ID
 * @param {IDBDatabase} db - 数据库实例
 * @param {string} objectStoreName - 对象存储名称
 * @returns {Promise<Array>} 返回ID数组（无记录时返回空数组）
 * @throws {Event} 操作失败时的错误事件
 */
function listAllKeys(db, objectStoreName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([objectStoreName]);
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.getAllKeys();
        request.onerror = function (event) {
            reject(event);
        };
        request.onsuccess = function (event) {
            // 无数据也会返回空数组
            resolve(request.result);
        };
    });
}

/**
 * 创建对象存储服务
 * @param {IDBDatabase|Promise<IDBDatabase>} indexDb - 数据库实例或返回数据库实例的Promise
 * @param {string} objectStoreName - 对象存储名称
 * @returns {Promise<Object>} 返回对象存储服务实例
 */
export async function getService(indexDb, objectStoreName) {
    const db = await Promise.resolve(indexDb);
    
    return {
        /**
         * 保存新记录（自动补全ID）
         * @param {Object} record - 待保存对象（无id时自动生成）
         * @returns {Promise<number>} 生成的记录ID
         */
        $saveRecord: function (record) {
            if (record.id == null) {
                record.id = generateSnowflakeId();
            }
            return $saveRecord(db, objectStoreName, record);
        },
        
        /**
         * 根据ID删除记录
         * @param {number|string} id - 记录唯一标识
         * @returns {Promise<Event>} 删除操作事件
         */
        $deleteRecordById: function (id) {
            return $deleteRecordById(db, objectStoreName, id);
        },
        
        /**
         * 查询所有记录
         * @returns {Promise<Array>} 记录数组
         */
        $listAll: function () {
            return $listRecord(db, objectStoreName);
        },
        
        /**
         * 更新记录（需包含id）
         * @param {Object} record - 待更新对象
         * @returns {Promise<number>} 更新的记录ID
         */
        $updateRecord: function (record) {
            return $updateRecord(db, objectStoreName, record);
        },
        
        /**
         * 根据ID获取记录
         * @param {number|string} id - 记录唯一标识
         * @returns {Promise<Object|null>} 记录对象或null
         */
        $getRecord: function (id) {
            return $getRecordById(db, objectStoreName, id);
        },
        
        /**
         * 删除所有记录
         * @returns {Promise<Array>} 删除操作事件数组
         */
        $removeAllRecords: function () {
            return listAllKeys(db, objectStoreName).then(list => 
                Promise.all(list.map(v => $deleteRecordById(db, objectStoreName, v)))
            );
        },
        
        /**
         * 检查ID是否存在
         * @param {number|string} id - 待检查的ID
         * @returns {Promise<boolean>} 存在返回true
         */
        $isKeyExists: function (id) {
            return isKeyExist(db, objectStoreName, id);
        },
        
        /**
         * 保存或更新记录（根据id是否存在）
         * @param {Object} record - 待操作对象（无id时自动生成）
         * @returns {Promise<number>} 生成或更新的记录ID
         */
        $saveOrUpdateRecord: function (record) {
            if (record.id == null) {
                record.id = generateSnowflakeId();
                return $saveRecord(db, objectStoreName, record);
            } else {
                return isKeyExist(db, objectStoreName, record.id).then(rs => {
                    if (rs) {
                        return $updateRecord(db, objectStoreName, record);
                    } else {
                        return $saveRecord(db, objectStoreName, record);
                    }
                });
            }
        }
    };
}

/**
 * 创建数据库服务工厂（兼容旧版API）
 * @param {string} database - 数据库名称
 * @param {Array<string>} objectStoreNames - 对象存储名称列表
 * @param {number} version - 数据库版本号
 * @returns {Object} 包含各对象存储操作方法的工厂对象
 */
export function IndexDbDao(database, objectStoreNames, version) {
    let db = null;
    function getIndexDb() {
        return new Promise((resolve, reject) => {
            if (db != null) {
                resolve(db);
                return;
            }
            $getIndexDbInstance(database, objectStoreNames, version).then(newInstance => {
                db = newInstance;
                resolve(db);
            }).catch(e => reject(e));
        });
    }
    
    const result = {};
    for (let index in objectStoreNames) {
        const objectStoreName = objectStoreNames[index];
        result[objectStoreName] = {
            /**
             * 获取对象存储服务
             * @returns {Promise<Object>} 对象存储服务
             */
            getService: function () {
                return getService(getIndexDb(), objectStoreName);
            }
        };
    }
    return result;
}

// 导出所有基础函数
export {
    generateSnowflakeId
};