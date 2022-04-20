import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { PostCustomizerComponent } from './post-customizer/post-customizer.component';

const routes: Routes = [
  {
    path: 'edit-customizer/:itemId/:customizerId',
    component: PostCustomizerComponent,
  },
  {
    path: 'post-customizer/:itemId/:customizerId',
    component: PostCustomizerComponent,
  },
];

@NgModule({
  declarations: [PostCustomizerComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PostsModule {}
