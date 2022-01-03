import { Logger } from 'log4js'
import { createClient, RedisClusterType } from 'redis'

export class Redis {
  logger: Logger
  client = createClient()

  constructor(logger: Logger) {
    this.logger = logger
    this.client.on('error', (err) => logger.error('Redis Client Error', err))
  }

  async connect() {
    await this.client.connect()
  }

  async disconnect() {
    await this.client.disconnect()
  }

  async put(key: string, val: any) {
    // "key", "field", "value"
    await this.client.hSet('val', key, val)
  }

  async get(key: string) {
    return await this.client.hGetAll('val')
  }
}
