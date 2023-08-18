import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-items-offers',
  templateUrl: './items-offers.component.html',
  styleUrls: ['./items-offers.component.scss']
})
export class ItemsOffersComponent implements OnInit {
  drawerOpened: boolean = false;
  itemSearchbar: FormControl = new FormControl('');
  showSearchbar: boolean = true;
  view: 'LIST' | 'SEARCH' = 'LIST';
  assetsURL: string = environment.assetsUrl;
  constructor(private dialog: MatDialog,
              ) { }

  ngOnInit(): void {
  }

  changeView = async (newView: 'LIST' | 'SEARCH') => {
    this.view = newView;

    if (newView === 'SEARCH') {
      setTimeout(() => {
        (
          document.querySelector(
            '#search-from-results-view'
          ) as HTMLInputElement
        )?.focus();
      }, 100);
    }
  };

  openAddButtonOptionsMenu(){}
  openHeaderDotOptions(){}
  goToStore(){}

  async addPrice() {
    let fieldsToCreate: FormData = {
      fields: [
        {
          label:
            '¿Cuál es el precio de tu Oferta Flash? (precio normal $xyzid)',
          name: 'price',
          type: 'currency',
          validators: [Validators.pattern(/[\S]/), Validators.min(0)],
        },
      ],
      buttonsTexts: {
        accept: 'Exhibirlo a los Miembros',
        cancel: 'Cancelar',
      },
      automaticallyFocusFirstField: true,
    };

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result.controls.price.valid) {
        const price = Number(result.value['price']);

      
          lockUI();
          unlockUI();
        }
      });
  }

}
