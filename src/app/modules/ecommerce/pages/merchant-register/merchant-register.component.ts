import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importar FormGroup y FormBuilder
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { CommunityCategory } from 'src/app/core/models/community-categories';
import { Merchant } from 'src/app/core/models/merchant';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommunitiesService } from 'src/app/core/services/communities.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { TagFilteringComponent } from 'src/app/shared/dialogs/tag-filtering/tag-filtering.component';

interface Option {
    value: string;
    viewValue: string;
};

@Component({
    selector: 'app-merchant-register',
    templateUrl: './merchant-register.component.html',
    styleUrls: ['./merchant-register.component.scss']
})
export class MerchantRegisterComponent implements OnInit {
    merchantForm: FormGroup; // Crear un FormGroup

    countries: Option[] = [
        { value: 'country-0', viewValue: 'US' },
        { value: 'country-1', viewValue: 'UK' },
        { value: 'country-2', viewValue: 'Italy' },
    ];

    cities: Option[] = [
        { value: 'city-0', viewValue: 'New York' },
        { value: 'city-1', viewValue: 'London' },
        { value: 'city-2', viewValue: 'Paris' },
    ];

    merchant: Merchant;
    user: User;
    credentials: string;
    type: string;

    categories: CommunityCategory[] = [];
    selectedCategories: CommunityCategory[] = [];

    constructor(
      private merchantsService: MerchantsService,
      private authService: AuthService,
      private communityCategories: CommunitiesService,
      private router: Router,
      private route: ActivatedRoute,
      private fb: FormBuilder,
      private snackBar: MatSnackBar,
      private _bottomSheet: MatBottomSheet
    ) {
        this.merchantForm = this.fb.group({
          name: ['', Validators.required],
          phone: ['', Validators.required],
          country: ['', Validators.required],
          city: ['', Validators.required],
          industry: [''],
        });
    }

    ngOnInit(): void {
      this.route.queryParams.subscribe(async ({ credentials, type }) => {
        if (credentials) this.credentials = credentials;
        if (type) this.type = type;

        await this.getCategories();
      });
    }

    async saveData() {
      // Aquí puedes implementar la lógica para guardar los datos
      const formData = this.merchantForm.value;
      console.log(formData);

      if (this.merchantForm.valid) {
        lockUI();
        await this.createUser(formData.phone, this.credentials);
        console.log(this.user);
        if (this.user) {
          const categories = this.selectedCategories.map(category => category._id);
          await this.createMerchant(formData.name, this.user._id, categories);
          if (this.merchant) await this.generateMagicLink(this.credentials);
          unlockUI();
        }
      }
    }

    private async createUser(
      phone: string,
      email?: string
    ) {
      try {
        const result = await this.authService.signup(
          {
            phone: phone,
            email: email
          },
          'none'
        );
        if (result) this.user = result;
      } catch (error) {
        console.log(error);
        unlockUI();
      }
    }

    private async createMerchant(
      name: string,
      userID: string,
      categories?: string[]
    ) {
      try {
        const result = await this.merchantsService.createMerchant({
          name: name,
          categories: categories,
          owner: userID
        });

        if (result) this.merchant = result.createMerchant;
      } catch (error) {
        console.log(error);
        unlockUI();
      }
    }

    private async generateMagicLink(credentials: string) {
      const validEmail = new RegExp(
        /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/gim
      );

      let emailOrPhone = null;

      if (validEmail.test(credentials))
        emailOrPhone = credentials;

      try {
        await this.authService.generateMagicLink(
          emailOrPhone,
          '/ecommerce/club-landing',
          null,
          'MerchantAccess',
          {
            jsondata: JSON.stringify({
              openNavigation: true,
            }),
          },
          []
        );
        this.snackBar.open(
          'Se ha enviado un link de confirmación a tu correo electrónico',
          'Close',
          {
            duration: 5000,
          }
        );
      } catch (error) {
        console.log(error);
      }
    }

    private async getCategories() {
      try {
        const result = await this.communityCategories.communitycategoriesPaginate({
          findBy: {
            type: "industry"
          },
          options: {
            limit: -1
          }
        });
        this.categories = result.results;
      } catch (error) {
        console.log(error);
      }
    }

    openCategoriesDialog() {
      const bottomSheetRef = this._bottomSheet.open(TagFilteringComponent, {
        data: {
          title: 'Industrias',
          titleIcon: {
            show: false,
          },
          categories: this.categories.map((category) => ({
            _id: category._id,
            name: category.name,
            selected: this.selectedCategories.some((c) => c._id === category._id),
          })),
        },
      });

      bottomSheetRef.instance.selectionOutput.subscribe(
        async (addedCategories: Array<string>) => {
          this.selectedCategories = this.categories.filter((category) => addedCategories.includes(category._id));

          const updatedValue = this.selectedCategories.map(category => category.name).join(', ');
          this.merchantForm.controls['industry'].setValue(updatedValue);
        }
      );
    }
}