import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-leadword-list',
  templateUrl: './leadword-list.component.html',
  styleUrls: ['./leadword-list.component.scss'],
})
export class LeadwordListComponent implements OnInit {
  constructor(
    private router: Router,
    public merchant: MerchantsService,
    private app: AppService,
    private route: ActivatedRoute,
    private dialog: DialogService,
    public order: OrderService,
    public auth: AuthService
  ) {
    const sub = this.app.events
      .pipe(filter((e) => e.type === 'singleAuth'))
      .subscribe((e) => {
        if (e.data) {
          this.lookForOrder();
          sub.unsubscribe();
        }
      });
  }

  @Input() list: any;
  @Input() numberMail: boolean = false;
  @Input() ignore: boolean;
  @Input() authData: boolean = false;
  @Output() authOption = new EventEmitter();
  @Output() getIndex = new EventEmitter();
  merchantID: any;
  isLogged: any;
  orderData: any;
  @Input() orderId: string;
  testID: string;
  // @Input() type: string;
  fullLink: string;
  env: string = environment.assetsUrl;

  ngOnInit(): void {
    console.log(this.list);
    //this.checkLogin();
  }

  goLink(i: number, type?: string) {
    this.getIndex.emit(i);
    if (this.ignore) return;
    if (this.authData) {
      if (i == 0) {
        this.authOption.emit('yes');
      } else {
        this.authOption.emit('no');
      }
    } else {
      if (this.list[i].link) {
        console.log(this.list[i].link);
        this.router.navigate([this.list[i].link]);
        this.fullLink = 'app.kanddys.com/ecommerce/order-info/' + this.orderId;
        if (type == 'whatsapp') {
          let whatsappLink;
          if(this.list[i].customizer) {
            whatsappLink = `https://wa.me/19188156444?text=Orden%20de%20${this.list[i].amount}%20servilletas,%20aquí%20el%20enlace:%20${this.fullLink}`;
          } else {
            whatsappLink = `https://wa.me/${this.list[i].contact}?text=Orden%20de%20${this.list[i].packageName},%20aquí:%20${this.fullLink}`;
          }
          console.log(whatsappLink);
          window.open(whatsappLink, '_blank');
        }
      } else {
        if (type == 'whatsapp') {
          this.fullLink =
            'app.kanddys.com/ecommerce/order-info/' + this.orderId;
          let whatsappLink;

          if(this.list[i].customizer) {
            whatsappLink = `https://wa.me/19188156444?text=Orden%20de%20${this.list[i].amount}%20servilletas,%20aquí%20el%20enlace:%20${this.fullLink}`;
          } else {
            whatsappLink = `https://wa.me/${this.list[i].contact}?text=Orden%20de%20${this.list[i].packageName},%20aquí:%20${this.fullLink}`;
          }
          console.log(whatsappLink);
          window.open(whatsappLink, '_blank');
          //window.location.href = whatsappLink;
          //la de whatsapp
        } else if (type == 'email') {
          this.fullLink =
            'app.kanddys.com/ecommerce/order-info/' + this.orderId;
          const emailAddress = `mailto:${this.list[i].contact}?Subject=Orden%20de%20${this.list[i].packageName}&body=Link%20aquí:%20${this.fullLink}`;
          console.log(emailAddress);
          window.open(emailAddress, '_blank');
          // window.location.href = emailAddress;
          //la de email
        }
        // this.router.navigate([`${this.list[i].link}`]); ESTO DEBERIA DE USARSE CUANDO TENGAMOS EL LINK QUE PASARLE
        this.router.navigate(['ecommerce/order-info/' + this.orderId]); //ss
      }
    }
  }

  lookForOrder() {
    this.route.params.subscribe((params) => {
      //console.log(params.id);
      this.order.order(params.id).then((data) => {
        console.log(data);
        this.orderData = data.order;
        this.merchantID = this.orderData.merchants[0]._id;
        this.testID = params.id;
        this.orderId = data.order._id;
        console.log(this.merchantID);
        console.log(this.orderId);
      });
    });
  }
}

/*
  goLink(i: number, type?:string) { 
    if(type == 'whatsapp'){
      const whatsappLink = `https://wa.me/${this.list[i].contact}?text=Gracias%20por%20su%20transferencia%20!!`;
      console.log(whatsappLink);
      window.open(whatsappLink, "_blank");
      //window.location.href = whatsappLink; 
      //la de whatsapp
    } else if(type == 'email'){
      const emailAddress = `mailto:${this.list[i].contact}?Subject=Gracias%20por%20compra%20a%20provider%20!!&body=Este%20es%20el%20maravilloso%20mensaje%20que%20escribirás`;
      console.log(emailAddress);
      window.location.href = emailAddress;
      //la de email
    }else{
      console.log('el Else'); 
    }*/
