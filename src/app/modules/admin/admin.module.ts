import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateItemComponent } from './pages/create-item/create-item.component';
import { EntityDetailMetricsComponent } from './pages/entity-detail-metrics/entity-detail-metrics.component';
import { MerchantItemsComponent } from './pages/merchant-items/merchant-items.component';
import { ItemDisplayComponent } from './pages/item-display/item-display.component';
import { ActionsMenuComponent } from './pages/actions-menu/actions-menu.component';
import { AdminComponent } from './admin/admin.component';
import { FacturasPrefacturasComponent } from './pages/facturas-prefacturas/facturas-prefacturas.component';

const routes: Routes = [
  {
    path: 'create-item',
    component: CreateItemComponent,
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'entity-detail-metrics', pathMatch: 'full' },
      {
        path: 'create-item/:itemId',
        component: CreateItemComponent,
      },
      {
        path: 'entity-detail-metrics',
        component: EntityDetailMetricsComponent,
        data: { animation: 'EntityDetailMetrics' },
      },
      {
        path: 'merchant-items',
        component: MerchantItemsComponent,
      },
      {
        path: 'item-display/:itemId',
        component: ItemDisplayComponent,
      },
      {
        path: 'item-display',
        component: ItemDisplayComponent,
      },
      {
        path: 'options/:itemId',
        component: ActionsMenuComponent,
      },
      {
        path: 'facturas',
        component: FacturasPrefacturasComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    CreateItemComponent,
    EntityDetailMetricsComponent,
    MerchantItemsComponent,
    ItemDisplayComponent,
    ActionsMenuComponent,
    AdminComponent,
    FacturasPrefacturasComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
