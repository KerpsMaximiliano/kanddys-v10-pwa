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
import { OptionAnswerSelector } from 'src/app/shared/components/answer-selector/answer-selector.component';
import { SetConfigComponent } from 'src/app/shared/dialogs/set-config/set-config.component';
import { StoreShareList } from '../../../../shared/dialogs/store-share/store-share.component';
import { ItemSettingsComponent } from 'src/app/shared/dialogs/item-settings/item-settings.component';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  constructor(private dialog: DialogService) { }

  ngOnInit(): void { }

  tagTest : Tag[] = [ {
    messageNotify: 'prueba Nº1',
    counter: 3,
    name: 'Prueba Nº1 ',
    notify: true,
    user: 'patata',
    notifyUserOrder: true,
    notifyMerchantOrder: true,
    _id: 'skw45k10d21',
    createdAt: 'date',
    updatedAt: 'date'
  },
  {
    messageNotify: 'prueba Nº2',
    counter: 2,
    name: 'Prueba Nº2 ',
    notify: false,
    user: 'potat',
    notifyUserOrder: true,
    notifyMerchantOrder: true,
    _id: 'skw44k10d21',
    createdAt: 'date',
    updatedAt: 'date'
  },
  {
    messageNotify: 'prueba Nº3',
    counter: 33,
    name: 'Prueba Nº3 ',
    notify: true,
    user: 'apple',
    notifyUserOrder: true,
    notifyMerchantOrder: true,
    _id: 'skw46k10d21',
    createdAt: 'date',
    updatedAt: 'date'
  },
  {
    messageNotify: 'prueba Nº4',
    counter: 1,
    name: 'Prueba Nº4 ',
    notify: false,
    user: 'pear',
    notifyUserOrder: true,
    notifyMerchantOrder: true,
    _id: 'skw47k10d21',
    createdAt: 'date',
    updatedAt: 'date'
  },];

  questions: Questions[] = [{
            text: 'Pito'
        },
        {
            text: 'Pregunta 2'
        },
        {
            text: 'Pregunta 3/2'
        },
        {
            text: 'Pregunta 3'
        }
    ];

  testItem: any[] = [{
    name: {text:'Creating Happiness one gift at a time.'},
    subtitle: {text:'negro es un color'},
    
  },{
    name: {text:'Justifying your actions through memes is not the right thing to do'},
    subtitle: {text:'negro es un color no una raza, deja lo bobo \n Los patacones son lo maximos \n tercer texto'},   
  }];
  

  actionList: OptionAnswerSelector[] = [
    {
      value: 'Al venderse',
      status: true,
      icons: [
        {
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/closed-eye.svg',
          styles: {
            width: '21px',
            height: '21px',
            margin: '0px 0px 0px 18px',  
          },
          callback: () => console.log("clicked icon 1")
        },
        {
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp_verde.svg',
          styles: {
            width: '19px',
            height: '19px',
            margin: '0px 0px 0px 21px'
          },
          callback: () => console.log("clicked icon 2")
        },
        {
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/arrow-right.svg',
          styles: {
            width: '19px',
            height: '19px',
            margin: '0px 0px 0px 11px'
          },
          callback: () => console.log("clicked icon 3")
        }
      ]
    },
    {
      value: 'Después de la entrega ',
      status: true
    },
    {
      value: 'StatusID',
      status: true
    },
    {
      value: 'StatusID',
      status: true
    },
  ];

  onlyTags = [
    {
        messageNotify: 'prueba Nº1',
        counter: 3,
        name: 'Prueba Nº1 ',
        notify: true,
        user: 'patata',
        notifyUserOrder: true,
        notifyMerchantOrder: true,
        _id: 'skw45k10d21',
        createdAt: 'date',
        updatedAt: 'date'
    },
    {
        messageNotify: 'prueba Nº2',
        counter: 2,
        name: 'Prueba Nº2 ',
        notify: false,
        user: 'potat',
        notifyUserOrder: true,
        notifyMerchantOrder: true,
        _id: 'skw44k10d21',
        createdAt: 'date',
        updatedAt: 'date'
    },
    {
        messageNotify: 'prueba Nº3',
        counter: 33,
        name: 'Prueba Nº3 ',
        notify: true,
        user: 'apple',
        notifyUserOrder: true,
        notifyMerchantOrder: true,
        _id: 'skw46k10d21',
        createdAt: 'date',
        updatedAt: 'date',
        icon: {
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp_verde.svg',
          width: 15,
          height: 15
        }
    }, 
    {
        messageNotify: 'prueba Nº4',
        counter: 1,
        name: 'Prueba Nº4 ',
        notify: false,
        user: 'pear',
        notifyUserOrder: true,
        notifyMerchantOrder: true,
        _id: 'skw47k10d21',
        createdAt: 'date',
        updatedAt: 'date'
    },
    {
        messageNotify: 'prueba Nº5',
        counter: 1,
        name: 'Prueba Nº5 ',
        notify: false,
        user: 'pear',
        notifyUserOrder: true,
        notifyMerchantOrder: true,
        _id: 'skw47k10d21',
        createdAt: 'date',
        updatedAt: 'date'
    },
  ];

  openDialog() {
      /* const options: Array<any> = [{text:{text:'TAGS'}}, {text:{text:'STATUS'}}, {text:{text:'LO COMPRADO'}}, {text:{text:'COMPRADOR'}}];

      this.dialog.open(SetConfigComponent, {
      type: 'fullscreen-translucent',
      customClass: 'app-dialog',
      flags: ['no-header'],
      props:{
        title: {text:'Preferencia de Vistas'},
        subTitle: {text:'Personaliza el listado de tus ventas'},
        options
      }
    }); */


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
    /* const list: DashboardOption[] = [
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
    ]; */
    /* const list: StoreShareList[] = [
        {
            title: 'Eliminar Reservación?',
            description: 'DATE ID volverá a estar disponible para potenciales compradores al elimnarla.',
            message: 'Si, Eliminar'
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
    }); */

    /* this.dialog.open(ItemDashboardOptionsComponent, {
      type: 'fullscreen-translucent',
      props: {
        list
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    }); */
    // ------- Para verificar la task 958
    /* this.dialog.open(GeneralFormSubmissionDialogComponent, {
      type: 'centralized-fullscreen',
      props: {
        icon: 'check-circle.svg'
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    }); */
    
    const content: any = [
        {
        text: 'Adicionar nuevo artículo',
        callback: () =>{
            console.log('opcion 1');
          }
        },
        {
        text: 'Incluir artículos en otras categorias',
        callback: () =>{
            console.log('opcion 2');
          }
        },
        {
        text: 'Eliminar artículos',
        callback: () =>{
            console.log('opcion 3');
          }
        },
        {
        text: 'Compartir un grupo de artículos',
        callback: () =>{
            console.log('opcion 4');
          }
        },
    ];

    this.dialog.open(ItemSettingsComponent, {
        type: 'fullscreen-translucent',
        customClass: 'app-dialog',
        flags: ['no-header'],
        props:{
          header: {text: 'Artículos'},
          content
        }
    });

  }

  log = () => {
    console.log("you clicked on somethin")
  }

  touched(){
    console.log('Hiciste click ;)');
    console.log(this.tagTest[2].user);
  }

  testing(){
    console.log('uwu')
  }

  displau(){
    console.log('Clickaste display');
  } 
}

