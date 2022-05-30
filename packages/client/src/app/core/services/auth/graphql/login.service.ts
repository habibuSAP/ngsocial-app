import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import { LOGIN_MUTATION, LoginResponse } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class LoginGQL extends Mutation<LoginResponse> {

  override document = LOGIN_MUTATION;
}
