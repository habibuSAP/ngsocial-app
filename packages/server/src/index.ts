import express ,{ Application} from "express";
import { ApolloServer, Config, gql, AuthenticationError} from "apollo-server-express";
import { IResolvers} from "@graphql-tools/utils";
import schema from "./graphql/schema";
import casual from "casual";
import cors from 'cors';
import 'reflect-metadata';
import {
    createConnection,
    Connection,
    Repository, getRepository
} from "typeorm";
import { User, Post, Comment, Like, Notification } from "./entity";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { graphqlUploadExpress } from 'graphql-upload';
import { createServer} from "http";
import { execute, subscribe } from 'graphql';
import { SubscriptionServer, ConnectionParams} from "subscriptions-transport-ws";



dotenv.config();
const {JWT_SECRET} = process.env;
const getAuthuser = (token: string) => {
    try {
        if (token) {
            return jwt.verify(token, JWT_SECRET as string);
        }
        return null;
    } catch (error){
        return null;
    }
}
const typeDefs = gql `type Query { message: String!}`
const resolvers: IResolvers = {
    Query: {
        message: ()=> "Resolver Works!"
    }
};
const config: Config = {
    typeDefs: typeDefs,
    resolvers: resolvers
};
let postsIds: string[] = [];
let usersIds: string[] = [];

export type Context = {
    orm: {
        userRepository: Repository<User>;
        postRepository: Repository<Post>;
        commentRepository: Repository<Comment>;
        likeRepository: Repository<Like>;
        notificationRepository: Repository<Notification>;
    };
    authUser: User | null;
};

const mocks = {
    User: () => ({
        id: () => {let uuid = casual.uuid; usersIds.push(uuid); return uuid},
        fullName: casual.full_name,
        bio: casual.text,
        email: casual.email,
        username: casual.username,
        password: casual.password,
        image: 'https://picsum.photos/seed/picsum/150/150',
        coverImage: 'https://picsum.photos/seed/picsum/600/300',
        postsCount: () => casual.integer(0)
    }),
    Post: () => ({
        id: () => {let uuid = casual.uuid; postsIds.push(uuid); return uuid},
        author: casual.random_element(usersIds),
        text: casual.text,
        image: 'https://picsum.photos/seed/picsum/350/350',
        commentsCount: () => casual.integer(0,100),
        likesCount: () => casual.integer(0,100),
        latestLike: casual.first_name,
        likeByAuthUser: casual.boolean,
        createdAt: () => casual.date()
    }),
    Comment: () => ({
        id: casual.uuid,
        author: casual.random_element(usersIds),
        comment: casual.text,
        post: casual.random_element(postsIds),
        createdAt: () => casual.date()
    }),
    Like: () => ({
        id: casual.uuid,
        user: casual.uuid,
        post: casual.random_element(postsIds)
    }),
    Query: () =>({
        getPostsByUserId: () =>  [...new Array(casual.integer(10, 100))],
        getFeed: () => [...new Array(casual.integer(10, 100))],
        getNotificationsByUserId: () => [...new Array(casual.integer(10, 100))],
        getCommentsByPostId: () => [...new Array(casual.integer(10, 100))],
        getLikesByPostId: () => [...new Array(casual.integer(10, 100))],
        searchUsers: () => [...new Array(casual.integer(10, 100))]
    })

};

async function startApolloServer() {
    const PORT = 8888;
    const app: Application = express();
    const httpServer = createServer(app);
    app.use(cors());
    app.use(graphqlUploadExpress());
    const userRepository: Repository<User> = getRepository(User);
    const postRepository: Repository<Post> = getRepository(Post);
    const commentRepository: Repository<Comment> = getRepository(Comment);
    const likeRepository: Repository<Like> = getRepository(Like);
    const notificationRepository: Repository<Notification> = getRepository(Notification);

    const server: ApolloServer = new ApolloServer({schema,
        context: ({req}) => {
            const token = req.get('Authorization') || '';
            const authUser = getAuthuser(token.split(' ')[1]);

            const ctx: Context = {
                orm: {
                    userRepository: userRepository,
                    postRepository: postRepository,
                    commentRepository: commentRepository,
                    likeRepository: likeRepository,
                    notificationRepository: notificationRepository
                },
                // @ts-ignore
                authUser: authUser
            };
            return ctx;
        },
        plugins: [{
        //@ts-ignore
            async serverWillStart(){
                return {
                    async drainServer(){
                        subscriptionServer.close();
                    }
                };
            }
        }]

    });
    const subscriptionServer = SubscriptionServer.create(
        { schema, execute, subscribe, onConnect: (connectionParams: ConnectionParams) => {
                const token = connectionParams.get('authToken') || '';
                if (token != '') {
                    const authUser = getAuthuser(token.split('')[1]);
                    return {
                        authUser: authUser
                    }
                }
                throw new AuthenticationError('User is not authenticated');
            }
        },
        //@ts-ignore
        { server: httpServer, path: server.graphqlPath}
    );
    await server.start();
    server.applyMiddleware({
        app,
        path: '/graphql'
    });
    httpServer.listen(PORT, ()=>{
        console.log(`Apollo Server is running at http://localhost:${PORT}`);
    });
}
const connection: Promise<Connection> = createConnection();
connection.then( ()=> {
    startApolloServer();
}).catch( error => console.log('Database connection error:', error));
