import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DogeWalletEntity {
  @PrimaryGeneratedColumn("uuid")
  id:string

  @Column()
  address:string

  @CreateDateColumn({type:"timestamp with time zone"})
  createAt:Date
}