import { makeVar } from "@apollo/client";
import { gql } from "@apollo/client";
import { IAuthState } from "./shared";

export const authState = makeVar<IAuthState>({
  isLoggedIn: false,
  currentUser: null,
  accessToken: ''
} as IAuthState
);

export const GET_AUTH_STATE = gql`query getAuthState {authState @client }`;
