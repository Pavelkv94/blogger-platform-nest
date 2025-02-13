import { Column, CreateDateColumn, OneToMany } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';

export const nameConstraints = {
  minLength: 1,
  maxLength: 15,
};

export const descriptionConstraints = {
  minLength: 1,
  maxLength: 500,
};

export const websiteUrlConstraints = {
  minLength: 1,
  maxLength: 100,
};

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ collation: 'C', length: nameConstraints.maxLength })
  name: string;

  @Column({ collation: 'C', length: descriptionConstraints.maxLength })
  description: string;

  @Column({ collation: 'C', length: websiteUrlConstraints.maxLength })
  websiteUrl: string;

  @Column({ default: false })
  isMembership: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  static buildInstance(name: string, description: string, websiteUrl: string): Blog {
    const blog = new this();
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    return blog;
  }

  markDeleted() {
    this.deletedAt = new Date();
  }

  update(name: string, description: string, websiteUrl: string) {
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
  }
}
