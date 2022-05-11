import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne, AfterInsert, getRepository
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";
import {Notification} from "./Notification";

@Entity('likes')
export class Like {
    @PrimaryGeneratedColumn() id: number;
    @CreateDateColumn() createdAt: Date;
    @ManyToOne(type => User, user => user.likes, { onDelete: 'CASCADE'}) user: User;
    @ManyToOne( type => Post, post => post.likes, { onDelete: 'CASCADE'}) post: Post;
    @AfterInsert()
    async createNotification() {
        if(this.post && this.post.id) {
            const notificationRepo = getRepository(Notification);
            const notification = notificationRepo.create();
            notification.user = await getRepository(User).createQueryBuilder("user")
                .innerJoinAndSelect("user.posts", "post")
                .where("post.id: id", {id: this.post?.id})
                .getOne() as User;
            notification.postId = this.post?.id;
            notification.text = `${this.user.fullName} liked your post`;
            await notificationRepo.save(notification);
        }
    }

}
