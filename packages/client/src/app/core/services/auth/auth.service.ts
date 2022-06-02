import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  IUser,
  RegisterResponse,
  LoginResponse,
  IAuthState,
  UserResponse,
  UsersResponse,
  SearchUsersResponse,
  SEARCH_USERS_QUERY,
  ACCESS_TOKEN,
  AUTH_USER,
  MayBeNullOrUndefined
} from 'src/app/shared';
import { GetUserGQL } from './graphql/getuser.service';
import { LoginGQL } from './graphql/login.service';
import { RegisterGQL } from './graphql/register.service';
import { ApolloQueryResult } from '@apollo/client/core';
import { authState, GET_AUTH_STATE } from 'src/app/reactive';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private apollo: Apollo,
    private registerGQL: RegisterGQL,
    private loginGQL: LoginGQL,
    private getUserGQL: GetUserGQL) {

    const localToken = this.getLocalToken();
    let isLoggedIn = false;
    if (localToken) {
      isLoggedIn = this.tokenExists() && !this.tokenExpired(localToken);
    }
    if (!isLoggedIn) {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(AUTH_USER);
    }
    authState({
      isLoggedIn: isLoggedIn,
      currentUser: this.getLocalUser(),
      accessToken: localToken
    });
  }
  get isLoggedIn(): Observable<boolean> {
    return this.apollo.watchQuery<{ authState: IAuthState }>({
      query: GET_AUTH_STATE
    }).valueChanges.pipe(map((qr: ApolloQueryResult<{ authState: IAuthState }>) => qr.data.authState.isLoggedIn));
  }
  get authUser(): Observable<IUser | null> {
    return this.apollo.watchQuery<{ authState: IAuthState }>({
      query: GET_AUTH_STATE
    }).valueChanges.pipe(map((qr: ApolloQueryResult<{ authState: IAuthState }>) => qr.data.authState.currentUser));
  }
  get authState(): Observable<IAuthState> {
    return this.apollo.watchQuery<{ authState: IAuthState }>({
      query: GET_AUTH_STATE
    }).valueChanges.pipe(map((qr: ApolloQueryResult<{ authState: IAuthState }>) => qr.data.authState));
  }
  getLocalToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN);
  }
  storeUser(user: IUser): void {
    localStorage.setItem(AUTH_USER, JSON.stringify(user));
  }
  private getLocalUser(): IUser | null {
    return JSON.parse(localStorage.getItem(AUTH_USER) as string) ?? null;
  }
  private storeToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN, token);
  }
  private tokenExists(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN);
  }
  private tokenExpired(token: string): boolean {
    const tokenObj = JSON.parse(atob(token.split('.')[1]));
    return Date.now() > (tokenObj.exp * 1000);
  }
  private updateAuthState(token: string, user: IUser) {
    this.storeToken(token);
    this.storeUser(user);
    authState({
      isLoggedIn: true,
      currentUser: user,
      accessToken: token
    });
  }
  private resetAuthState() {
    authState({
      isLoggedIn: false,
      currentUser: null,
      accessToken: null
    });
  }
  register(
    fullName: string,
    username: string,
    email: string,
    password: string): Observable<MayBeNullOrUndefined<RegisterResponse>> {
    return this.registerGQL
      .mutate({
        fullName: fullName,
        username: username,
        email: email,
        password: password
      })
      .pipe(
        map(result => result.data),
        tap({
          next: (data: MayBeNullOrUndefined<RegisterResponse>) => {
            if (data?.register.token && data?.register.user) {

              const token: string = data?.register.token, user: IUser = data?.register.user;
              this.updateAuthState(token, user);
            }

          }
        }));
  }
  login(
    email: string,
    password: string): Observable<MayBeNullOrUndefined<LoginResponse>> {
    return this.loginGQL
      .mutate({
        email: email,
        password: password
      })
      .pipe(
        map(result => result.data),
        tap({
          next: (data: MayBeNullOrUndefined<LoginResponse>) => {
            if (data?.signIn.token && data?.signIn.user) {
              const token: string = data?.signIn.token, user = data?.signIn.user;
              this.updateAuthState(token, user);
            }
          }
        }));
  }
  getUser(userId: string): Observable<UserResponse> {
    return this.getUserGQL.watch({
      userId: userId
    }).valueChanges.pipe(map(result => result.data));
  }
  searchUsers(searchQuery: string, offset: number, limit: number): SearchUsersResponse {
    const feedQuery = this.apollo.watchQuery<UsersResponse>({
      query: SEARCH_USERS_QUERY,
      variables: {
        searchQuery: searchQuery,
        offset: offset,
        limit: limit
      },
      fetchPolicy: 'cache-first',
    });

    const fetchMore: (users: IUser[]) => void = (users: IUser[]) => {
      feedQuery.fetchMore({
        variables: {
          offset: users.length,
        }
      });
    }

    return { data: feedQuery.valueChanges.pipe(map(result => result.data)), fetchMore: fetchMore };
  }
  logOut(): void {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(AUTH_USER);
    this.resetAuthState();
  }
}
