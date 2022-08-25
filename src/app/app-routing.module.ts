import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const redirectTo = '/home';
const routes: Routes = [
  { path: '', redirectTo, pathMatch: 'full' },
  // { path: 'invitation/community/:identifier', component: InvitationComponent },
  // {
  //   path: 'partner/receipts/:id',
  //   component: PartnerReceiptsComponent,
  //   data: { fullscreen: true },
  // },
  // {
  //   path: 'home',
  // canLoad: [AuthGuard],
  // canActivate: [AuthGuard],
  // canActivateChild: [AuthGuard],
  // component: HomeComponent
  // component: LandingComponent
  // },
  {
    path: 'admin',
    /*canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],*/
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'airtable',
    /*canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],*/
    loadChildren: () =>
      import('./modules/airtable/airtable.module').then(
        (m) => m.AirtableModule
      ),
  },
  {
    path: 'auth',
    /*canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],*/
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'ecommerce',
    /*canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],*/
    data: { animation: 'EcommerceModule' },
    loadChildren: () =>
      import('./modules/ecommerce/ecommerce.module').then(
        (m) => m.EcommerceModule
      ),
  },
  {
    path: 'others',
    /*canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],*/
    loadChildren: () =>
      import('./modules/others/others.module').then((m) => m.OthersModule),
  },
  {
    path: 'posts',
    /*canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],*/
    loadChildren: () =>
      import('./modules/posts/posts.module').then((m) => m.PostsModule),
  },
  {
    path: 'test',
    /*canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],*/
    loadChildren: () =>
      import('./modules/test/test.module').then((m) => m.TestModule),
  },
  {
    path: 'webforms',
    /*canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],*/
    loadChildren: () =>
      import('./modules/webforms/webforms.module').then(
        (m) => m.WebformsModule
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
