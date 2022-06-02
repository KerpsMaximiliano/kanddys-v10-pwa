import { Component, OnInit } from '@angular/core';
import { Tag } from 'src/app/core/models/tags';
import { TagsService } from 'src/app/core/services/tags.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {

    tabs: string[] = ['Regalos', 'Tiendas', 'Eventos', 'NFTs'];
    totalIncome: string = '147,154.00';
    totalSales: string = '154';
    imageFolder: string;
    showTags: boolean = false;
    tiendas: boolean= false;
    testTags: Array<any> = [' ', ' ', ' ', ' '];
    tags: Tag[] = [];
    fields: Array<string> = ["CUSTOM FIELD 1", "CUSTOM FIELD 2", "CUSTOM FIELD 3"];
    env: string = environment.assetsUrl;

    ordurs: Array<any> = [{
        title: 'DummyOrder',
        eventTitle: 'event title',
        price: null,
        description: this.fields,
        image: '',
        eventImage: undefined,
        icon: '',
        text_style: true,
        text_left: 'hace 2 dias',
        text_middle: 'MontoPagado',
        bonus: '00',
        text_right: '4 etiquetas',
        add_tag: true,
        merchant_info: true,
        full_text: '',
        icons: [],
        text_icon: '',
        icons_image: [],
        icon_bottom: {},
        icons_right: [],
        icons_bottom_right: [],
        bar: false,
        barColor: 'transparent',
        barText: '',
        barLeftIcon: '',
        barRightIcon: '',
        contentBgColor: '',
      },
      {
        title: 'NombreID',
        eventTitle: undefined,
        price: null,
        description: this.fields,
        image: '',
        eventImage: undefined,
        icon: '',
        text_style: true,
        text_left: 'Hace 2 dias',
        text_middle: 'MontoPagado',
        bonus: '00',
        text_right: '4 etiquetas',
        add_tag: true,
        merchant_info: false,
        full_text: '',
        icons: [],
        text_icon: '',
        icons_image: [],
        icon_bottom: {},
        icons_right: [],
        icons_bottom_right: [],
        bar: false,
        barColor: 'transparent',
        barText: '',
        barLeftIcon: '',
        barRightIcon: '',
        contentBgColor: '',
      },
      {
        title: 'NombreID',
        eventTitle: undefined,
        price: null,
        description: this.fields,
        image: '',
        eventImage: undefined,
        icon: '',
        text_style: true,
        text_left: 'hace 2 dias',
        text_middle: 'MontoPagado',
        bonus: '00',
        text_right: '4 etiquetas',
        add_tag: true,
        merchant_info: true,
        full_text: '',
        icons: [],
        text_icon: '',
        icons_image: [],
        icon_bottom: {},
        icons_right: [],
        icons_bottom_right: [],
        bar: false,
        barColor: 'transparent',
        barText: '',
        barLeftIcon: '',
        barRightIcon: '',
        contentBgColor: '',
      },
      {
        title: 'NombreID',
        eventTitle: undefined,
        subtitle: 'CompradorID',
        price: null,
        description: this.fields,
        image: '',
        eventImage: undefined,
        icon: '',
        text_style: true,
        text_left: 'hace 2 dias',
        text_right: '4 etiquetas',
        add_tag: true,
        merchant_info: true,
        full_text: '',
        icons: [],
        text_icon: '',
        icons_image: [],
        icon_bottom: {},
        icons_right: [],
        icons_bottom_right: [],
        bar: false,
        barColor: 'transparent',
        barText: '',
        barLeftIcon: '',
        barRightIcon: '',
        contentBgColor: '',
      },
    ];
    

  constructor(
    private tagsService: TagsService,
  ) {}

  ngOnInit(): void {
    this.getTags();
  }

  async getTags() {
    this.tags = await this.tagsService.tagsByUser();
  }

  wichName(e: string) {
    switch (e){
      case 'Regalos':
      console.log('Compradores'); 
      this.tiendas = false;
      
      break;

      case 'Tiendas':
      console.log('Tiendas');
      this.tiendas = true;

      break;

      case 'Eventos':
        console.log('Eventos');
        this.tiendas = false;
  
        break;

      case 'NFTs':
        console.log('NFTs');
        this.tiendas = false;
    
        break;
        }
    }
}
