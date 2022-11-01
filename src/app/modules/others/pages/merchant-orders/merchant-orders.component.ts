import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SetConfigComponent } from 'src/app/shared/dialogs/set-config/set-config.component';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import { StoreShareList } from '../../../../shared/dialogs/store-share/store-share.component';

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
  selector: 'app-merchant-orders',
  templateUrl: './merchant-orders.component.html',
  styleUrls: ['./merchant-orders.component.scss']
})
export class MerchantOrdersComponent implements OnInit {

    items: Item[];
    ordersTotal: {
        total: number;
        length: number;
    };
    showTags: boolean = true;
    showSearch: boolean = true;
    mouseDown = false;
    startX: any;
    scrollLeft: any;
    active: number = 0;
    tabs: string[] = ['STATUS', 'STATUS ID', 'STATUS', 'STATUS ID', 'STATUS'];
    searchValue: string;
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
    {
        headline:{
        text: 'OrdenID'
    },
    subheadlines:[{
        text:'Order ID'
    },{ text:'Status ID'}],
    rightActive: true,
    rightSubHeadline:{
        text:'right-subheadline'
    },
    icon:[{
        src: '/person.svg',
        width: 15,
        height: 19
    },{
        src: '/pencil.svg',
        width: 15,
        height: 19
    }],
    ctaText:{
        text:{text:'Mas'},
        arrow: false
    },
    tag:{
        title:{
            text: 'TAGS'
        },
        tags:[{
            name:'Tag ID',
            icon:{
                src:'/whatsapp_verde.svg'
            }
            },{
                name:'Tag ID'
            },{
                name:'Tag ID',
                icon:{
                    src:'/whatsapp_verde.svg'
                }
            },{
                name:'Tag ID'
            }],
        icon:{
            src:'/pencil.svg',
            width: 15,
            height: 15
        }
    } 
    },{
        headline:{
        text: 'OrdenID'
    },
    subheadlines:[{
        text:'Order ID'
    },{ text:'Status ID'}],
    rightActive: true,
    rightSubHeadline:{
        text:'right-subheadline'
    },
    icon:[{
        src: '/person.svg',
        width: 15,
        height: 19
    },{
        src: '/pencil.svg',
        width: 15,
        height: 19
    }],
    ctaText:{
        text:{text:'Mas'},
        arrow: false
    },
    tag:{
        title:{
            text: 'TAGS'
        },
        tags:[{
            name:'Tag ID',
            icon:{
                src:'/whatsapp_verde.svg'
            }
            },{
                name:'Tag ID'
            },{
                name:'Tag ID',
                icon:{
                    src:'/whatsapp_verde.svg'
                }
            },{
                name:'Tag ID'
            }],
        icon:{
            src:'/pencil.svg',
            width: 15,
            height: 15
        }
    } 
    },{
        headline:{
        text: 'OrdenID'
    },
    subheadlines:[{
        text:'Order ID'
    },{ text:'Status ID'}],
    rightActive: true,
    rightSubHeadline:{
        text:'right-subheadline'
    },
    icon:[{
        src: '/person.svg',
        width: 15,
        height: 19
    },{
        src: '/pencil.svg',
        width: 15,
        height: 19
    }],
    ctaText:{
        text:{text:'Mas'},
        arrow: false
    },
    tag:{
        title:{
            text: 'TAGS'
        },
        tags:[{
            name:'Tag ID',
            icon:{
                src:'/whatsapp_verde.svg'
            }
            },{
                name:'Tag ID'
            },{
                name:'Tag ID',
                icon:{
                    src:'/whatsapp_verde.svg'
                }
            },{
                name:'Tag ID'
            }],
        icon:{
            src:'/pencil.svg',
            width: 15,
            height: 15
        }
    } 
    },{
        headline:{
        text: 'OrdenID'
    },
    subheadlines:[{
        text:'Order ID'
    },{ text:'Status ID'}],
    rightActive: true,
    rightSubHeadline:{
        text:'right-subheadline'
    },
    icon:[{
        src: '/person.svg',
        width: 15,
        height: 19
    },{
        src: '/pencil.svg',
        width: 15,
        height: 19
    }],
    ctaText:{
        text:{text:'Mas'},
        arrow: false
    },
    tag:{
        title:{
            text: 'TAGS'
        },
        tags:[{
            name:'Tag ID',
            icon:{
                src:'/whatsapp_verde.svg'
            }
            },{
                name:'Tag ID'
            },{
                name:'Tag ID',
                icon:{
                    src:'/whatsapp_verde.svg'
                }
            },{
                name:'Tag ID'
            }],
        icon:{
            src:'/pencil.svg',
            width: 15,
            height: 15
        }
    } 
    },{
        headline:{
        text: 'OrdenID'
    },
    subheadlines:[{
        text:'Order ID'
    },{ text:'Status ID'}],
    rightActive: true,
    rightSubHeadline:{
        text:'right-subheadline'
    },
    icon:[{
        src: '/person.svg',
        width: 15,
        height: 19
    },{
        src: '/pencil.svg',
        width: 15,
        height: 19
    }],
    ctaText:{
        text:{text:'Mas'},
        arrow: false
    },
    tag:{
        title:{
            text: 'TAGS'
        },
        tags:[{
            name:'Tag ID',
            icon:{
                src:'/whatsapp_verde.svg'
            }
            },{
                name:'Tag ID'
            },{
                name:'Tag ID',
                icon:{
                    src:'/whatsapp_verde.svg'
                }
            },{
                name:'Tag ID'
            }],
        icon:{
            src:'/pencil.svg',
            width: 15,
            height: 15
        }
    } 
    },{
        headline:{
        text: 'OrdenID'
    },
    subheadlines:[{
        text:'Order ID'
    },{ text:'Status ID'}],
    rightActive: true,
    rightSubHeadline:{
        text:'right-subheadline'
    },
    icon:[{
        src: '/person.svg',
        width: 15,
        height: 19
    },{
        src: '/pencil.svg',
        width: 15,
        height: 19
    }],
    ctaText:{
        text:{text:'Mas'},
        arrow: false
    },
    tag:{
        title:{
            text: 'TAGS'
        },
        tags:[{
            name:'Tag ID',
            icon:{
                src:'/whatsapp_verde.svg'
            }
            },{
                name:'Tag ID'
            },{
                name:'Tag ID',
                icon:{
                    src:'/whatsapp_verde.svg'
                }
            },{
                name:'Tag ID'
            }],
        icon:{
            src:'/pencil.svg',
            width: 15,
            height: 15
        }
    } 
    },{
        headline:{
        text: 'OrdenID'
    },
    subheadlines:[{
        text:'Order ID'
    },{ text:'Status ID'}],
    rightActive: true,
    rightSubHeadline:{
        text:'right-subheadline'
    },
    icon:[{
        src: '/person.svg',
        width: 15,
        height: 19
    },{
        src: '/pencil.svg',
        width: 15,
        height: 19
    }],
    ctaText:{
        text:{text:'Mas'},
        arrow: false
    },
    tag:{
        title:{
            text: 'TAGS'
        },
        tags:[{
            name:'Tag ID',
            icon:{
                src:'/whatsapp_verde.svg'
            }
            },{
                name:'Tag ID'
            },{
                name:'Tag ID',
                icon:{
                    src:'/whatsapp_verde.svg'
                }
            },{
                name:'Tag ID'
            }],
        icon:{
            src:'/pencil.svg',
            width: 15,
            height: 15
        }
    } 
    },{
        headline:{
        text: 'OrdenID'
    },
    subheadlines:[{
        text:'Order ID'
    },{ text:'Status ID'}],
    rightActive: true,
    rightSubHeadline:{
        text:'right-subheadline'
    },
    icon:[{
        src: '/person.svg',
        width: 15,
        height: 19
    },{
        src: '/pencil.svg',
        width: 15,
        height: 19
    }],
    ctaText:{
        text:{text:'Mas'},
        arrow: false
    },
    tag:{
        title:{
            text: 'TAGS'
        },
        tags:[{
            name:'Tag ID',
            icon:{
                src:'/whatsapp_verde.svg'
            }
            },{
                name:'Tag ID'
            },{
                name:'Tag ID',
                icon:{
                    src:'/whatsapp_verde.svg'
                }
            },{
                name:'Tag ID'
            }],
        icon:{
            src:'/pencil.svg',
            width: 15,
            height: 15
        }
    } 
    },]; //Dummy data. Por favor eliminar al integrar, thx <3 <3 <3

  constructor( 
    private router: Router,
    private dialog: DialogService
    ) { }

  ngOnInit(): void {
  }


  goToMetrics = () =>{
    this.router.navigate([`admin/items-dashboards`]);
  }

  search(event){
    this.searchValue = event.target.value;
    console.log(event.target.value);
  }

  toggleSearch = ()=> {
    this.showSearch = !this.showSearch;
  }

  changeTab(i: number){
    this.active = i;
  }

  startDragging(e, flag, el) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging(e, flag) {
    this.mouseDown = false;
  }

  moveEvent(e, el) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  };

  openSettingsDialog = () => {
    const options: Array<any> = [{text:{text:'TAGS'}}, {text:{text:'STATUS'}}, {text:{text:'LO COMPRADO'}}, {text:{text:'COMPRADOR'}}];

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

}