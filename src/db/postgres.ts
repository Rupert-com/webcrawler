import { Logger } from 'log4js'
import { createConnection, Connection, getConnectionOptions } from 'typeorm'
import logger from '../util/logger'

export class Postgres {
  logger: Logger
  client?: Connection | undefined

  constructor(logger: Logger) {
    this.logger = logger
  }

  async disconnect() {
    this.client?.close
  }
  async connect(entities: Array<any>) {
    const connectionOptions = await getConnectionOptions()
    Object.assign(connectionOptions, { entities })
    this.client = await createConnection(connectionOptions)
    // conn
    //   .connect()
    //   .then((con) => {
    //     this.client = con
    //   })
    //   .catch((error) => this.logger.error(error))
  }
}
