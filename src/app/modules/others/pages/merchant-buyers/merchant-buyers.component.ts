import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SetConfigComponent } from 'src/app/shared/dialogs/set-config/set-config.component';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import { StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';

interface FakeTag{
    name: string;
    selected?: boolean;
    icon?: {
      src: string,
      callback?: () => void;
      width: number;
      height: number;
    };
}

@Component({
  selector: 'app-merchant-buyers',
  templateUrl: './merchant-buyers.component.html',
  styleUrls: ['./merchant-buyers.component.scss']
})
export class MerchantBuyersComponent implements OnInit {

  showTags: boolean = true;
  showSearch: boolean = true;
  searchValue: string;
  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  active: number = 0;
  tabs: string[] = ['ÚLTIMOS', 'MAYORES', 'REPITEN'];
  tags: FakeTag[] = [
    {
        name: 'Prueba Nº1 '
    },{
        name: 'Prueba Nº1 ',
        icon: {
            src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp_verde.svg',
            width: 15,
            height: 15
        }
    },{
        name: 'Prueba Nº1 '
    },{
        name: 'Prueba Nº1 ',
        icon: {
            src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp_verde.svg',
            width: 15,
            height: 15
        }
    }
    ];
  dummyItem: any[] =[
      { name:{ text: 'TOTALIDADES'},
        subtitle:{ text:'Ingresos: $123,456.87 DOP. Promedia $120 por factura. \n Facturas: 155. Actualmente promedia comprar c/20 días.' },
        extraSub: { text:'Ultima compra ocurrió hace 35 días. Antes de la última compra promediaba comprar cada 10 dias.' },
        tags:[{
            name: 'Prueba Nº1'
        },{
            name: 'Prueba Nº1 ',
            icon: {
                src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp_verde.svg',
                width: 15,
                height: 15
            }
        },{
            name: 'Prueba Nº1 '
        },{
            name: 'Prueba Nº1 ',
            icon: {
                src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp_verde.svg',
                width: 15,
                height: 15
            }
        }]
      },{ name:{ text: 'TOTALIDADES'},
        subtitle:{ text:'Ingresos: $123,456.87 DOP. Promedia $120 por factura. \n Facturas: 155. Actualmente promedia comprar c/20 días.' },
        extraSub: { text:'Ultima compra ocurrió hace 35 días. Antes de la última compra promediaba comprar cada 10 dias.' }
      },{ name:{ text: 'TOTALIDADES'},
        subtitle:{ text:'Ingresos: $123,456.87 DOP. Promedia $120 por factura. \n Facturas: 155. Actualmente promedia comprar c/20 días.' },
        extraSub: { text:'Ultima compra ocurrió hace 35 días. Antes de la última compra promediaba comprar cada 10 dias.' }
      },{ name:{ text: 'TOTALIDADES'},
        subtitle:{ text:'Ingresos: $123,456.87 DOP. Promedia $120 por factura. \n Facturas: 155. Actualmente promedia comprar c/20 días.' },
        extraSub: { text:'Ultima compra ocurrió hace 35 días. Antes de la última compra promediaba comprar cada 10 dias.' }
      },{ name:{ text: 'TOTALIDADES'},
        subtitle:{ text:'Ingresos: $123,456.87 DOP. Promedia $120 por factura. \n Facturas: 155. Actualmente promedia comprar c/20 días.' },
        extraSub: { text:'Ultima compra ocurrió hace 35 días. Antes de la última compra promediaba comprar cada 10 dias.' }
      },   
  ];

  trying: any ={ name:{ text: 'TOTALIDADES', fontFamily:'RobotoMedium', fontSize: '13px', color: '#7B7B7B' },
  subtitle:{ text:'Ingresos: $123,456.87 DOP. Promedia $120 por factura. \n Facturas: 155. Actualmente promedia comprar c/20 días.', fontFamily: 'SfProRegular',
      fontSize: '14px', color:'#7B7B7B' },
  extraSub: { text:'Ultima compra ocurrió hace 35 días. Antes de la última compra promediaba comprar cada 10 dias.', fontFamily: 'SfProRegular', fontSize: '14px',
      color:'#000000' }
}

  constructor( 
    private router: Router,
    private dialog: DialogService) { }

  ngOnInit(): void {
  }
  
  startDragging(e: MouseEvent, el: HTMLDivElement) {
      this.mouseDown = true;
      this.startX = e.pageX - el.offsetLeft;
      this.scrollLeft = el.scrollLeft;
    };
    
  changeTab(index: number) {
    this.active = index;
  };
    
  stopDragging() {
    this.mouseDown = false;
  };

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  };

  openSettingsDialog = () => {
    const options: Array<any> = [{text:{text:'TAGS'}}, {text:{text:'TOTALIDADES'}}];

    this.dialog.open(SetConfigComponent, {
      type: 'fullscreen-translucent',
      customClass: 'app-dialog',
      flags: ['no-header'],
      props:{
        title: {text:'Preferencia de Vistas'},
        subTitle: {text:'Personaliza el listado de tus ventas'},
        options
      }
    });
  };

  openStoreShare = () => {

    const list: StoreShareList[] = [
        {
          title:  'Crear',
          options: [
            {
              text: 'Un nuevo Item',
              mode: 'func',
              func: () => {
                console.log('Item');
              }
            },
            {
              text: 'Una Venta',
              mode: 'func',
              func: () => {
                console.log('Categoria');
              }
            },
            {
              text: 'Un nuevo Tag',
              mode: 'func',
              func: () => {
                console.log('Tag');
              }
            }
          ]
        }
    ];
        
    this.dialog.open(StoreShareComponent, {
        type: 'fullscreen-translucent',
        props: {
          list,
          alternate: true
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
    });
    };

goToMetrics = () =>{
    this.router.navigate([`admin/entity-detail-metrics`]);
  };

  search(event){
    this.searchValue = event.target.value;
    console.log(event.target.value);
  };

  toggleSearch = ()=> {
    this.showSearch = !this.showSearch;
  };
    

}
