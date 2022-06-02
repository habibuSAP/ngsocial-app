import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUser, SearchUsersResponse, UsersResponse } from 'src/app/shared';

@Component({
  selector: 'app-search-dialog',
  templateUrl: './search-dialog.component.html',
  styleUrls: ['./search-dialog.component.css']
})
export class SearchDialogComponent implements OnInit, OnDestroy {

  usersSubscription: Subscription | null = null;
  users: IUser[] = [];
  fetchMore: (feed: IUser[]) => void = () => { };

  constructor(
    public dialogRef: MatDialogRef<SearchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public response: SearchUsersResponse,
    private router: Router
  ) { }



  ngOnInit(): void {
    this.usersSubscription = this.response.data.subscribe({
      next: (data: UsersResponse | null | undefined) => {
        if (data?.searchUsers) {
          this.users = data.searchUsers;

        }
      }
    });
    this.fetchMore = this.response.fetchMore;
  }

  ngOnDestroy(): void {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  goToProfile(profileId: string): void {
    this.router.navigateByUrl(`/users/profile/${profileId}`);
  }

  invokeFetchMore(): void {
    this.fetchMore(this.users);
  }

  close(): void {
    this.dialogRef.close();
  }
}
