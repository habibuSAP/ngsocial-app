import { Context } from '..';
// @ts-ignore
import { Resolvers, User, Post, Comment, Like, Notification } from '@ngsocial/graphql';
import { ApolloError} from "apollo-server-express";
import {DeleteResult} from "typeorm";
import { Post as PostEntity} from '../entity';


const resolvers: Resolvers = {
    Query: {
        message: ()=> "Resolver works!",
        // @ts-ignore
        getUser: async (_, args, ctx: Context) => {
            const orm = ctx.orm;
            const user = await orm
                .userRepository.findOne({
                    where:
                        {id: args.userId}});
            if (!user) {
                throw new ApolloError(
                    "No user found",
                    "USER_NOT_FOUND");
            }
            return user as unknown as User;
        },
        // @ts-ignore
        getPostsByUserId: async (_, args, ctx: Context ) => {
            const posts = await ctx.orm.postRepository
                .createQueryBuilder("post")
                .where({ author: {id: args.userId}})
                .leftJoinAndSelect("post.author", "post_author")
                .leftJoinAndSelect("post.latestComment", "latestCommet")
                .leftJoinAndSelect("latestComment.author", "latestComment_author")
                .leftJoinAndSelect("post.likes", "likes")
                .leftJoinAndSelect("likes.user", "likes_user")
                .orderBy("post.createdAt", "DESC")
                .skip(args.offset as number)
                .take(args.limit as number)
                .getMany();
            return posts as unknown as Post[];
        },
        // @ts-ignore
        getFeed: async (_, args, ctx: Context) => {
            const feed = await ctx.orm.postRepository
                .createQueryBuilder("post")
                .leftJoinAndSelect("post.author", "post_author")
                .leftJoinAndSelect("post.latestComment", "latestComment")
                .leftJoinAndSelect("latestComment.author", "latestComment_author")
                .leftJoinAndSelect("post.likes", "likes")
                .leftJoinAndSelect("list.user", "likes_user")
                .orderBy("post.createdAt", "DESC")
                .skip(args.offset as number)
                .take(args.limit as number)
                .getMany();
            return feed as unknown as Post[];
        },
        // @ts-ignore
        getNotificationsByUserId: async (_, args, ctx: Context) => {
            const notifications = await ctx.orm.notificationRepository
                .createQueryBuilder("notification")
                .innerJoinAndSelect("notification.user", "user")
                .where("user.id = :userId", {userId: args.userId})
                .orderBy("notification.createdAt", "DESC")
                .skip(args.offset as number)
                .take(args.limit as number)
                .getMany();
            return notifications as unknown as Notification[];

        },
        // @ts-ignore
        getCommentsByPostId: async (_, args, ctx: Context) => {
            return await  ctx.orm.commentRepository
                .createQueryBuilder("comment")
                .innerJoinAndSelect("comment.author", "author")
                .innerJoinAndSelect("comment.post", "post")
                .where("post.id = :id", { id: args.postId as string})
                .orderBy("comment.createdAt", "DESC")
                .skip(args.offset as number)
                .take(args.limit as number)
                .getMany() as unknown as Comment[];
        },
        // @ts-ignore
        getLikesByPostId: async (_, args, ctx: Context) => {
            return await ctx.orm.likeRepository
                .createQueryBuilder("like")
                .innerJoinAndSelect("like.user", "user")
                .innerJoinAndSelect("like.post", "post")
                .where("post.id: id", {id: args.postId})
                .orderBy("like.createdAt", "DESC")
                .skip(args.offset as number)
                .take(args.limit as number)
                .getMany() as unknown as Like[];
        },
        // @ts-ignore
        searchUsers: async (_, args, ctx: Context) => {
            const users = await ctx.orm.userRepository
                .createQueryBuilder("user")
                .where(`user.fullName Like%${args.searchQuery}%`)
                .orWhere(`User.username Like %${args.searchQuery}%`)
                .getMany();
            return users as unknown as User[];
        }
    },
    Mutation: {
        // @ts-ignore
        post: (_, args, ctx: Context) => {
            throw new ApolloError("Not implemente yet", "NOT_IMPLEMENTED_YET");
        },
        // @ts-ignore
        comment: (_, args, ctx: Context) => {
            throw new ApolloError("Not implemented yet", "NOT_IMPLEMENTED_YET");
        },
        // @ts-ignore
        like : (_, args, ctx: Context) => {
            throw new ApolloError("Not Implemented yet", "NOT_IMPLEMENTED_YET");
        },
        // @ts-ignore
        removeLike: async (_, args, ctx: Context) => {
            throw new ApolloError("Not implemented yet", "NOT_IMPLEMENTED_YET")
        },
        // @ts-ignore
        removePost: async (_, args, {orm}: Context) => {
            const post = await orm.postRepository.findOne(
                args.id, { relations: ['author']});
            if (!post) {
                throw  new ApolloError("Post not found", "POST_NOT_FOUND");
            }
            const result : DeleteResult = await orm.postRepository.createQueryBuilder()
                .delete().from(PostEntity).where("id = :id", {id: args.id}).execute();
            const postsCount = post?.author?.postsCount;
            if (postsCount && postsCount >= 1) {
                // @ts-ignore
                await orm.postRepository.update({id: post?.author.id}, {postsCount: postsCount - 1});

            }
            if ( result.affected && result.affected <+ 0) {
                throw  new ApolloError("Post not deleted", "POST_NOT_DELETED");
            }
            return args.id;
        },
        // @ts-ignore
        removeComment: async (_, args, {orm}: Context) => {
            const comment = await orm.commentRepository.findOne(
                args.id, { relations: ['author', 'post']});
            if (!comment) {
                throw new ApolloError("Comment not found", "COMMENT_NOT_FOUND");
            }
            const result: DeleteResult = await orm.commentRepository.delete(args.id);
            if ( result.affected && result.affected <= 0) {
                throw new ApolloError("Comment not deleted", "COMMENT_NOT_DELETED");
            }
            const commentsCount = comment?.post?.commentsCount;
            if ( commentsCount && commentsCount >= 1) {
                // @ts-ignore
                await orm.commentRepository.update(comment.post.id, {commentsCount: commentsCount - 1});
            }
            return comment as unknown as Comment[];
        },
        // @ts-ignore
        removeNotification: async (_, args, {orm}: Context) => {
            const notificationRepo = orm.notificationRepository;
            const notification = await notificationRepo.findOne(args.id, {relations: ['user']});
            if (!notification) {
                throw new ApolloError("Notification not found", "NOTIFICATION_NOT_FOUND");
            }
            const result : DeleteResult = await notificationRepo.delete(args.id);
            if (result.affected && result.affected <= 0) {
                throw new ApolloError("Notification not deleted", "NOTIFICATION_NOT_DELETED");
            }
            return args.id;
        }
    }
};

export default resolvers;
