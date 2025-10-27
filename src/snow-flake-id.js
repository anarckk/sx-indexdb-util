/**
 * 雪花ID生成器
 * 用于生成分布式唯一ID
 */

let snowFlakeInstance = null;

/**
 * 生成雪花ID
 * @returns {string} 雪花ID字符串
 */
export function generateSnowflakeId() {
    if (snowFlakeInstance == null) {
        snowFlakeInstance = RandomSnowFlakeId();
    }
    return snowFlakeInstance.nextId();
}

/**
 * 创建随机雪花ID生成器
 * @returns {Object} 雪花ID生成器实例
 */
export function RandomSnowFlakeId() {
    // 在浏览器环境中使用 localStorage 存储 workerId 和 datacenterId
    // 在 Node.js 环境中使用内存存储
    let workerId, datacenterId;
    
    if (typeof window !== 'undefined' && window.localStorage) {
        if (localStorage.workerId == null) {
            localStorage.workerId = Math.floor(Math.random() * 32);
        }
        if (localStorage.datacenterId == null) {
            localStorage.datacenterId = Math.floor(Math.random() * 32);
        }
        workerId = parseInt(localStorage.workerId);
        datacenterId = parseInt(localStorage.datacenterId);
    } else {
        // Node.js 环境
        workerId = Math.floor(Math.random() * 32);
        datacenterId = Math.floor(Math.random() * 32);
    }
    
    return SnowFlakeId(workerId, datacenterId);
}

/**
 * 创建指定 workerId 和 datacenterId 的雪花ID生成器
 * @param {number} workerId - 工作节点ID (0-31)
 * @param {number} datacenterId - 数据中心ID (0-31)
 * @returns {Object} 雪花ID生成器实例
 */
export function SnowFlakeId(workerId, datacenterId) {
    // 机器标识位数
    const workerIdBits = 5;
    // 数据中心标识位数
    const datacenterIdBits = 5;
    // 机器ID最大值
    const maxWorkerId = 31;
    // 数据中心ID最大值
    const maxDatacenterId = 31;
    // 毫秒内自增位
    const sequenceBits = 12;
    // 机器ID偏左移12位
    const workerIdShift = sequenceBits;
    // 数据中心ID左移17位
    const datacenterIdShift = sequenceBits + workerIdBits;
    // 时间毫秒左移22位
    const timestampLeftShift = sequenceBits + workerIdBits + datacenterIdBits;
    const sequenceMask = 4095;
    
    /* 上次生产id时间戳 */
    let lastTimestamp = -1;
    // 0，并发控制
    let sequence = 0;
    
    if (workerId > maxWorkerId || workerId < 0) {
        throw new Error("workerId must be between 0 and 31");
    }
    if (datacenterId > maxDatacenterId || datacenterId < 0) {
        throw new Error("datacenterId must be between 0 and 31");
    }
    
    return {
        /**
         * 生成下一个ID
         * @returns {string} 雪花ID
         */
        nextId: function () {
            let timestamp = timeGen();
            if (timestamp < lastTimestamp) {
                throw new Error("Clock moved backwards. Refusing to generate id for " + (lastTimestamp - timestamp) + " milliseconds");
            }
            if (lastTimestamp === timestamp) {
                // 当前毫秒内，则+1
                sequence = (sequence + 1) & sequenceMask;
                if (sequence === 0) {
                    // 当前毫秒内计数满了，则等待下一秒
                    timestamp = tilNextMillis(lastTimestamp);
                    lastTimestamp = timestamp;
                }
            } else {
                sequence = 0;
                lastTimestamp = timestamp;
            }
            
            // ID偏移组合生成最终的ID，并返回ID
            // 由于去除了 Long 依赖，使用 BigInt 替代
            const timestampBigInt = BigInt(timestamp);
            const datacenterIdBigInt = BigInt(datacenterId);
            const workerIdBigInt = BigInt(workerId);
            const sequenceBigInt = BigInt(sequence);
            
            const id = (timestampBigInt << BigInt(timestampLeftShift)) |
                     (datacenterIdBigInt << BigInt(datacenterIdShift)) |
                     (workerIdBigInt << BigInt(workerIdShift)) |
                     sequenceBigInt;
            
            return id.toString();
        }
    };
}

/**
 * 获取当前时间戳
 * @returns {number} 当前时间戳
 */
function timeGen() {
    return Date.now();
}

/**
 * 等待下一毫秒
 * @param {number} lastTimestamp - 上次时间戳
 * @returns {number} 下一毫秒时间戳
 */
function tilNextMillis(lastTimestamp) {
    let timestamp = timeGen();
    while (timestamp <= lastTimestamp) {
        timestamp = timeGen();
    }
    return timestamp;
}