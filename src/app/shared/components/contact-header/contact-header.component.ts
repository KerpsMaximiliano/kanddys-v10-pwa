import { Component, OnInit, Inject } from '@angular/core';
import { Contact } from 'src/app/core/models/contact';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';

export interface DialogTemplate {
  contact: Contact;
  bio: string;
  // link: string;
  // chatLink: string;
}

@Component({
  selector: 'app-contact-header',
  templateUrl: './contact-header.component.html',
  styleUrls: ['./contact-header.component.scss'],
})
export class ContactHeaderComponent implements OnInit {
  constructor(
    // private ngNavigatorShareService: NgNavigatorShareService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
    private _bottomSheetRef: MatBottomSheetRef
  ) {}

  ngOnInit(): void {}

  // shareStore() {
  //   this.ngNavigatorShareService
  //     .share({
  //       title: '',
  //       url: this.data.link,
  //     })
  //     .then((response) => {
  //       console.log(response);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }

  // goToChat() {
  //   window.open(this.data.chatLink, '_blank');
  // }
}
