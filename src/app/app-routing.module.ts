import { PartnerReceiptsComponent } from './shared/pages/partner-receipts/partner-receipts.component';
import { InvitationComponent } from './shared/pages/invitation/invitation.component';
import { AuthGuard } from './core/guards/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './shared/pages/home/home.component';

const redirectTo = '/';
const routes: Routes = [
  { path: '', redirectTo, pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
  },
  { path: 'invitation/community/:identifier', component: InvitationComponent },
  {
    path: 'partner/receipts/:id',
    component: PartnerReceiptsComponent,
    data: { fullscreen: true },
  },
  { path: '**', redirectTo, pathMatch: 'full' },
  {
    path: 'ecommerce',
    loadChildren: () =>
      import('./modules/ecommerce/ecommerce.module').then(
        (m) => m.EcommerceModule
      ),
  },
  {
    path: 'posts',
    loadChildren: () =>
      import('./modules/posts/posts.module').then((m) => m.PostsModule),
  },
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
