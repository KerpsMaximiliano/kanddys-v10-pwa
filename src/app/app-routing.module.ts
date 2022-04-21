import { PartnerReceiptsComponent } from './shared/pages/partner-receipts/partner-receipts.component';
import { InvitationComponent } from './shared/pages/invitation/invitation.component';
import { AuthGuard } from './core/guards/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './shared/pages/home/home.component';

const redirectTo = '/home';
const routes: Routes = [
  { path: '', redirectTo, pathMatch: 'full' },
  { path: 'invitation/community/:identifier', component: InvitationComponent },
  {
    path: 'partner/receipts/:id',
    component: PartnerReceiptsComponent,
    data: { fullscreen: true },
  },
  {
    path: 'home',
    /*canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],*/
    component: HomeComponent
    //component: LandingComponent
  },
  {
    path: 'ecommerce',
    /*canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],*/
    loadChildren: () =>
      import('./modules/ecommerce/ecommerce.module').then(
        (m) => m.EcommerceModule
      ),
  },
  {
    path: 'posts',
    /*canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],*/
    loadChildren: () =>
      import('./modules/posts/posts.module').then(
        (m) => m.PostsModule
      ),
  },
  { path: '**', redirectTo, pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      paramsInheritanceStrategy: 'always',
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}