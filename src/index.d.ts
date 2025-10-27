/**
 * IndexedDB 工具库类型定义
 */

/**
 * 雪花ID生成器接口
 */
interface SnowFlakeIdGenerator {
  nextId(): string;
}

/**
 * 对象存储服务接口
 */
interface ObjectStoreService {
  /**
   * 保存新记录（自动补全ID）
   * @param record - 待保存对象（无id时自动生成）
   * @returns 生成的记录ID
   */
  $saveRecord(record: Record<string, any>): Promise<number>;
  
  /**
   * 根据ID删除记录
   * @param id - 记录唯一标识
   * @returns 删除操作事件
   */
  $deleteRecordById(id: number | string): Promise<Event>;
  
  /**
   * 查询所有记录
   * @returns 记录数组
   */
  $listAll(): Promise<Array<Record<string, any>>>;
  
  /**
   * 更新记录（需包含id）
   * @param record - 待更新对象
   * @returns 更新的记录ID
   */
  $updateRecord(record: Record<string, any>): Promise<number>;
  
  /**
   * 根据ID获取记录
   * @param id - 记录唯一标识
   * @returns 记录对象或null
   */
  $getRecord(id: number | string): Promise<Record<string, any> | null>;
  
  /**
   * 删除所有记录
   * @returns 删除操作事件数组
   */
  $removeAllRecords(): Promise<Array<Event>>;
  
  /**
   * 检查ID是否存在
   * @param id - 待检查的ID
   * @returns 存在返回true
   */
  $isKeyExists(id: number | string): Promise<boolean>;
  
  /**
   * 保存或更新记录（根据id是否存在）
   * @param record - 待操作对象（无id时自动生成）
   * @returns 生成或更新的记录ID
   */
  $saveOrUpdateRecord(record: Record<string, any>): Promise<number>;
}

/**
 * 数据库服务工厂接口
 */
interface DatabaseServiceFactory {
  [objectStoreName: string]: {
    getService(): Promise<ObjectStoreService>;
  };
}

/**
 * 获取IndexedDB数据库实例
 * @param database - 数据库名称
 * @param objectStoreNames - 对象存储名称列表
 * @param version - 数据库版本号（升级时需递增）
 * @returns 成功时返回数据库实例
 */
export function $getIndexDbInstance(
  database: string, 
  objectStoreNames: Array<string>, 
  version: number
): Promise<IDBDatabase>;

/**
 * 创建对象存储服务
 * @param indexDb - 数据库实例或返回数据库实例的Promise
 * @param objectStoreName - 对象存储名称
 * @returns 返回对象存储服务实例
 */
export function getService(
  indexDb: IDBDatabase | Promise<IDBDatabase>, 
  objectStoreName: string
): Promise<ObjectStoreService>;

/**
 * 创建数据库服务工厂（兼容旧版API）
 * @param database - 数据库名称
 * @param objectStoreNames - 对象存储名称列表
 * @param version - 数据库版本号
 * @returns 包含各对象存储操作方法的工厂对象
 */
export function IndexDbDao(
  database: string, 
  objectStoreNames: Array<string>, 
  version: number
): DatabaseServiceFactory;

/**
 * 生成雪花ID
 * @returns 雪花ID字符串
 */
export function generateSnowflakeId(): string;

/**
 * 创建随机雪花ID生成器
 * @returns 雪花ID生成器实例
 */
export function RandomSnowFlakeId(): SnowFlakeIdGenerator;

/**
 * 创建指定 workerId 和 datacenterId 的雪花ID生成器
 * @param workerId - 工作节点ID (0-31)
 * @param datacenterId - 数据中心ID (0-31)
 * @returns 雪花ID生成器实例
 */
export function SnowFlakeId(workerId: number, datacenterId: number): SnowFlakeIdGenerator;