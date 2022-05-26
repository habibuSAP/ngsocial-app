import { gql } from "apollo-angular";

export const USER_QUERY = gql`
  query getUser($userId: ID!) {
    getUser(userId: $userId) {
      id fullName bio email username image coverImage postsCount createdAt
    }
  }
`;

export const SEARCH_USERS_QUERY = gql`
  query searchUsers($searchTerm: String!) {
    searchUsers(searchTerm: $searchTerm) {
      id fullName bio email username image
    }
  }
`;
