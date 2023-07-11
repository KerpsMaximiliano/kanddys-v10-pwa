import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Quotation, QuotationInput } from 'src/app/core/models/quotations';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';

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

  constructor(
    private itemsService: ItemsService,
    private formBuilder: FormBuilder,
    private saleflowService: SaleFlowService,
    private quotationService: QuotationsService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(async ({quotationId}) => {

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

      if(quotationId) {
        this.quotation = await this.quotationService.quotation(quotationId);

        console.log("quotation", this.quotation);
      }

      lockUI();

      this.items = (await this.itemsService.listItems(pagination))?.listItems;

      unlockUI();

      this.items = this.items.filter((item) => !item.parentItem);

      this.itemsToShow = JSON.parse(JSON.stringify(this.items));

      this.createCheckboxes();
      this.itemsForm.controls['checkboxes'].valueChanges.subscribe((value) => {
        this.selectedItems = [];

        value.forEach((isSelected, index) => {
          if (isSelected) this.selectedItems.push(this.items[index]._id);
        });
      });

      this.itemsForm.controls['searchbar'].valueChanges.subscribe(
        (value: string) => {
          if (value === '')
            this.itemsToShow = JSON.parse(JSON.stringify(this.items));
          else {
            console.log('VALOR', value);

            this.itemsToShow = this.items.filter((item) =>
              item.name.toLowerCase().includes(value.toLowerCase())
            );
          }
        }
      );
    });
  }

  changeView() {
    this.currentView =
      this.currentView === 'ALL_ITEMS' ? 'SELECTED_ITEMS' : 'ALL_ITEMS';

    if (this.currentView === 'SELECTED_ITEMS') {
      this.itemsToShow = this.items.filter((item) =>
        this.selectedItems.includes(item._id)
      );
    }
  }

  createCheckboxes(): void {
    const checkboxes = this.itemsForm.get('checkboxes') as FormArray;
    this.items.forEach(() => checkboxes.push(this.formBuilder.control(false)));
    this.createdCheckboxes = true;
  }

  async submit() {
    lockUI();
    const quotation: QuotationInput = {
      name: 'Cotización de ' + new Date().toLocaleString(),
      merchant: this.saleflowService.saleflowData.merchant._id,
      items: this.selectedItems,
    };

    await this.quotationService.createQuotation(
      this.saleflowService.saleflowData.merchant._id,
      quotation
    );

    unlockUI();
  }
}
