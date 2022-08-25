import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { PostCustomizerComponent } from './post-customizer/post-customizer.component';
import { CustomizerStickersComponent } from './post-customizer/customizer-stickers/customizer-stickers.component';
import { CustomizerListComponent } from './post-customizer/customizer-list/customizer-list.component';

const routes: Routes = [
  {
    path: 'edit-customizer/:itemId/:customizerId',
    component: PostCustomizerComponent,
  },
  {
    path: 'post-customizer/:itemId/:customizerId',
    component: PostCustomizerComponent,
  },
  {
    path: 'customizer-list',
    component: CustomizerListComponent,
  },
  {
    path: 'customizer-list/:id',
    component: CustomizerListComponent,
  },
];

@NgModule({
  declarations: [
    PostCustomizerComponent,
    CustomizerStickersComponent,
    CustomizerListComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PostsModule {}
