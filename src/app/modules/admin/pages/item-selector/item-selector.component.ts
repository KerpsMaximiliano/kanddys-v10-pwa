import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { isVideo } from 'src/app/core/helpers/strings.helpers';
import {
  lockUI,
  playVideoOnFullscreen,
  unlockUI,
} from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Quotation, QuotationInput } from 'src/app/core/models/quotations';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';

@Component({
  selector: 'app-item-selector',
  templateUrl: './item-selector.component.html',
  styleUrls: ['./item-selector.component.scss'],
})
export class ItemSelectorComponent implements OnInit {
  items: Array<Item> = [];
  selectedItems: Array<string> = [];
  itemsToShow: Array<Item> = [];
  itemsForm: FormGroup = this.formBuilder.group({
    searchbar: [''],
    checkboxes: this.formBuilder.array([]),
  });
  createdCheckboxes: boolean = false;
  currentView: 'ALL_ITEMS' | 'SELECTED_ITEMS' = 'ALL_ITEMS';
  quotation: Quotation = null;
  supplierMode: boolean = false;
  playVideoOnFullscreen = playVideoOnFullscreen;

  constructor(
    private itemsService: ItemsService,
    private formBuilder: FormBuilder,
    private saleflowService: SaleFlowService,
    private quotationService: QuotationsService,
    private merchantService: MerchantsService,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(async ({ quotationId }) => {
      this.route.queryParams.subscribe(async ({ supplierMode }) => {
        this.supplierMode = Boolean(supplierMode);

        const pagination: PaginationInput = {
          findBy: {
            type: 'supplier',
          },
          options: {
            sortBy: 'createdAt:desc',
            limit: -1,
            page: 1,
          },
        };

        /*
      if (this.selectedTags.length)
        pagination.findBy.tags = this.selectedTags.map((tag) => tag._id);
      */
        lockUI();

        if (quotationId) {
          this.quotation = await this.quotationService.quotation(quotationId);

          this.selectedItems = this.quotation.items;
          this.items = (
            await this.itemsService.listItems(pagination)
          )?.listItems;
          this.items = this.items.filter((item) => !item.parentItem);

          this.items.forEach((item, itemIndex) => {
            item.images.forEach((image) => {
              if (!image.value.includes('http'))
                image.value = 'https://' + image.value;
            });

            this.items[itemIndex].images = item.images;
          });

          this.currentView = 'SELECTED_ITEMS';

          this.itemsToShow = this.items.filter((item) =>
            this.selectedItems.includes(item._id)
          );
        } else {
          this.items = (
            await this.itemsService.listItems(pagination)
          )?.listItems;

          this.items = this.items.filter((item) => !item.parentItem);

          this.items.forEach((item, itemIndex) => {
            item.images.forEach((image) => {
              if (!image.value.includes('http'))
                image.value = 'https://' + image.value;
            });

            this.items[itemIndex].images = item.images;
          });

          this.itemsToShow = JSON.parse(JSON.stringify(this.items));
        }

        unlockUI();

        this.createCheckboxes();

        if (this.quotationService.selectedItemsForQuotation.length) {
          this.selectedItems = this.quotationService.selectedItemsForQuotation;

          if (this.selectedItems.length) {
            const selectedItemIds = {};

            this.selectedItems.forEach(
              (selectedItem) => (selectedItemIds[selectedItem] = true)
            );

            this.itemsToShow.forEach((item, index) => {
              //checkboxes.push(this.formBuilder.control(false));
              if (selectedItemIds[item._id]) {
                this.setValueAtIndex(index, true);
              } else {
                this.setValueAtIndex(index, false);
              }
            });
          }
        }

        this.itemsForm.controls['checkboxes'].valueChanges.subscribe(
          this.setSelectedItems
        );

        this.itemsForm.controls['searchbar'].valueChanges.subscribe(
          (value: string) => {
            if (value === '') {
              this.itemsToShow = JSON.parse(JSON.stringify(this.items));
            } else {
              this.itemsToShow = this.items.filter((item) =>
                item.name.toLowerCase().includes(value.toLowerCase())
              );
            }

            if (this.selectedItems.length) {
              const selectedItemIds = {};

              this.selectedItems.forEach(
                (selectedItem) => (selectedItemIds[selectedItem] = true)
              );

              this.itemsToShow.forEach((item, index) => {
                //checkboxes.push(this.formBuilder.control(false));
                if (selectedItemIds[item._id]) {
                  this.setValueAtIndex(index, true);
                } else {
                  this.setValueAtIndex(index, false);
                }
              });
            }
          }
        );
      });
    });
  }

  goToArticleDetail(itemID: string) {
    this.router.navigate(
      [
      `ecommerce/${this.merchantService.merchantData.slug}/article-detail/item/${itemID}`,
      ],
      {
        queryParams: {
          supplierPreview: true
        }
      }
    );
  }

  setSelectedItems = (value: Array<string>) => {
    this.selectedItems = [];
    this.quotationService.selectedItemsForQuotation = [];

    value.forEach((isSelected, index) => {
      const isIncludedInItemsToShow = this.itemsToShow.find(
        (item) => isSelected && item._id === this.items[index]._id
      );

      if (isIncludedInItemsToShow)
        this.selectedItems.push(this.items[index]._id);
    });
  };

  changeView() {
    this.currentView =
      this.currentView === 'ALL_ITEMS' ? 'SELECTED_ITEMS' : 'ALL_ITEMS';

    if (this.currentView === 'SELECTED_ITEMS') {
      this.itemsToShow = this.items.filter((item) =>
        this.selectedItems.includes(item._id)
      );
    } else {
      this.itemsToShow = JSON.parse(JSON.stringify(this.items));
    }
  }

  createCheckboxes(): void {
    const checkboxes = this.itemsForm.get('checkboxes') as FormArray;
    this.items.forEach(() => checkboxes.push(this.formBuilder.control(false)));
    this.createdCheckboxes = true;

    if (this.quotation && this.selectedItems.length) {
      this.items.forEach((item, index) => {
        //checkboxes.push(this.formBuilder.control(false));

        this.selectedItems.forEach((selectedItem) => {
          if (selectedItem === item._id) {
            this.setValueAtIndex(index, true);
          }
        });
      });
    }
  }

  setValueAtIndex(index: number, value: any): void {
    const checkboxes = this.itemsForm.get('checkboxes') as FormArray;
    checkboxes.setControl(index, new FormControl(value));
  }

  back() {
    this.location.back();
  }

  async submit() {
    lockUI();
    const quotationInput: QuotationInput = {
      name: `${new Date().toLocaleString()}`,
      merchant: this.saleflowService.saleflowData.merchant._id,
      items: this.selectedItems,
    };

    try {
      if (!this.quotation) {
        await this.quotationService.createQuotation(
          this.saleflowService.saleflowData.merchant._id,
          quotationInput
        );

        this.router.navigate(['/admin/quotations']);
        unlockUI();
      } else {
        await this.quotationService.updateQuotation(
          quotationInput,
          this.quotation._id
        );

        this.quotationService.selectedItemsForQuotation = [];

        unlockUI();
        this.router.navigate(['/admin/quotations']);
      }
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  openFormForField() {
    let fieldsToCreate: FormData = {
      fields: [],
    };

    fieldsToCreate.fields = [
      {
        label: 'Nombre del producto',
        name: 'product-name',
        type: 'text',
        validators: [Validators.pattern(/[\S]/)],
      },
    ];

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe((result: FormGroup) => {
      if (result && result.value['product-name']) {
        this.itemsService.temporalItemInput = {
          name: result.value['product-name'],
        };

        this.router.navigate(['/ecommerce/inventory-creator']);
        /*
        this.itemFormData.patchValue({
          title: result.value['item-title'],
        });*/
      }
    });
  }

  toggleItemSelection(index: number) {
    const checkboxes = this.itemsForm.get('checkboxes') as FormArray;
    const currentValue = checkboxes.value[index];
    checkboxes.at(index).patchValue(!currentValue);
  }

  isVideoWrapper(filename: string) {
    return isVideo(filename);
  }

  createItemBasedOnExistingSupplierItems(item: Item) {
    this.itemsService.temporalItemInput = {
      name: item.name,
      pricing: item.pricing,
      layout: item.layout,
    };
    this.itemsService.temporalItem = item;

    this.router.navigate(['/ecommerce/inventory-creator'], {
      queryParams: {
        existingItem: true,
      },
    });
  }
}
