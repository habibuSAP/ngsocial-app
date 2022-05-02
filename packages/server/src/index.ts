import express ,{ Application} from "express";
import { ApolloServer, Config, gql} from "apollo-server-express";
import { IResolvers} from "@graphql-tools/utils";
import schema from "./graphql/schema";

const PORT = 8888
// const app: Application = express();
// app.get('/', (req, res) =>
//     res.send('Express is successfuly running!'));
// app.listen(PORT, ()=>{
//     console.log(`Server is running at http://localhost:${PORT}`);
// });

const typeDefs = gql `type Query { message: String!}`
const resolvers: IResolvers = {
    Query: {
        message: ()=> "Resolver Works!"
    }
};
const config: Config = {
    typeDefs: typeDefs,
    resolvers: resolvers
}
async function startApolloServer() {
    const app: Application = express();
    const server: ApolloServer = new ApolloServer({schema, mocks: true});
    await server.start();
    server.applyMiddleware({
        app,
        path: '/graphql'
    });
    app.listen(PORT, ()=>{
        console.log(`Apollo Server is running at http://localhost:${PORT}`);
    });
}
startApolloServer();

