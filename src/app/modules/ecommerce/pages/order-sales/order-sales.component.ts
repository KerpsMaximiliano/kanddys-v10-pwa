import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment'
import * as moment from 'moment';
import { element } from 'protractor';
import { filter, find } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { searchInput } from 'src/app/shared/components/see-filters/see-filters.component';
import { CustomFieldsComponent } from '../../../../shared/dialogs/custom-fields/custom-fields.component';
import { CodeSearchByKeyword } from 'src/app/core/graphql/codes.gql';

@Component({
  selector: 'app-order-sales',
  templateUrl: './order-sales.component.html',
  styleUrls: ['./order-sales.component.scss']
})
export class OrderSalesComponent implements OnInit {

  imageFolder: string;
  fields: Array<string> = ["CUSTOM FIELD 1", "CUSTOM FIELD 2", "CUSTOM FIELD 3"];

  testTags: string[] = [' ', ' ', ' ', ' ', ' '];
  inSearch: boolean = false;
  isLogged: boolean = true;
  merchantID: string ;
  tags = [{subtitle: 'FILTERED BY TAGS', options: [],}];
  search: searchInput = {
    value: '', placeholder: 'Search..', background: '#FFFFFF',
    searchFunction: () => this.inputChange()}

  mouseDown = false;
  startX: any;
  scrollLeft: any;
  auxNumbers: Array<string> = [''];  

  options: Array<any> = [
    {label: "Sales", selected: true},
    {label: "Info de la Encuesta en la Notificación", selected: false}
  ] //Parte de un componente comentado 1/4/2022
  selectedOption: number = 0

  orders: Array<any> = [];

  ordersTags: any = [];



  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private merchantService: MerchantsService,
    private orderService: OrderService,
    private dialog: DialogService,
    private headerSevice: HeaderService,
    private authService: AuthService,
    private app: AppService,) {
        
        this.imageFolder = environment.assetsUrl;
      /* const sub = this.app.events
      .pipe(filter((e) => e.type === 'singleAuth'))
      .subscribe((e) => {
        if (e.data) {
          
          if (this.headerSevice.user) {
            this.isLogged = this.headerSevice.user != undefined;
            if(this.isLogged){
              if(this.merchantID){
                this.getMerchants().then(e =>{
                  this.getTagsOptions();
                });
              }
              else this.getOrdersByUser();
            }
          }
          sub.unsubscribe();
        }
      }); */

  }
  
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

  inputChange(){
    console.log("Value", this.search.value)

    this.orders.forEach(element => {
      if(element.title.toUpperCase().includes(this.search.value.toUpperCase())){
        element.visible = true;
      }
      else{
        element.visible = false
      }
    });
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
  
  filterTags(event){
    console.log(event)
    /*this.selectedCategories = []
    console.log(event)
    event[0].options.forEach(category => {
      if(category.selected==true)
      {
        if(this.selectedCategories.length<1){
        this.selectedCategories.push(category.id)
        }
        else{
          if(!this.selectedCategories.includes(category.id)){
            this.selectedCategories.push(category.id)
          }
        }
      }
    });
    this.itemFilter()*/
    //Ya estaba comentado
  }

  tagDeleted(event){
    console.log(event)
    /*let deletedCategory = this.selectedCategories.indexOf(event.name[0].id)
    this.selectedCategories.splice(deletedCategory, 1);
    this.itemFilter();*/
    //Ya estaba comentado
  }


  /* async getOrdersByUser() {
    const data = await this.orderService.ordersByUser({
      options: {
        limit: 100
      },
    }); console.log('ORDENES OBTENIDAS')
    data.ordersByUser.forEach(order => {
      let auxTags: Array<any> = [];

      order.tags.forEach(tag => {
        auxTags.push({name: tag })
      });console.log('TAGS AUXILIARES PUSHED')

      this.orders.push({
        id: order._id,
        image: order.items[0].item.images[0],
        buyer: order.user.name,
        price: order.subtotals[0].amount,
        // tags: auxTags
      });
    });
    // console.log('Aqui hace consulta a las ordenes de los users');
  } */

  async getMerchants() {
    this.merchantService.myMerchants({}).then(async (data) => {
      //console.log(data)
      if (data.length > 0) {
        this.route.params.subscribe(async (params) => {
          this.merchantID = params.id
          console.log(this.merchantID)
        });

        let merchant = data.find(element => element._id === this.merchantID)
        this.headerSevice.merchantInfo = merchant;
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

  async getData() {
    this.orders = [];
    this.route.params.subscribe(async (params) => {
      this.merchantID = params.id

      await this.getOrdersByMerchant(params.id);
    });
  }//No se esta usando

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
           text_right: 'Adiciona un tag',
           text_style: true,
           phone: order.user.phone,
           //icons_image_bool: true,
           icons_bottom_right: [
             { 
                icon: '/Etiqueta_lapiz.svg',
                type: 'img',
                function: () => this.tagFunction()
             },
             {
             /*icon: '../../../../../assets/images/grayBookmark.svg',
               type:'img',
               function: () => this.openTagsDialog(order._id, auxTags, dateID), */
             },
           ],
         })
       })
     })
   }

  selectOption(index: number){

    if(this.selectedOption!=index){
      this.options[this.selectedOption].selected = false
      this.options[index].selected = true
      this.selectedOption = index;
    }

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
    console.log(e);
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  openTagsDialog(orderID: string, tags: any, dateID: string){

    console.log(this.merchantID)
    console.log('Uso de Dialog para autenticacion')
/* 
    const dialogRef = this.dialog.open(AddNewTagComponent, {
      type: 'fullscreen',
      flags:['no-header'],
      customClass: 'app-dialog',
      notCancellable: true,
      props:{ orderID: orderID, tagsUsed: tags, dateID: dateID, merchantID: this.merchantID}
    })
    const sub = dialogRef.events 
      .pipe(filter((e) => e.type === 'result')) 
      .subscribe(async (e) => { 
        if(e.data.changed){
          this.orders = []
          await this.getOrdersByMerchant(this.merchantID)
          await this.getTagsOptions()
        }
        sub.unsubscribe(); 
      });  */
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

  searchToggling(){
    this.inSearch = !this.inSearch;
    console.log(this.inSearch)
  }

  openDialog(){
    this.dialog.open(CustomFieldsComponent, {
      type: 'flat-action-sheet',
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  searchNumber(event: any){
      this.auxNumbers = event.target.value;
    //   console.log(this.auxNumbers);
      let filteredNumber = this.orders.filter(number => number.phone.includes(this.auxNumbers));
    //   console.log(filteredNumber);
  }

  tagFunction(){
      this.router.navigate([`ecommerce/tags-edit`]);
  }

}

/* en addTagsInMerchant esta la mutation para adicionar tags a un merchant, addTagsInOrder lo utilizamos para agregar tags a una orden*/


