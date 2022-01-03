import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Link } from './Link'

@Entity()
export class Origin {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar' })
  origin: string

  @OneToMany(() => Link, (link) => link.origin)
  links: Link[] 

  constructor(origin: string) {
    this.origin = origin
  }
}
