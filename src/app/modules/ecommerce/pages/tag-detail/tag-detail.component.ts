import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CustomFieldsComponent } from '../../../../shared/dialogs/custom-fields/custom-fields.component';
import * as moment from 'moment';

@Component({
  selector: 'app-tag-detail',
  templateUrl: './tag-detail.component.html',
  styleUrls: ['./tag-detail.component.scss']
})
export class TagDetailComponent implements OnInit {

  isLogged: boolean = true;
  merchantID: string ;
  orders: Array<any> = [];
  ordersTags: any = [];
  tags = [{subtitle: 'FILTERED BY TAGS', options: [],}];
  imageFolder: string;
  fields: Array<string> = ["CUSTOM FIELD 1", "CUSTOM FIELD 2", "CUSTOM FIELD 3"];
  tagID: string = 'TAG ID';
  transparent: boolean = true;

  ordurs: Array<any> = [{
    title: 'NombreID',
    eventTitle: 'event title',
    subtitle: 'compradorID',
    price: null,
    description: this.fields,
    image: '',
    eventImage: undefined,
    icon: '',
    text_style: true,
    text_left: 'hace 2 dias',
    text_right: 'adiciona un tag',
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
    text_left: 'Hace 2 dias',
    text_right: 'TagID, TagID, TagID, TagID, TagID, TagID',
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
    subtitle: 'compradorID',
    price: null,
    description: this.fields,
    image: '',
    eventImage: undefined,
    icon: '',
    text_style: true,
    text_left: 'hace 2 dias',
    text_right: 'adiciona un tag',
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
    text_right: 'TagID, TagID, TagID, TagID, TagID, TagID',
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
    private route: ActivatedRoute, 
    private router: Router,
    private merchantService: MerchantsService,
    private orderService: OrderService,
    private dialog: DialogService,
    private headerSevice: HeaderService,
    private authService: AuthService,
    ) { this.imageFolder = environment.assetsUrl; }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
        this.merchantID = params.id
      });
      this.merchantService.myMerchants({}).then(async (data) => {
        console.log(data)}
      )
      this.authService.me().then((data) => {
        //console.log(data);
        this.isLogged = data != undefined;
        //console.log(this.isLogged)
        if(this.isLogged){
          if(this.merchantID){
            this.getMerchants().then(e =>{
              this.getTagsOptions();
              // console.log('MerchantsLand')
            });
          }
          else console.log('Aqui iria a usuarios, pero no') //this.getOrdersByUser();
        }
        else{
          console.log('cosas viejas, openAuth')
        }
      });
      console.log('Aqui hace verificacion de merchant');
  }


  async getMerchants() {
    this.merchantService.myMerchants({}).then(async (data) => {
      //console.log(data)
      if (data.length > 0) {
        this.route.params.subscribe(async (params) => {
          this.merchantID = params.id
          console.log(this.merchantID)
        });

        let merchant = data.find(element => element._id === this.merchantID)
        console.log(merchant)
        if(merchant!=undefined)
        {
          this.orders = []
          console.log(this.orders)
          await this.getOrdersByMerchant(this.merchantID)
        }
        else{
          console.log("entre")
        //   this.router.navigate(['/ecommerce/admin-dashboard/affiliated-to-be']);
        }
      } 
      else {
          console.log('No entre')
        // this.router.navigate(['/ecommerce/admin-dashboard/affiliated-to-be']);
      }
    });
  }

  async getOrdersByMerchant(id: string) {
    await this.merchantService
     .ordersByMerchant(id, {
       options: {
         limit: 100
       },
     }).then(data =>{
       console.log(data)
       data.ordersByMerchant.forEach(order => {
         
         let auxTags: Array<any> = []

         order.tags.forEach(tag => {
           auxTags.push({tag:{name: tag }})
         });
         
         let today = moment()
         let daysAgo = today.diff(order.createdAt, 'days');
         let timeAgo = "Today"
         
         if(daysAgo>0){
           timeAgo = daysAgo + "days ago"
         }

         let dateID = this.formatID(order.dateId)


         this.orders.push({
           visible: true,
           id: order._id,
           image: order.items[0].item.images[0],
           eventImage: () => this.goToOderinfo(order._id),
           title: order.user.name,
           eventTitle: () => this.goToOderinfo(order._id),
           price: order.subtotals[0].amount,
           tags: auxTags,
           text_left: 'Create by ' +  order.user.name + '.' + timeAgo ,
           text_style: true,
           //icons_image_bool: true,
           icons_bottom_right: [
             { 
               /* icon: '../../../../../assets/images/grayBookmark.svg',
               type:'img', */
               function: () => this.openTagsDialog(order._id, auxTags, dateID),
             },
             {
               icon: 'fa-heart',
               color: '#7B7B7B',
               type: 'icon',
             },
           ],
         })
       })
     })
   }

  async getTagsOptions(){
    
    await this.merchantService.tagsByMerchant(this.merchantID).then(data =>{
      console.log(data);
      this.tags[0].options = [];
      data.tagsByMerchant.results.forEach(element => {
        this.tags[0].options.push({
          id: element._id,
          label: element.name,
          type: 'label',
          selected: false,
        });
      })
    })
  }

  goToOderinfo(orderID:string){
    this.router.navigate([`ecommerce/order-info/${orderID}`]);
  }

  formatID(dateId: string) {
    const splits = dateId.split('/');
    const year = splits[2].substring(0, 4);
    const number = splits[2].substring(4);
    const month = splits[0];
    const day = splits[1];
    return `#${year}${month}${day}${number}`;
  }

  openTagsDialog(orderID: string, tags: any, dateID: string){

    // console.log(this.merchantID)
    console.log('Uso de Dialog para autenticacion')
  }

  letsChange() {
      this.transparent = !this.transparent;
  }

  openDialog(){
    this.dialog.open(CustomFieldsComponent, {
      type: 'flat-action-sheet',
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

}
