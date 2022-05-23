import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { PostComponent } from './components/post/post.component';
import { DialogComponent } from './components/dialog/dialog.component';



@NgModule({
  declarations: [
    CreatePostComponent,
    PostComponent,
    DialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [ReactiveFormsModule]
})
export class SharedModule { }
