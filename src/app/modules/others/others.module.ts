import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { LandingComponent } from './pages/landing/landing.component';
import { ContainerFormComponent } from './pages/container-form/container-form.component';
import { DataListComponent } from './pages/data-list/data-list.component';
import { DeliveryPreviewComponent } from './pages/delivery-preview/delivery-preview.component';
import { ErrorScreenComponent } from './pages/error-screen/error-screen.component';
import { PostAuthComponent } from './pages/post-auth/post-auth.component';
import { PostCreatorComponent } from './pages/post-creator/post-creator.component';
import { PostEditComponent } from './pages/post-edit/post-edit.component';
import { PostPreviewComponent } from './pages/post-preview/post-preview.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { RedirectionsComponent } from './pages/redirections/redirections.component';
import { UserContactLandingComponent } from './pages/user-contact-landing/user-contact-landing.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { UserOrdersComponent } from './pages/user-dashboard/user-orders/user-orders.component';
import { MallDashboardComponent } from './pages/mall-dashboard/mall-dashboard.component';
import { MallGiftsComponent } from './pages/mall-dashboard/mall-gifts/mall-gifts.component';
import { MallStoresComponent } from './pages/mall-dashboard/mall-stores/mall-stores.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'container-form/:merchantId/:tagId',
    component: ContainerFormComponent,
  },
  {
    path: 'data-list/:id',
    component: DataListComponent,
  },
  {
    path: 'data-list',
    component: DataListComponent,
  },
  {
    path: 'delivery-preview',
    component: DeliveryPreviewComponent,
  },
  {
    path: 'error-screen',
    component: ErrorScreenComponent,
  },
  {
    path: 'post-auth',
    component: PostAuthComponent,
  },
  {
    path: 'post-creator',
    component: PostCreatorComponent,
  },
  {
    path: 'post-edit/:postId',
    component: PostEditComponent,
  },
  {
    path: 'post-edit',
    component: PostEditComponent,
  },
  {
    path: 'post-preview',
    component: PostPreviewComponent,
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
  {
    path: 'redirections',
    component: RedirectionsComponent,
  },
  {
    path: 'user-contact-landing/:id',
    component: UserContactLandingComponent,
  },
  {
    path: 'user-dashboard',
    component: UserDashboardComponent,
    children: [
      {
        path: 'tiendas',
        component: UserOrdersComponent,
      },
    ],
  },
  {
    path: 'mall-dashboard',
    component: MallDashboardComponent,
    children: [
      {
        path: 'gifts',
        component: MallGiftsComponent,
      },
      {
        path: 'stores',
        component: MallStoresComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    LandingComponent,
    ContainerFormComponent,
    DataListComponent,
    DeliveryPreviewComponent,
    ErrorScreenComponent,
    PostAuthComponent,
    PostCreatorComponent,
    PostEditComponent,
    PostPreviewComponent,
    PrivacyPolicyComponent,
    RedirectionsComponent,
    UserContactLandingComponent,
    UserDashboardComponent,
    UserOrdersComponent,
    MallDashboardComponent,
    MallGiftsComponent,
    MallStoresComponent
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class OthersModule {}
