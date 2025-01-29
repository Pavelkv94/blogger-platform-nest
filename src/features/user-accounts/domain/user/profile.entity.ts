import { Column, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm";
import { User } from "./user.entity";
//* LEARNING
@Entity()
export class Profile {
  // @PrimaryGeneratedColumn()
  // id: string;

  @Column()
  address: string;

  @Column()
  hobby: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;

  // @Column()
  // userId: number;

  //* в данном случае userId создаться автоматически изза связи один к одному
  //* userId как primary key и foreign key
  @PrimaryGeneratedColumn()
  userId: number;
}