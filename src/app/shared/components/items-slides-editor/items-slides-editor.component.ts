import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { CroppResult } from '../image-editor/image-editor.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-items-slides-editor',
  templateUrl: './items-slides-editor.component.html',
  styleUrls: ['./items-slides-editor.component.scss'],
})
export class ItemsSlidesEditorComponent implements OnInit {
  itemId: string;

  constructor(
    public itemsService: ItemsService,
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private merchantsService: MerchantsService,
    private headerService: HeaderService,
    private toastsService: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(({ itemId }) => {
      this.itemId = itemId;

      if (
        !this.itemsService.temporalItemInput ||
        !this.itemsService.temporalItemInput.slides ||
        !this.itemsService.temporalItemInput?.slides?.length ||
        this.itemsService.temporalItemInput?.slides?.length === 0
      ) {
        this.router.navigate([
          `/ecommerce/${this.headerService.saleflow.merchant.slug}/cart`,
        ]);
      }
    });
  }

  async onEditSubmit(result: CroppResult) {
    console.log('result', result);
    try {
      const file = new File([result.blob], 'image.jpg', {
        type: 'image/jpg',
      });

      lockUI();

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = async (e) => {
        let result = reader.result;

        this.itemsService.temporalItemInput.slides[
          this.itemsService.editingSlide
        ]['background'] = result;

        this.itemsService.temporalItemInput.slides[
          this.itemsService.editingSlide
        ]['media'] = file;

        this.ngZone.run(() => {
          if (this.itemId) {
            this.router.navigate(
              [`/ecommerce/${this.merchantsService.merchantData.slug}/qr-edit`],
              {
                queryParams: {
                  articleId: this.itemId,
                  useSlidesInMemory: true,
                },
              }
            );
          } else {
            this.router.navigate(
              [`/ecommerce/${this.merchantsService.merchantData.slug}/qr-edit`],
              {
                queryParams: {
                  entity: 'item',
                },
              }
            );
          }
        });
      };
      unlockUI();
    } catch (error) {
      console.log('error', error);
      this.toastsService.error(
        'Ocurrio un error al editar la imagen, intenta de nuevo',
        null,
        {
          timeOut: 1500,
        }
      );
    }
  }
}
