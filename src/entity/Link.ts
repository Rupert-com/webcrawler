import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm'
import { Origin } from './Origin'

@Entity()
export class Link {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', nullable: true })
  rel?: string

  @Column({ type: 'varchar', nullable: true })
  domain?: string

  @Column({ type: 'varchar', nullable: true })
  root?: string

  @Column({ type: 'varchar' })
  href: string

  @Column({ type: 'int', default: 0 })
  level: number

  @ManyToOne(() => Origin, (origin) => origin.links)
  origin: Origin

  constructor(href: string) {
    this.href = href

    // https://stackoverflow.com/a/70100188/11123801
    const pttrn = /^(https?:\/\/)?(www\.)?([^\/]+)/gm
    const urlInfo = pttrn.exec(href)

    if (urlInfo) {
      this.domain = urlInfo[2] && urlInfo[3] ? urlInfo[2] + urlInfo[3] : undefined
      this.root = urlInfo[3] ? urlInfo[3] : undefined
    }
  }
}
