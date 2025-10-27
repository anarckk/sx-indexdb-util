# sx-indexdb-util

一个基于 Promise 的 IndexedDB 工具库，提供简洁易用的 API 进行浏览器端数据存储操作。

## 特性

- 🚀 基于 Promise 的异步 API
- 📦 支持 TypeScript 类型定义
- 🔧 简洁的对象存储服务模式
- ❄️ 集成雪花算法生成分布式唯一ID
- 🔄 兼容旧版 API，平滑升级

## 安装

```bash
npm install sx-indexdb-util
```

## 快速开始

### 新的 API 用法（推荐）

```javascript
import { $getIndexDbInstance, getService } from 'sx-indexdb-util';

// 1. 获取数据库实例
const db = await $getIndexDbInstance('myDatabase', ['users', 'products'], 1);

// 2. 获取对象存储服务
const userService = await getService(db, 'users');

// 3. 使用服务方法
// 保存记录（自动生成ID）
const id = await userService.$saveRecord({ name: '张三', age: 25 });

// 查询所有记录
const users = await userService.$listAll();

// 根据ID获取记录
const user = await userService.$getRecord(id);

// 更新记录
await userService.$updateRecord({ id, name: '李四', age: 26 });

// 删除记录
await userService.$deleteRecordById(id);
```

### 链式调用示例

```javascript
import { $getIndexDbInstance, getService } from 'sx-indexdb-util';

// 链式操作
$getIndexDbInstance('myApp', ['settings', 'cache'], 1)
  .then(db => getService(db, 'settings'))
  .then(settingsService => {
    return settingsService.$saveRecord({ theme: 'dark', language: 'zh-CN' });
  })
  .then(id => {
    console.log('设置已保存，ID:', id);
  });
```

### 兼容旧版 API 用法

```javascript
import { IndexDbDao } from 'sx-indexdb-util';

// 创建数据库访问对象
const db = IndexDbDao('myDatabase', ['users', 'products'], 1);

// 通过 getService 方法获取服务
db.users.getService().then(userService => {
  return userService.$saveRecord({ name: '王五', email: 'wangwu@example.com' });
}).then(id => {
  console.log('用户已创建，ID:', id);
});
```

## API 文档

### 核心函数

#### `$getIndexDbInstance(database, objectStoreNames, version)`
获取 IndexedDB 数据库实例。

**参数：**
- `database` (string): 数据库名称
- `objectStoreNames` (Array<string>): 对象存储名称列表
- `version` (number): 数据库版本号

**返回：** `Promise<IDBDatabase>`

#### `getService(indexDb, objectStoreName)`
创建对象存储服务。

**参数：**
- `indexDb` (IDBDatabase | Promise<IDBDatabase>): 数据库实例或 Promise
- `objectStoreName` (string): 对象存储名称

**返回：** `Promise<ObjectStoreService>`

### 对象存储服务方法

所有方法都返回 Promise：

- `$saveRecord(record)` - 保存新记录（自动生成ID）
- `$updateRecord(record)` - 更新现有记录
- `$deleteRecordById(id)` - 根据ID删除记录
- `$listAll()` - 查询所有记录
- `$getRecord(id)` - 根据ID获取记录
- `$removeAllRecords()` - 删除所有记录
- `$isKeyExists(id)` - 检查ID是否存在
- `$saveOrUpdateRecord(record)` - 保存或更新记录

### 雪花ID生成

```javascript
import { generateSnowflakeId } from 'sx-indexdb-util';

// 生成唯一ID
const id = generateSnowflakeId();
console.log(id); // 输出: "1234567890123456789"
```

## 完整示例

```javascript
import { $getIndexDbInstance, getService } from 'sx-indexdb-util';

class UserManager {
  constructor() {
    this.userService = null;
    this.init();
  }

  async init() {
    const db = await $getIndexDbInstance('UserDB', ['users'], 1);
    this.userService = await getService(db, 'users');
  }

  async addUser(userData) {
    return await this.userService.$saveRecord(userData);
  }

  async getAllUsers() {
    return await this.userService.$listAll();
  }

  async updateUser(id, updates) {
    const user = await this.userService.$getRecord(id);
    if (user) {
      return await this.userService.$updateRecord({ ...user, ...updates, id });
    }
    throw new Error('用户不存在');
  }

  async deleteUser(id) {
    return await this.userService.$deleteRecordById(id);
  }
}

// 使用示例
const userManager = new UserManager();

// 添加用户
const userId = await userManager.addUser({
  name: '测试用户',
  email: 'test@example.com',
  createdAt: new Date().toISOString()
});

// 获取所有用户
const users = await userManager.getAllUsers();

// 更新用户
await userManager.updateUser(userId, { name: '更新后的用户' });

// 删除用户
await userManager.deleteUser(userId);
```

## 构建

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 开发模式（监听文件变化）
npm run dev
```

## 浏览器支持

- Chrome 24+
- Firefox 16+
- Safari 7+
- Edge 12+
- Internet Explorer 10+

## 许可证

MIT