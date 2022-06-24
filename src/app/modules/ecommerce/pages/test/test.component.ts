import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CustomFieldsComponent } from 'src/app/shared/dialogs/custom-fields/custom-fields.component';
import { MagicLinkDialogComponent } from 'src/app/shared/components/magic-link-dialog/magic-link-dialog.component';
import { CollaborationsComponent } from 'src/app/shared/dialogs/collaborations/collaborations.component';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import { ItemDashboardOptionsComponent, DashboardOption } from 'src/app/shared/dialogs/item-dashboard-options/item-dashboard-options.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  constructor(private dialog: DialogService) { }

  ngOnInit(): void { }

  openDialog() {
    // this.dialog.open(CustomFieldsComponent, {
    //   type: 'flat-action-sheet',
    //   customClass: 'app-dialog',
    //   flags: ['no-header'],
    // });

    // this.dialog.open(MagicLinkDialogComponent, {
    //   type: 'flat-action-sheet',
    //   customClass: 'app-dialog',
    //   flags: ['no-header'],
    // });
    // this.dialog.open(CollaborationsComponent, {
    //   type: 'flat-action-sheet',
    //   customClass: 'app-dialog',
    //   flags: ['no-header'],
    // });
    // +++++++ Para verificar la task 958
    const list: DashboardOption[] = [
        {
        button: {
            text: 'Half Button'
        },
        title:'El leer es importante',
        content:[
            {
              headline: 'Item',
              icon: {
                src: '/upload.svg',
                width: 20,
                height: 17
              },
              description: '$10.00 por cada 100 veces que lo vendas para facilitarte formas de pago al comprador, tu base de datos para reventas, automatización de mensajes por WhatsApp* según el proceso y mas.'
            },
            {
              headline: 'Categoria',
              icon: {
                src: '/upload.svg',
                width: 20,
                height: 17
              },
              description: '$10.00 por cada 100 veces que lo vendas para facilitarte formas de pago al comprador, tu base de datos para reventas, automatización de mensajes por WhatsApp* según el proceso y mas.'
            },
            {
             headline: 'Gift-Card',
             icon: {
               src: '/upload.svg',
               width: 20,
               height: 17
             },
             description: '$10.00 después de 100 pagos que recibas.'
            },
            {
               headline: 'Vouchers',
               icon: {
                 src: '/upload.svg',
                 width: 20,
                 height: 17
               },
               description: '$10.00 después de 100 pagos que recibas.'
            }
        ] 
        }
    ];

    this.dialog.open(ItemDashboardOptionsComponent, {
      type: 'fullscreen-translucent',
      props: {
        list
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
    // ------- Para verificar la task 958
    /* this.dialog.open(GeneralFormSubmissionDialogComponent, {
      type: 'centralized-fullscreen',
      props: {
        icon: 'check-circle.svg'
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    }); */
  }
}

