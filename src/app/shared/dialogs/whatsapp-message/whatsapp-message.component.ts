import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-whatsapp-message',
  templateUrl: './whatsapp-message.component.html',
  styleUrls: ['./whatsapp-message.component.scss'],
})
export class WhatsappMessageComponent implements OnInit {
  @Input() data: {
    phone: string;
    message: string;
  };
  link: string;

  constructor(private ref: DialogRef) {}

  ngOnInit(): void {
    this.link = `https://wa.me/${this.data.phone}?text=${encodeURIComponent(
      this.data.message
    )}`;
  }

  closeEvent() {
    this.ref.close();
  }
}
