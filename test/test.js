/**
 * sx-indexdb-util 测试文件
 * 用于验证新的 API 接口功能
 */

import { $getIndexDbInstance, getService, generateSnowflakeId, IndexDbDao } from '../src/index.js';

// 模拟浏览器环境
if (typeof window === 'undefined') {
  global.window = {};
  global.indexedDB = {
    open: () => ({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null
    })
  };
}

// 测试雪花ID生成
console.log('=== 测试雪花ID生成 ===');
try {
  const id1 = generateSnowflakeId();
  const id2 = generateSnowflakeId();
  console.log('生成的雪花ID1:', id1);
  console.log('生成的雪花ID2:', id2);
  console.log('ID长度:', id1.length);
  console.log('ID是否唯一:', id1 !== id2);
} catch (error) {
  console.log('雪花ID生成测试失败:', error.message);
}

// 测试 API 接口结构
console.log('\n=== 测试 API 接口结构 ===');
console.log('$getIndexDbInstance 类型:', typeof $getIndexDbInstance);
console.log('getService 类型:', typeof getService);
console.log('generateSnowflakeId 类型:', typeof generateSnowflakeId);

// 测试服务工厂函数
console.log('\n=== 测试服务工厂函数 ===');
try {
  // 模拟数据库实例
  const mockDb = {
    transaction: () => ({
      objectStore: () => ({
        add: () => ({ onsuccess: null, onerror: null }),
        get: () => ({ onsuccess: null, onerror: null }),
        put: () => ({ onsuccess: null, onerror: null }),
        delete: () => ({ onsuccess: null, onerror: null }),
        openCursor: () => ({ onsuccess: null, onerror: null }),
        getAllKeys: () => ({ onsuccess: null, onerror: null })
      })
    })
  };

  // 测试 getService 函数
  const servicePromise = getService(mockDb, 'testStore');
  console.log('getService 返回类型:', typeof servicePromise);
  console.log('getService 返回 Promise:', servicePromise instanceof Promise);

  servicePromise.then(service => {
    console.log('服务对象包含的方法:');
    console.log('$saveRecord:', typeof service.$saveRecord);
    console.log('$listAll:', typeof service.$listAll);
    console.log('$getRecord:', typeof service.$getRecord);
    console.log('$updateRecord:', typeof service.$updateRecord);
    console.log('$deleteRecordById:', typeof service.$deleteRecordById);
    console.log('$removeAllRecords:', typeof service.$removeAllRecords);
    console.log('$isKeyExists:', typeof service.$isKeyExists);
    console.log('$saveOrUpdateRecord:', typeof service.$saveOrUpdateRecord);
  }).catch(error => {
    console.log('获取服务失败:', error.message);
  });

} catch (error) {
  console.log('服务工厂测试失败:', error.message);
}

// 测试兼容性 API
console.log('\n=== 测试兼容性 API ===');
try {
  const dao = IndexDbDao('testDB', ['users', 'products'], 1);
  console.log('IndexDbDao 返回类型:', typeof dao);
  console.log('包含 users 服务:', 'users' in dao);
  console.log('包含 products 服务:', 'products' in dao);
  console.log('users.getService 类型:', typeof dao.users.getService);
} catch (error) {
  console.log('兼容性 API 测试失败:', error.message);
}

console.log('\n=== 测试完成 ===');