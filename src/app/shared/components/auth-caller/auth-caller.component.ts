import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { lockUI } from 'src/app/core/helpers/ui.helpers';
import { AuthService } from 'src/app/core/services/auth.service';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AuthHelperComponent } from 'src/app/shared/dialogs/auth-helper/auth-helper.component';
import { WarningStepsComponent } from '../../dialogs/warning-steps/warning-steps.component';

@Component({
  selector: 'app-auth-caller',
  templateUrl: './auth-caller.component.html',
  styleUrls: ['./auth-caller.component.scss']
})
export class AuthCallerComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private dialog: DialogService,
    public header: HeaderService,
    private posts: PostsService,
    private order: OrderService,
    private router: Router,
    private customizerValueService: CustomizerValueService,
    private readonly app: AppService,
  ) { }

  authInputData: string = '';
  userData: any;
  dialogReturnedData: any;
  orderID: string;
  alreadyLogged: boolean = false;
  isValidated: boolean = true;
  loaded: boolean = false
  isLoading: boolean = false;
  warningSteps: {
    name: string;
    url: string;
    status: boolean;
  }[] = []

  async ngOnInit(): Promise<void> {
    if(this.header.orderId) {
      this.router.navigate([`/ecommerce/order-info/${this.header.orderId}`]);
      return
    }
    await this.authService.me().then((data) => {
      if(data){
        console.log(data);
        this.authInputData = data.phone;
        this.alreadyLogged = true;
        if (!data.validatedAt) {
          console.log("entré");
          this.isValidated = false;
        }else{
          console.log("entré sí hay");
        }
        this.checkLoggedUser(data.phone);
        this.loaded = true;
      }

      else this.loaded = true;
    })
  }

  validCharacters(event: KeyboardEvent) {
    if (!isNaN(parseInt(event.key))) {
      //if (event.key == "-" || event.key == "(" || event.key == ")" || event.key == "+" || !isNaN(parseInt(event.key))); Estaba asi
      console.log('Bien');
    } else {
      event.preventDefault();
    }
  }

  checkUser() {
    let input: string;
    input = '1'+this.authInputData;
    console.log(input);
    this.authService.checkUser(input, 'whatsapp').then((data: any) => {
      if (data) {
        console.log(data);
        localStorage.setItem('id', data._id);
        if (data.name) {
          this.userData = data;
          if (!data.validatedAt) {
            console.log("entré");
            this.isValidated = false;
          }else{
            console.log("entré sí hay");
            this.isValidated = true;
          }
        }else{
          this.openPasswordInput('yes')
        }
      } else {
        this.openNewAccount()
      }
    });
  }

  checkLoggedUser(phone: string) {
    this.authInputData = this.authInputData.substring(1);
    console.log(this.authInputData);
    this.authService.checkUser(phone, 'whatsapp').then((data: any) => {
      if (data) {
        console.log(data);
        localStorage.setItem('id', data._id);
        if (data.name) {
          this.userData = data;
        }else{
          this.openPasswordInput('yes')
        }
      } else {
        this.openNewAccount()
      }
    });
  }

  openPasswordInput(event) {
    if(this.isLoading) return;
    if (event === 'yes') {
      if (this.alreadyLogged) {
        if(this.isDataMissing()) this.openWarningDialog();
        else {
          this.isLoading = true;
          lockUI(this.createOrder());
        }
      }else{
        const dialogref = this.dialog.open(AuthHelperComponent, {
          type: 'flat-action-sheet',
          flags: ['no-header'],
          customClass: 'app-dialog',
          props: { inputData: this.authInputData, isValidated: this.isValidated }
        });
        const sub = dialogref.events
          .pipe(filter((e) => e.type === 'result'))
          .subscribe((e) => {
            console.log(e.data)
            if (e.data) {
              this.alreadyLogged = true;
              if(this.isDataMissing()) this.openWarningDialog();
              else {
                this.isLoading = true;
                lockUI(this.createOrder());
              }
            }
            sub.unsubscribe();
          });
      }
    } else {
      this.authInputData = '';
      this.userData = null;
      this.alreadyLogged = false;
      this.authService.signoutThree();
    }
  }

  openNewAccount() {
    const dialogref = this.dialog.open(AuthHelperComponent, {
      type: 'flat-action-sheet',
      flags: ['no-header'],
      customClass: 'app-dialog',
      props: { inputData: this.authInputData, isUser: false, hidePassword:true, }
    });
    const sub = dialogref.events
      .pipe(filter((e) => e.type === 'result'))
      .subscribe((e) => {
        console.log(e.data)
        if (e.data) {
          this.alreadyLogged = true;
          this.checkUser();
          if(this.isDataMissing()) this.openWarningDialog();
          else {
            this.isLoading = true;
            lockUI(this.createOrder());
          }
        }
        sub.unsubscribe();
      });
  }

  openWarningDialog() {
    const dialogref = this.dialog.open(WarningStepsComponent, {
      type: 'action-sheet',
      customClass: 'app-dialog',
      flags: ['no-header'],
      props: { steps: this.warningSteps }
    });
    const sub = dialogref.events
      .pipe(filter((e) => e.type === 'result'))
      .subscribe((e) => {
        if(e.data) this.router.navigate([`ecommerce/provider-store/${e.data}`])
        sub.unsubscribe();
      });
  }

  isDataMissing(): boolean {
    this.warningSteps = [];
    if(this.header.saleflow.module.delivery && this.header.saleflow.module.delivery.isActive) {
      if(this.header.isComplete.delivery) {
        this.warningSteps.push({
          name: "Entrega",
          url: "pick-location",
          status: true
        });
      } else {
        this.warningSteps.push({
          name: "Entrega",
          url: "pick-location",
          status: false
        });
      }
    }
    if(this.header.items.some((item) => item.customizerId)) {
      if(this.header.isComplete.giftABox.customizer) {
        this.warningSteps.push({
          name: "Personalización",
          url: "redirect-to-customizer",
          status: true
        })
      } else {
        this.warningSteps.push({
          name: "Personalización",
          url: "redirect-to-customizer",
          status: false
        })
      }
      if(this.header.isComplete.giftABox.qualityQuantity) {
        this.warningSteps.push({
          name: "Calidades",
          url: "quantity-and-quality",
          status: true
        })
      } else {
        this.warningSteps.push({
          name: "Calidades",
          url: "quantity-and-quality",
          status: false
        })
      }
    }
    if(this.header.saleflow.module.appointment && this.header.saleflow.module.appointment.isActive) {
      if(this.header.isComplete.fotodavitte.reservation) {
        this.warningSteps.push({
          name: "Reservación",
          url: `reservation/${this.header.saleflow._id}`,
          status: true
        })
      } else {
        this.warningSteps.push({
          name: "Reservación",
          url: `reservation/${this.header.saleflow._id}`,
          status: false
        })
      }
    }
    if(this.header.hasScenarios) {
      if(this.header.isComplete.fotodavitte.scenarios) {
        this.warningSteps.push({
          name: "Escenarios",
          url: "select-pack",
          status: true
        });
      } else {
        this.warningSteps.push({
          name: "Escenarios",
          url: "select-pack",
          status: false
        });
      }
    }
    if(this.header.saleflow.module.post && this.header.saleflow.module.post.isActive) {
      if(this.header.isComplete.message) {
        this.warningSteps.push({
          name: "Mensaje",
          url: "gift-message",
          status: true
        })
      } else {
        this.warningSteps.push({
          name: "Mensaje",
          url: "gift-message",
          status: false
        })
      }
    }
    console.log(this.warningSteps.some((value) => value.status === false))
    const isDataMissing = this.warningSteps.some((value) => value.status === false);
    this.header.isComplete.isDataMissing = isDataMissing;
    return isDataMissing;
  }

  redirect() {
    if(this.isDataMissing()) this.openWarningDialog();
    else this.router.navigate([`ecommerce/flow-completion`]);
  }

  createOrder() {
    console.log(this.header);
    return new Promise(async (resolve, reject) => {
      console.log(this.header.saleflow.module.post);
      if(this.header.customizer) {
        const customizerId = await this.customizerValueService.createCustomizerValue(
          this.header.customizer
        );
        this.header.order.products[0].customizer = customizerId;
        this.header.customizer = null;
        this.header.customizerData = null;
      }
      if (this.header.saleflow.module.post) {
        let postinput = this.header.post;
        this.posts
          .creationPost(postinput)
          .then(async (data) => {
            if (data) {
              console.log(data);
              this.header.order.products[0].post = data.createPost._id;
              console.log(this.header.order);
              let order = this.header.order;

              for (let i = 0; i < order.products.length; i++) {
                delete order.products[i].isScenario;
                delete order.products[i].limitScenario;
                delete order.products[i].name;
              }

              // delete order.products[0].name;
              console.log(order);
              await this.order
                .createOrder(this.header.order)
                .then(async (data) => {
                  console.log(data);
                  // console.log(this.)
                  // this.clearOrderData();
                  this.orderID = data.createOrder._id;
                  console.log(this.orderID);
                  this.isLoading = false;
                  this.header.orderId = this.orderID;
                  this.header.currentMessageOption = undefined;
                  this.header.post = undefined;
                  this.header.locationData = undefined;
                  this.app.events.emit({ type: 'order-done', data: true });
                  //this.router.navigate(['/ecommerce/provider-store/payment-methods']);
                  resolve(this.orderID);
                })
                .catch((err) => {
                  console.log(err);
                  this.isLoading = false;
                });
            }
          })
          .catch((err) => {
            console.log(err);
            this.isLoading = false;
          });
      } else {
        console.log(this.header.order);
        let orderRequest = this.header.order;
        for (let i = 0; i < orderRequest.products.length; i++) {
          if (
            orderRequest.products[i].isScenario ||
            orderRequest.products[i].limitScenario
          ) {
            delete orderRequest.products[i].isScenario;
            delete orderRequest.products[i].limitScenario;
          }
        }
        console.log(orderRequest);
        await this.order.createOrder(orderRequest).then(async (data) => {
          console.log(data);
          this.orderID = data.createOrder._id;
          this.isLoading = false;
          console.log(this.orderID);
          this.header.orderId = this.orderID;
          this.app.events.emit({ type: 'order-done', data: true });
          resolve(this.orderID);
        })
        .catch((err) => {
          console.log(err);
          this.isLoading = false;
        });
      }
    })
    .catch((err) => {
      console.log(err);
      this.isLoading = false;
    });
  }

}
