console.time('app')
require('dotenv').config()
require('events').EventEmitter.prototype._maxListeners = 100
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOGGER: 'file' | 'console'
      LEVELS: number
      START: string
    }
  }
}

import request, { Response } from 'request'
import logger from './util/logger'
import cheerio from 'cheerio'
import fs from 'fs'
import { Redis } from './db/redis'
import { Postgres } from './db/postgres'
import { Logger } from 'log4js'
import { Link } from './entity/Link'
import { getConnection } from 'typeorm'
import { Origin } from './entity/Origin'
import { exit } from 'process'
import { Agent } from 'https'

const successExit = {}
type IFetchResult = { body: string; response: Response }

const fetch = (url: string) =>
  new Promise<IFetchResult>((res, rej) => {
    request(
      {
        url,
        timeout: 12000,
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
      },
      (error, response, body) => {
        if (error) {
          rej(error)
          return
        }
        res({ body, response })
      }
    )
  })

const progressBody = ({ body, response }: IFetchResult, level: number = 0) => {
  return new Promise(async (res, rej) => {
    const cOrigin = new Origin(response.request.href)
    await getConnection().getRepository(Origin).save(cOrigin)

    const Links: Link[] = []
    const $ = cheerio.load(body)
    $('body')
      .not('header')
      .find('a')
      .each(function (index) {
        try {
          if (this.attribs?.href && !this.attribs.href.startsWith('#')) {
            const cLink = new Link(this.attribs.href)
            cLink.rel = this.attribs.rel
            cLink.origin = cOrigin
            cLink.level = level
            Links.push(cLink)
          }
        } catch (error) {
          logger.error(error)
        }
      })

    getConnection()
      .getRepository(Link)
      .save(Links)
      .then(() => res(true))
  })
}

const startDeepScan = async (level: number) => {
  logger.info('Entered Level ' + level)
  try {
    if (level > Number(process.env.LEVELS)) throw successExit
    let cLevel = level
    const Links = await getConnection()
      .getRepository(Link)
      .find({ where: 'level = ' + (cLevel - 1) })

    logger.info(`found ${Links.length} on level ${level}`)

    if (Links.length < 3000) {
      await Promise.allSettled(Links.map(async (it) => progressBody(await fetch(it.href), level)))
    } else {
      const splittedLinks = []
      while (Links.length) {
        splittedLinks.push(Links.splice(0, 1000))
      }

      let cCount = 0
      await Promise.allSettled(
        splittedLinks.map((cLinks) => {
          return new Promise(async (res, rej) => {
            await Promise.allSettled(cLinks.map(async (it) => progressBody(await fetch(it.href), level)))
            cCount += cLinks.length
            logger.info(`fetched first ${cCount} links of level ${level}`)
            res(true)
          })
        })
      )

      // await new Promise((res, rej) => {
      //   const x = splittedLinks.map(async (Links) => Links.map(async (it) => progressBody(await fetch(it.href), level)))
      // })
      // await Promise.allSettled(splittedLinks.map(async (Links) => Links.map(async (it) => progressBody(await fetch(it.href), level))))
    }

    logger.info('Leave Level ' + level)
    startDeepScan(level + 1)
  } catch (error) {
    logger.error(error)
  }
}

const cPostgres = new Postgres(logger)
cPostgres.connect([Link, Origin]).then((res) => {
  fetch(process.env.START)
    .then((res) => progressBody(res).then((_) => startDeepScan(1)))
    .catch((err) => {
      if (err === successExit) {
        console.timeEnd('app')
        console.timeLog('programm finished')
        exit(0)
      }
      logger.error(err)
    })
})
