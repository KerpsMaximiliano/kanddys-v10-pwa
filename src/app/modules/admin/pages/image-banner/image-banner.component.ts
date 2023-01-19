import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Banner, BannerInput } from 'src/app/core/models/banner';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { BannersService } from 'src/app/core/services/banners.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';

export function imagesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return !control.value ? { images: { value: control.value } } : null;
  };
}

@Component({
  selector: 'app-image-banner',
  templateUrl: './image-banner.component.html',
  styleUrls: ['./image-banner.component.scss']
})
export class ImageBannerComponent implements OnInit, OnDestroy {
  createTagForm: FormGroup = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.pattern(/[\S]/),
    ]),
    visibility: new FormControl('active', [Validators.required]),
    images: new FormControl(null),
  });
  entity: 'item' | 'order' = 'order';
  icon = {
    filter: 'invert(100%) sepia(25%) saturate(50%) hue-rotate(10deg) brightness(100%) contrast(100%)',
    height: 21,
    src: '/arrow-double-up.svg',
    width: 16
  };
  sub:Subscription;
  bannerId:string;


  constructor(
    private _BannersService: BannersService,
    private _Router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private _MerchantsService: MerchantsService,
    private _SaleFlowService: SaleFlowService
  ) {}

  ngOnInit():void {
    this.sub = this._ActivatedRoute.queryParams.subscribe(({ bannerId }) => {
      this.bannerId = bannerId;
      if(this.bannerId){
        (async () => {
          const paginate: PaginationInput = {
            options: {
              limit: -1,
              sortBy: 'createdAt:desc',
            },
            findBy: {
              id: this.bannerId
            }
          }
          const [result]:any = await this._BannersService.banners(paginate);
          const { description, image } = result || {};
          this.createTagForm.get('images').setValue(image);
          this.createTagForm.get('name').setValue(description);
        })();
      }
      this.icon['callback'] = 
      (async () => {
        if(this.createTagForm.invalid)  return;
        const banner:BannerInput = {
          description: this.createTagForm.get('name').value,
          image: this.createTagForm.get('images').value,
          type: 'image'
        };
        const { _id, ...result }: Banner = await (this.bannerId?this._BannersService.updateBanner(this.bannerId, banner):this._BannersService.createBanner(banner));
        const queryParams = {
          bannerId: _id
        };
        
        
        const { _id: merchantId } = await this._MerchantsService.merchantDefault();
        const { merchant } = await this._SaleFlowService.saleflowDefault(merchantId);
        const { slug } = merchant;
        this._Router.navigate(['ecommerce', slug,'post-edition'],{
          queryParams
        });
      });
    });
  }

  ngOnDestroy():void {
    this.sub.unsubscribe();
  }

  handleImageInput(value: any, operation: 'ADD' | 'DELETE') {
    if (operation === 'ADD' && value instanceof FileList) {
      this.createTagForm.controls.images.setValue(value[0], {
        emitEvent: false,
      });
    } else {
      this.createTagForm.controls.images.setValue([''], {
        emitEvent: false,
      });
    }
  }
}
