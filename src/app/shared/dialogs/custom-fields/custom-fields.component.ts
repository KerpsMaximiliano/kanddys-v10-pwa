import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { AppService } from 'src/app/app.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.scss'],
})
export class CustomFieldsComponent implements OnInit {
  @Input() customFields = [
    'CUSTOM FIELD 1',
    'CUSTOM FIELD 2',
    'CUSTOM FIELD 3',
  ];
  currentUserData;
  whatsappLink: string;

  constructor(
    private ref: DialogRef,
    private header: HeaderService,
    private merchantsService: MerchantsService,
    private appService: AppService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('session-token')) {
      if (!this.header.user) {
        let sub = this.appService.events
          .pipe(filter((e) => e.type === 'auth'))
          .subscribe((e) => {
            this.checkIfUserIsMerchant();

            sub.unsubscribe();
          });
      } else this.checkIfUserIsMerchant();
    }
  }

  checkIfUserIsMerchant() {
    this.currentUserData = this.header.user;

    console.log('DATOS DE IUSU', this.currentUserData._id);

    this.merchantsService
      .isMerchant(this.currentUserData._id)
      .then((result) => {
        if (!result) this.router.navigate(['/']);

        console.log('USER ES MERCHANT?', result);
      });
  }

  sendMessageToCustomizeFields(customField: string) {
    this.whatsappLink = `https://wa.me/19188156444?text=Hola%20Daviel,%20te%20voy%20a%20dejar%20en%20un%20mensaje%20de%20voz%20lo%20que%20yo%20necesito%20que%20est%C3%A9%20en%20mi%20${customField}`;
    let linkRef = document.querySelector(
      `#sendToDavielWS`
    ) as HTMLAnchorElement;
    linkRef.href = this.whatsappLink;
    linkRef.click();
  }

  close() {
    this.ref.close();
  }
}
