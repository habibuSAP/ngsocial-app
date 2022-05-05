import { Entity,
        Column,
        PrimaryGeneratedColumn,
        CreateDateColumn,
        ManyToOne
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";
import {type} from "os";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn() id: number;
    @Column("text") comment: string;
    @CreateDateColumn() createdAt: Date;
    @ManyToOne( type => User, user => user.comments, {onDelete: 'CASCADE'} ) author: User;
    @ManyToOne( type => Post, post => post.comments, {onDelete: 'CASCADE'}) post: Post;
}
