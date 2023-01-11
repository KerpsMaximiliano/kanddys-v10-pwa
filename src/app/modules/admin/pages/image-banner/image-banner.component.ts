import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Banner, BannerInput } from 'src/app/core/models/banner';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { BannersService } from 'src/app/core/services/banners.service';

export function imagesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    console.log(control.value);
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
    private _ActivatedRoute: ActivatedRoute
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
          console.log('result: ', result);
          const { description, image } = result || {};
          this.createTagForm.get('images').setValue(image);
          this.createTagForm.get('name').setValue(description);
        })();
      }
      this.icon['callback'] = 
      (async () => {
        console.log('this.createTagForm.value: ', this.createTagForm.value);
        if(this.createTagForm.invalid)  return;
        const banner:BannerInput = {
          description: this.createTagForm.get('name').value,
          image: this.createTagForm.get('images').value,
        };
        const { _id, ...result }: Banner = await (this.bannerId?this._BannersService.updateBanner(this.bannerId, banner):this._BannersService.createBanner(banner));
        console.log('result: ', result);
        const queryParams = {
          bannerId: _id
        };
        this._Router.navigate(['admin','post-edition'],{
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
