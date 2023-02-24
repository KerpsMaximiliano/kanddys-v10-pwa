import { Component, OnInit } from '@angular/core';
import { CommunitiesService } from 'src/app/core/services/communities.service';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-article-stepper-form',
  templateUrl: './article-stepper-form.component.html',
  styleUrls: ['./article-stepper-form.component.scss'],
})
export class ArticleStepperFormComponent implements OnInit {
  constructor(
    private communities: CommunitiesService,
    private _formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ArticleStepperFormComponent>,
    private merchantsService: MerchantsService,
    private _ItemsService: ItemsService,
    private saleflowService: SaleFlowService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  itemForm = this._formBuilder.group({
    pricing: [null, Validators.required],
    images: [null, Validators.required],
    categories: [null, Validators.required],
  });
  isLinear = false;

  allCommunities;
  options = [];
  merchantCategories = [];
  pricing: number;
  file;
  merchant;
  itemCreated;

  async ngOnInit() {
    this.merchant = await this.merchantsService.merchantDefault();
    console.log(this.merchant);
    this.allCommunities = await this.communities.communitycategories({});
    console.log(this.allCommunities);

    for (let i = 0; i < this.allCommunities.communitycategories.length; i++) {
      this.options.push({
        status: true,
        click: true,
        value: this.allCommunities.communitycategories[i].name,
        valueStyles: {
          'font-family': 'SfProBold',
          'font-size': '17px',
          color: '#272727',
        },
      });
    }
  }

  selectedCategory(i: number) {
    if (
      this.merchantCategories.includes(
        this.allCommunities.communitycategories[i]._id
      )
    ) {
      const index = this.merchantCategories.indexOf(
        this.allCommunities.communitycategories[i]._id
      );
      this.merchantCategories.splice(index, 1);
    } else {
      this.merchantCategories.push(
        this.allCommunities.communitycategories[i]._id
      );
    }

    console.log(this.merchantCategories);
  }

  onCurrencyInput(value: number) {
    this.pricing = value;
    this.itemForm.get('pricing').patchValue(this.pricing);
  }

  onImageInput(file) {
    this.file = file;
    this.itemForm.get('images').patchValue(this.file);
  }

  async closeDialog() {
    let images: ItemImageInput[] = this.file.map((file) => {
      return {
        file: file,
        index: 0,
        active: true,
      };
    });
    console.log(this.file);
    console.log(this.pricing);
    console.log(this.merchant._id);
    console.log(this.merchantCategories);
    lockUI();
    const itemInput: ItemInput = {
      pricing: this.pricing,
      images,
      merchant: this.merchant._id,
      // categories: this.merchantCategories,
    };

    this.itemCreated = await this._ItemsService.createItem(itemInput);
    console.log(this.itemCreated);
    this.snackBar.open('Producto creado satisfactoriamente!', '', {
      duration: 5000,
    });
    unlockUI();
    const reader = new FileReader();
    reader.onload = (e) => {
      this._ItemsService.editingImageId = this.itemCreated.images[0]._id;
      this.router.navigate([`admin/article-editor/${this.itemCreated._id}`]);
    };
    reader.readAsDataURL(this.file as File);
  }
}
