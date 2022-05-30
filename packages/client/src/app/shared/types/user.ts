import { Observable } from "rxjs";
import { IUser } from "../models/user.model";


export type UserResponse = {
  getUser: IUser;
};
export type UsersResponse = {
  searchUsers: IUser[];
};
export type SearchUsersResponse = {
  data: Observable<UsersResponse>;
  fetMore: (Users: IUser[]) => void;
};
