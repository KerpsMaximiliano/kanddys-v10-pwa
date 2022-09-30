import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CustomFieldsComponent } from 'src/app/shared/dialogs/custom-fields/custom-fields.component';
import { MagicLinkDialogComponent } from 'src/app/shared/components/magic-link-dialog/magic-link-dialog.component';
import { CollaborationsComponent } from 'src/app/shared/dialogs/collaborations/collaborations.component';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import { ItemDashboardOptionsComponent, DashboardOption } from 'src/app/shared/dialogs/item-dashboard-options/item-dashboard-options.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { Questions } from '../../../../shared/components/form-questions/form-questions.component';
import { Tag } from '../../../../core/models/tags';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { SetConfigComponent } from 'src/app/shared/dialogs/set-config/set-config.component';
import { StoreShareList } from '../../../../shared/dialogs/store-share/store-share.component';
import { ItemSettingsComponent } from 'src/app/shared/dialogs/item-settings/item-settings.component';
import { ReloadComponent } from 'src/app/shared/dialogs/reload/reload.component';
import { FormStep, FormField } from 'src/app/core/types/multistep-form';
import { FormControl } from '@angular/forms';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
   textSample: string = 'Al borrar las reservaciones las fechas involucradas volverán a estar disponible.';
  hourRangeInDays = {
    'MONDAY': [
      {from: 9, to: 11},
      {from: 14, to: 18}
    ],
    'TUESDAY': [
      {from: 9, to: 11},
      {from: 14, to: 18}
    ],
    'WEDNESDAY': [
      {from: 9, to: 11},
      {from: 14, to: 18}
    ],
    'THURSDAY': [
      {from: 9, to: 11},
      {from: 14, to: 18}
    ],
    'FRIDAY': [
      {from: 9, to: 11},
      {from: 14, to: 18}
    ],
    'SATURDAY': [
      {from: 9, to: 11},
      {from: 14, to: 15}
    ],
  };

  formSteps: Array<FormStep> = [
    {
      fieldsList: [
        {
          name: 'referenceImage',
          fieldControl: {
            type: 'single',
            control: new FormControl(['']),
          },
          label: 'Foto de referencia',
          inputType: 'file3',
          fileObjects: [],
          placeholder: 'sube una imagen',
          styles: {
            labelStyles: {
              paddingBottom: '26px',
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontFamily: 'RobotoRegular',
              fontSize: '16px',
              fontWeight: 500,
              padding: '0px',
              margin: '0px',
              marginBottom: '18px',
            },
            fieldStyles: {
              width: '157px',
              height: '137px',
              padding: '34px',
              textAlign: 'center',
            },
            containerStyles: {
              marginTop: '0px',
              paddingBottom: '60px',
            },
            innerContainerStyles: {
              width: '157px',
              textAlign: 'center',
            },
          },
        },
      ],
      hideHeader: true,
    }
  ]
  
  constructor(private dialog: DialogService) { }

  ngOnInit(): void { 
  }

  openDialog(){
 /*   const list: StoreShareList[] = [
        {
            title: 'ITEM ID',
            label: 'VISIBLE',
            options: [
                {
                    text: 'CREA UN NUEVO ARTICULO',
                    mode: 'func',
                    func() {
                        console.log('Este mueve la maraca');
                        // this.router.navigate([`admin/create-item`]);
                    },
                },
                {
                    text: 'VENDE ONLINE. COMPARTE EL LINK',
                    icon: {
                        src: '/upload.svg',
                        alt: 'icono de de compartir',
                        size:{
                            width: 14,
                            height: 14
                        }
                    },
                    mode: 'clipboard'
                },
                {
                    text: 'CERRAR SESIÓN',
                    mode: 'func',
                    func() {
                        console.log('aqui cierra sesión');
                        //this.authService.signout();
                    }
                }
            ]
        },
    ];

    this.dialog.open(StoreShareComponent, {
        type: 'fullscreen-translucent',
        props: {
          list,
          alternate: false
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
    });*/
    
    /* this.dialog.open(GeneralFormSubmissionDialogComponent, {
      type: 'centralized-fullscreen',
      props: {
        icon: 'sadFace.svg',
        message: 'Ocurrió un problema',
        showCloseButton: true
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    }); */

    this.dialog.open(SingleActionDialogComponent, {
      type: 'centralized-fullscreen',
      props:{
         extraTitle:'compradorID',
         title: 'Borrar Reservaciones?',
         buttonText: 'Borrar Reservación',
         mainText: this.textSample,
         mainButton: this.actionDialog
      },
      customClass: 'app-dialog',
      flags: ['no-header']
    })
  }

openDeleteDialog() {
   const list: StoreShareList[] = [
     {
       title: `Hay una nueva versión disponible`,
       description:
         'Se ha encontrado una nueva version de la pagina. ¿Desea actualizar?',
       message: 'Recargar Página',
       messageCallback: async () => {
         this.reload();
       },
     },
   ];

   this.dialog.open(StoreShareComponent, {
     type: 'fullscreen-translucent',
     props: {
       list,
       alternate: true,
       buttonText: 'Cerrar'
     },
     customClass: 'app-dialog',
     flags: ['no-header'],
     notCancellable: true
   });
 }
 
 reloadDialog(){
   this.dialog.open(ReloadComponent, {
      type: 'fullscreen-translucent',
      props: {
         closeEvent: ()=> {
            this.reload();
         }
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
      notCancellable: true
   });
 }

 reload() {
   window.location.reload();
 }

 actionDialog(e: string){
   console.log('Esta funcion esta aparte');
   console.log(e)
 }
}

