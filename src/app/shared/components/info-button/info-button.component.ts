import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CollaborationsComponent } from '../../dialogs/collaborations/collaborations.component';

@Component({
  selector: 'app-info-button',
  templateUrl: './info-button.component.html',
  styleUrls: ['./info-button.component.scss'],
})
export class InfoButtonComponent implements OnInit {
  env: string = environment.assetsUrl;

  constructor(private dialog: DialogService) {}

  ngOnInit(): void {}

  openDialog() {
    this.dialog.open(CollaborationsComponent, {
      type: 'centralized-fullscreen',
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }
}
