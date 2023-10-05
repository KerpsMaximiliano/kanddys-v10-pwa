import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CommunitiesService } from 'src/app/core/services/communities.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';

@Component({
  selector: 'app-profile-industries',
  templateUrl: './profile-industries.component.html',
  styleUrls: ['./profile-industries.component.scss'],
})
export class ProfileIndustriesComponent implements OnInit {
  industries: any = [];
  industriesAux: any = [];
  roles: any = [];
  merchant: any = {};
  searchVal = '';
  constructor(
    private communityService: CommunitiesService,
    private merchantsService: MerchantsService,
    private _bottomSheet: MatBottomSheet
  ) {}

  ngOnInit(): void {
    this.getMerchant();
    this.getIndustries();
    this.getRolesPublic();
  }
  async getMerchant() {
    let result = await this.merchantsService.merchantDefault();
    console.log(result);
    if (result != undefined) this.merchant = result;
  }
  async getIndustries() {
    let result = await this.communityService.communitycategoriesPaginate({
      findBy: { type: 'industry' },
    });
    console.log(result);
    if (result?.results != undefined) {
      this.industries = result.results;
      this.industriesAux = result.results;
    }
  }

  async getRolesPublic() {
    let result = await this.merchantsService.rolesPublic();
    if (result != undefined) this.roles = result;
  }
  openOptionsDialog(categoryId) {
    this._bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: `¿A quién usualmente le compras?`,
        options: [
          {
            value: `A floristería, tienda, florista o decorador`,
            callback: async () => {
              this.addRole('STORE');
              this.updateMerchant(categoryId)
            },
          },
          {
            value: `A proveedores que le venden a Floristerias, tiendas, floristas, etc..`,
            callback: () => {
              this.addRole('PROVIDER');
              this.updateMerchant(categoryId)
            },
          },
          {
            value: `A productor para importar o distribuir`,
            callback: () => {
              this.addRole('PRODUCTOR');
              this.updateMerchant(categoryId)
            },
          },
          {
            value: `A quienes le venden a los productores`,
            callback: () => {
              this.addRole('SUPPLIER');
              this.updateMerchant(categoryId)
            },
          },
        ],
        styles: {
          fullScreen: true,
        },
      },
    });
  }

  async addRole(roleCode) {
    let role = this.roles.find((e) => e.code == roleCode);
    if(!this.merchant.roles.some(e=>e._id==role._id))
     await this.merchantsService.merchantAddRole(role._id,this.merchant._id);
    
  }

  search() {
    if (this.searchVal.length > 0)
      this.industries = this.industriesAux.filter((e) =>
        e.name.includes(this.searchVal)
      );
    else this.industries = this.industriesAux;
  }

  updateMerchant(categoryId){
    this.merchantsService.updateMerchant({categories:[categoryId]},this.merchant._id);
  }
}
