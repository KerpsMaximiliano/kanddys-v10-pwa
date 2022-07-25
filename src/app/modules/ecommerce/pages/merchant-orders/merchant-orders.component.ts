import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';

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

  constructor( private router: Router) { }

  ngOnInit(): void {
  }


  goToMetrics = () =>{
    this.router.navigate([`ecommerce/entity-detail-metrics`]);
  }

  search(event){
    this.searchValue = event.target.value;
    console.log(event.target.value);
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
  }
}




