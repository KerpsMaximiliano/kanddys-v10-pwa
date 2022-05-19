import { Component, OnInit, Input } from '@angular/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { OrderService } from 'src/app/core/services/order.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

@Component({
  selector: 'app-magic-link-dialog',
  templateUrl: './magic-link-dialog.component.html',
  styleUrls: ['./magic-link-dialog.component.scss'],
})
export class MagicLinkDialogComponent implements OnInit {
  @Input() ids: Record<string, string>;
  @Input() callback: (...params) => any;
  @Input() asyncCallback: (...params) => Promise<any>;
  whatsappLink: string = 'https://wa.me/19295263397?';

  constructor(private ref: DialogRef) {}

  async ngOnInit() {
    lockUI();
    await this.storeRouteState();
    unlockUI();
  }

  async storeRouteState() {
    if (this.callback) {
      this.whatsappLink = await this.callback(this.whatsappLink);
    } else if (this.asyncCallback) {
      this.whatsappLink = await this.asyncCallback(this.whatsappLink);
    } else if (this.ids) {
      Object.keys(this.ids).forEach((key, index) => {
        if (index === 0) this.whatsappLink += `&text=`;
        if (index !== 0) this.whatsappLink += `&`;

        this.whatsappLink += `${encodeURIComponent(key + ' ' + this.ids[key])}`;
      });
    }
  }

  close() {
    this.ref.close();
  }
}
