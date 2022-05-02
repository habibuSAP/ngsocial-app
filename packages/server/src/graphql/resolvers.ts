import { IResolvers} from "@graphql-tools/utils";

const resolvers: IResolvers = {
    Query: {
        message: ()=> "Resolvers Works"
    }
};

export default resolvers;
