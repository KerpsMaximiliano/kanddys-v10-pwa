import { Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
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
  supplierSpecificItems: Record<string, Item> = {};
  selectedItems: Array<string> = [];
  itemsToShow: Array<Item> = [];
  itemsForm: FormGroup = this.formBuilder.group({
    searchbar: [''],
    checkboxes: this.formBuilder.array([]),
  });
  filteredItemIndexInTheFullItemArray: Record<number, number> = []; //itemstoshow index 4 => items index 1
  createdCheckboxes: boolean = false;
  currentView: 'ALL_ITEMS' | 'SELECTED_ITEMS' = 'ALL_ITEMS';
  quotation: Quotation = null;
  supplierMode: boolean = false;
  createQuotationFromExistingQuotation: boolean = false;
  updatingTemporalQuotation: boolean = false;
  playVideoOnFullscreen = playVideoOnFullscreen;
  mode:
    | 'QUOTATION_CREATION_WITH_USER_SESSION'
    | 'QUOTATION_CREATION_WITHOUT_USER_SESSION'
    | 'QUOTATION_UPDATE'
    | 'QUOTATION_UPDATE_WITHOUT_USER_SESSION'
    | 'NEW_QUOTATION_BASED_ON_EXISTING_QUOTATION' =
    'QUOTATION_CREATION_WITHOUT_USER_SESSION';

  constructor(
    private itemsService: ItemsService,
    private formBuilder: FormBuilder,
    private saleflowService: SaleFlowService,
    private quotationService: QuotationsService,
    private merchantService: MerchantsService,
    private appService: AppService,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    if (localStorage.getItem('session-token')) {
      if (!this.headerService.user) {
        let sub = this.appService.events
          .pipe(filter((e) => e.type === 'auth'))
          .subscribe(async (e) => {
            await this.executeInitProcesses();

            sub.unsubscribe();
          });
      } else await this.executeInitProcesses();
    } else await this.executeInitProcesses();
  }

  async executeInitProcesses() {
    this.route.params.subscribe(async ({ quotationId }) => {
      this.route.queryParams.subscribe(
        async ({
          supplierMode,
          createQuotationFromExistingQuotation,
          updatingTemporalQuotation,
        }) => {
          this.supplierMode = JSON.parse(supplierMode || 'false');
          this.createQuotationFromExistingQuotation = JSON.parse(
            createQuotationFromExistingQuotation || 'false'
          );
          this.updatingTemporalQuotation = JSON.parse(
            updatingTemporalQuotation || 'false'
          );

          const pagination: PaginationInput = {
            findBy: {
              type: 'supplier',
              approvedByAdmin: true,
            },
            options: {
              sortBy: 'createdAt:desc',
              limit: -1,
              page: 1,
            },
          };

          lockUI();

          try {
            if (quotationId) {
              //For when you're editing an existing quotation
              this.quotation = await this.quotationService.quotation(
                quotationId
              );

              this.mode = this.createQuotationFromExistingQuotation
                ? 'NEW_QUOTATION_BASED_ON_EXISTING_QUOTATION'
                : 'QUOTATION_UPDATE';

              if (this.mode === 'QUOTATION_UPDATE') {
                await this.headerService.checkIfUserIsAMerchantAndFetchItsData();
                this.quotationService.quotationToUpdate = this.quotation;
              }

              this.selectedItems = this.quotation.items;
              this.quotationService.selectedItemsForQuotation =
                this.selectedItems;
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

              this.itemsToShow = JSON.parse(JSON.stringify(this.items)).filter((item) =>
                this.selectedItems.includes(item._id)
              );

              this.assignCheckboxesIndexes();
            } else {
              //New quotations based on existing supplier items
              this.mode = this.headerService.isUserLogged()
                ? 'QUOTATION_CREATION_WITH_USER_SESSION'
                : 'QUOTATION_CREATION_WITHOUT_USER_SESSION';

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

              if (this.updatingTemporalQuotation) {
                this.mode = 'QUOTATION_UPDATE_WITHOUT_USER_SESSION';

                this.selectedItems =
                  this.quotationService.selectedTemporalQuotation.items;
                this.quotationService.selectedItemsForQuotation =
                  this.selectedItems;

                this.currentView = 'SELECTED_ITEMS';

                this.itemsToShow = JSON.parse(JSON.stringify(this.items)).filter((item) =>
                  this.selectedItems.includes(item._id)
                );
              }

              this.assignCheckboxesIndexes();
            }
          } catch (error) {
            console.error(error);
            this.showErrorMessage();
          }

          unlockUI();

          this.createCheckboxes();

          if (this.quotationService.selectedItemsForQuotation.length) {
            this.selectedItems =
              this.quotationService.selectedItemsForQuotation;

            if (this.selectedItems.length) {
              const selectedItemIds = {};

              this.selectedItems.forEach(
                (selectedItem) => (selectedItemIds[selectedItem] = true)
              );

              this.itemsToShow.forEach((item, index) => {
                //checkboxes.push(this.formBuilder.control(false));
                if (selectedItemIds[item._id]) {
                  this.setValueAtIndex(
                    this.filteredItemIndexInTheFullItemArray[index],
                    true
                  );
                } else {
                  this.setValueAtIndex(
                    this.filteredItemIndexInTheFullItemArray[index],
                    false
                  );
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
                this.itemsToShow = JSON.parse(JSON.stringify(this.items)).filter(
                  (item) =>
                    item.name?.toLowerCase().includes(value.toLowerCase()) ||
                    item.description
                      ?.toLowerCase()
                      .includes(value.toLowerCase())
                );
              }
              this.assignCheckboxesIndexes();

              if (this.selectedItems.length) {
                const selectedItemIds = {};

                this.selectedItems.forEach(
                  (selectedItem) => (selectedItemIds[selectedItem] = true)
                );

                this.items.forEach((item, index) => {
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

          if (this.supplierMode && this.headerService.user) {
            await this.getItemsForCurrentSupplier();
          }
        }
      );
    });
  }

  assignCheckboxesIndexes() {
    this.filteredItemIndexInTheFullItemArray = {};
    this.items.forEach((item, index) => {
      this.itemsToShow.forEach((itemInFilteredList, index2) => {
        if (itemInFilteredList._id === item._id)
          this.filteredItemIndexInTheFullItemArray[index2] = index;
      });
    });
  }

  getItemsForCurrentSupplier = async () => {
    await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

    const supplierSpecificItemsInput: PaginationInput = {
      findBy: {
        merchant: this.merchantService.merchantData._id,
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: -1,
        page: 1,
      },
    };

    let supplierItems: Array<Item> = (
      await this.itemsService.listItems(supplierSpecificItemsInput)
    )?.listItems;
    supplierItems = supplierItems.filter((item) => item.parentItem);

    for (const item of supplierItems) {
      this.supplierSpecificItems[item.parentItem] = item;
    }
  };

  goToArticleDetail(item: Item) {
    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    this.router.navigate(
      [
        `ecommerce/${
          item.merchant.slug || item.merchant._id
        }/article-detail/item/${item._id}`,
      ],
      {
        queryParams: {
          supplierPreview: true,
        },
      }
    );
  }

  setSelectedItems = (value: Array<string>) => {
    this.selectedItems = [];
    this.quotationService.selectedItemsForQuotation = [];

    value.forEach((isSelected, index) => {
      if (isSelected) this.selectedItems.push(this.items[index]._id);
    });

    this.quotationService.selectedItemsForQuotation = this.selectedItems;
  };

  changeView() {
    this.currentView =
      this.currentView === 'ALL_ITEMS' ? 'SELECTED_ITEMS' : 'ALL_ITEMS';

    if (this.currentView === 'SELECTED_ITEMS') {
      this.itemsToShow = JSON.parse(JSON.stringify(this.items)).filter((item) =>
        this.selectedItems.includes(item._id)
      );
    } else {
      this.itemsToShow = JSON.parse(JSON.stringify(this.items));
    }

    this.assignCheckboxesIndexes();

    if (this.selectedItems.length) {
      const selectedItemIds = {};

      this.selectedItems.forEach(
        (selectedItem) => (selectedItemIds[selectedItem] = true)
      );

      this.itemsToShow.forEach((item, index) => {
        //checkboxes.push(this.formBuilder.control(false));
        if (selectedItemIds[item._id]) {
          this.setValueAtIndex(
            this.filteredItemIndexInTheFullItemArray[index],
            true
          );
        } else {
          this.setValueAtIndex(
            this.filteredItemIndexInTheFullItemArray[index],
            false
          );
        }
      });
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
    if (this.headerService.flowRouteForEachPage['quotations-link']) {
      this.headerService.flowRoute =
        this.headerService.flowRouteForEachPage['quotations-link'];
      this.headerService.redirectFromQueryParams();

      delete this.headerService.flowRouteForEachPage['quotations-link'];
      return;
    }

    return this.router.navigate(['/ecommerce/club-landing']);
  }

  async submit() {
    lockUI();
    let quotationInput: QuotationInput = {
      name: `${new Date().toLocaleString()}`,
      items: this.selectedItems,
    };

    try {
      switch (this.mode) {
        case 'QUOTATION_CREATION_WITH_USER_SESSION':
          await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

          quotationInput.merchant = this.merchantService.merchantData._id;
          const createdQuotation = await this.quotationService.createQuotation(
            this.merchantService.merchantData._id,
            quotationInput
          );

          this.quotationService.selectedItemsForQuotation = [];

          this.router.navigate([
            `/ecommerce/quotation-bids/${createdQuotation._id}`,
          ]);
          unlockUI();
          break;
        case 'QUOTATION_CREATION_WITHOUT_USER_SESSION':
          this.quotationService.selectedItemsForQuotation = this.selectedItems;

          const temporalQuotationsStoredInLocalStorage =
            localStorage.getItem('temporalQuotations');
          let temporalQuotations: Array<QuotationInput> = null;

          if (!temporalQuotationsStoredInLocalStorage) {
            temporalQuotations = [];
          } else {
            const storedTemporalQuotations: any = JSON.parse(
              temporalQuotationsStoredInLocalStorage
            );

            if (Array.isArray(storedTemporalQuotations)) {
              temporalQuotations = storedTemporalQuotations;
            }
          }

          if (!temporalQuotations) {
            temporalQuotations = [];
          }

          temporalQuotations.push(quotationInput);

          this.quotationService.temporalQuotations = temporalQuotations;

          localStorage.setItem(
            'temporalQuotations',
            JSON.stringify(temporalQuotations)
          );

          this.quotationService.selectedItemsForQuotation = [];

          this.router.navigate(['/ecommerce/quotations']);
          unlockUI();
          break;
        case 'QUOTATION_UPDATE':
          quotationInput.merchant = this.merchantService.merchantData._id;
          quotationInput.name = this.quotation.name;

          await this.quotationService.updateQuotation(
            quotationInput,
            this.quotation._id
          );

          this.quotationService.selectedItemsForQuotation = [];

          this.quotationService.quotationToUpdate = null;

          unlockUI();
          this.router.navigate([
            `/ecommerce/quotation-bids/${this.quotation._id}`,
          ]);
          break;
        case 'QUOTATION_UPDATE_WITHOUT_USER_SESSION':
          {
            this.quotationService.selectedTemporalQuotation.items =
              this.selectedItems;

            const temporalQuotationsStoredInLocalStorage =
              localStorage.getItem('temporalQuotations');
            let temporalQuotations: Array<QuotationInput> = null;

            if (temporalQuotationsStoredInLocalStorage) {
              const storedTemporalQuotations: any = JSON.parse(
                temporalQuotationsStoredInLocalStorage
              );

              if (Array.isArray(storedTemporalQuotations)) {
                temporalQuotations = storedTemporalQuotations;

                const foundIndex = temporalQuotations.findIndex(
                  (quotation) =>
                    quotation.name ===
                    this.quotationService.selectedTemporalQuotation.name
                );

                if (this.selectedItems.length === 0 && foundIndex >= 0) {
                  if (foundIndex >= 0) temporalQuotations.splice(foundIndex, 1);

                  this.quotationService.temporalQuotations = temporalQuotations;
                  this.quotationService.selectedTemporalQuotation = null;

                  localStorage.setItem(
                    'temporalQuotations',
                    JSON.stringify(temporalQuotations)
                  );

                  this.quotationService.selectedItemsForQuotation = [];

                  this.router.navigate(['/ecommerce/quotations']);
                }

                if (foundIndex >= 0) {
                  temporalQuotations[foundIndex].items = this.selectedItems;

                  this.quotationService.temporalQuotations = temporalQuotations;
                  this.quotationService.selectedTemporalQuotation =
                    temporalQuotations[foundIndex];

                  localStorage.setItem(
                    'selectedTemporalQuotation',
                    JSON.stringify(
                      this.quotationService.selectedTemporalQuotation
                    )
                  );

                  localStorage.setItem(
                    'temporalQuotations',
                    JSON.stringify(temporalQuotations)
                  );
                }
              }
            }

            unlockUI();

            this.quotationService.selectedItemsForQuotation = [];

            this.router.navigate(['/ecommerce/quotation-bids']);
          }
          break;
        case 'NEW_QUOTATION_BASED_ON_EXISTING_QUOTATION':
          break;
      }
    } catch (error) {
      console.error(error);
      this.showErrorMessage();
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
      layout: item.layout,
      description: item.description,
    };
    this.itemsService.temporalItem = item;

    if (this.supplierSpecificItems[item._id]) {
      return this.router.navigate(
        [
          '/ecommerce/inventory-creator/' +
            this.supplierSpecificItems[item._id]._id,
        ],
        {
          queryParams: {
            existingItem: true,
            updateItem: true,
          },
        }
      );
    }

    this.router.navigate(['/ecommerce/inventory-creator'], {
      queryParams: {
        existingItem: true,
      },
    });
  }

  private showErrorMessage(
    message: string = 'Oops! Algo salió mal, por favor intenta de nuevo más tarde'
  ) {
    const action = 'OK'; // You can customize the action if needed

    this.snackBar.open(message, action, {
      duration: 5000, // Adjust the duration of the snackbar as per your requirement
      panelClass: ['error-snackbar'], // CSS class for styling the snackbar
    });
  }
}
