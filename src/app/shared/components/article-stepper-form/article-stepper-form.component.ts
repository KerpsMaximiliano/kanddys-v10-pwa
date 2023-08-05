import { Component, OnInit } from '@angular/core';
import { CommunitiesService } from 'src/app/core/services/communities.service';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';

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
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  itemForm = this._formBuilder.group({
    pricing: [null, Validators.required],
  });

  itemForm2 = this._formBuilder.group({
    images: [null, Validators.required],
  });

  itemForm3 = this._formBuilder.group({
    categories: [null, Validators.required, Validators.minLength(3)],
  });
  isLinear = false;

  allCommunities;
  options = [];
  merchantCategories = [];
  pricing: number;
  file;
  images;
  merchant;
  merchantId: string;
  itemCreated;
  base64: string;
  itemId: string;
  saleflow;
  saleflowId: string;
  saleflowDefault;

  async ngOnInit() {
    this.allCommunities = await this.communities.communitycategories({});
    console.log(this.allCommunities);

    for (let i = 0; i < this.allCommunities.communitycategories.length; i++) {
      this.options.push({
        status: true,
        click: true,
        value: this.allCommunities.communitycategories[i].name,
        description: this.allCommunities.communitycategories[i].description,
        valueStyles: {
          'font-family': 'SfProBold',
          'font-size': '17px',
          color: '#272727',
        },
      });

      console.log(this.options);
    }

    this.merchantId = await this.route.snapshot.queryParamMap.get('merchant');
    console.log(this.merchantId);

    // const authorize = await this.merchantsService.merchantAuthorize(
    //   this.merchantId
    // );
    // console.log(authorize);

    // this.merchant = await this.merchantsService.setDefaultMerchant(
    //   this.merchantId
    // );
    // console.log(this.merchant);

    // this.merchant = await this.merchantsService.merchantDefault();
    // console.log(this.merchant);
  }

  async authorizeMerchant() {
    // const authorize = await this.merchantsService.merchantAuthorize(
    //   this.merchantId
    // );
    // console.log(authorize);
    // this.merchant = await this.merchantsService.setDefaultMerchant(
    //   this.merchantId
    // );
    // console.log(this.merchant);
    // this.merchant = await this.merchantsService.merchantDefault();
    // console.log(this.merchant);
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

  async onImageInput(file) {
    this.file = file;
    console.log(this.file);
    this.base64 = await fileToBase64(file[0]);
    console.log(this.base64);
    console.log(this.base64);
    this.itemForm2.get('images').patchValue(this.file);
    let images: ItemImageInput[] = this.file.map((file) => {
      return {
        file: file,
        index: 0,
        active: true,
      };
    });

    this.images = images;

    const reader = new FileReader();
    reader.onload = (e) => {
      this._ItemsService.editingImageId = this.images[0]._id;
    };
    //reader.readAsDataURL(this.file[0] as File);

    // console.log(reader.result);
  }

  async closeDialog() {
    console.log(this.file);
    console.log(this.pricing);
    console.log(this.merchantId);
    console.log(this.merchantCategories);
    lockUI();
    const itemInput: ItemInput = {
      pricing: this.pricing,
      images: this.images,
      merchant: this.merchantId,
      categories: this.merchantCategories,
    };

    this.itemCreated = await this._ItemsService.createItem(itemInput);
    console.log(this.itemCreated);
    this.snackBar.open('Producto creado satisfactoriamente!', '', {
      duration: 5000,
    });
    console.log(this.itemCreated.createItem._id);
    this.itemId = this.itemCreated.createItem._id;

    this.saleflow = await this.saleflowService.createSaleflow({
      name: 'Dummy Name',
      headline: 'Dummy Headline',
      merchant: this.merchantId,
    });

    console.log(this.saleflow);

    this.saleflowId = this.saleflow.createSaleflow?._id;
    console.log(this.saleflowId);

    this.saleflowDefault = await this.saleflowService.setDefaultSaleflow(
      this.merchantId,
      this.saleflowId
    );

    console.log(this.saleflowDefault);

    const addItem = await this.saleflowService.addItemToSaleFlow(
      {
        item: this.itemId,
      },
      this.saleflowId
    );

    console.log(addItem);

    this.dialogRef.close();
    unlockUI();
    const reader = new FileReader();
    reader.onload = (e) => {
      this._ItemsService.editingImageId = this.itemCreated.images[0]._id;
    };
    //reader.readAsDataURL(this.file as File);

    this.router.navigate([
      `ecommerce/item-management/${this.itemCreated.createItem._id}`,
    ]);
  }
}
