import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from '../../dialogs/image-view/image-view.component';

@Component({
  selector: 'app-gift-message',
  templateUrl: './gift-message.component.html',
  styleUrls: ['./gift-message.component.scss'],
})
export class GiftMessageComponent implements OnInit {
  @Input('data') set data(value) {
    this.aux = value || {};
  }
  @Input('submition') submition: boolean = false;
  @Input('disabledInputs') disabledInputs: boolean = true;
  @Input() background: string = '#F6F6F6';
  @Input() isPreview: boolean;
  @Input() message: string;

  controllers: FormArray = new FormArray([]);
  controller: FormGroup = new FormGroup({});
  aux: any = {};

  constructor(
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.initControllers();
  }

  initControllers() {
    const [target] = this.aux.targets ? this.aux.targets : [{ name: '' }];
    this.controller.addControl(
      '_id',
      new FormControl(this.aux._id, Validators.required)
    );
    this.controller.addControl(
      'from',
      new FormControl(this.aux.from, Validators.required)
    );
    this.controller.addControl(
      'target',
      new FormControl(target.name, Validators.required)
    );
    this.controllers.push(
      new FormControl(this.aux.message, Validators.required)
    );
    if (this.disabledInputs) {
      this.controller.disable();
      this.controllers.disable();
    }
    
  }

  submit(): void {
    if (this.controller.invalid || this.controllers.invalid) return;
    const [message] = this.controllers.value;
    const result = {
      _id: this.controller.get('_id').value,
      message,
      target: this.controller.get('target').value,
      from: this.controller.get('from').value,
    };
  }

  openImageModal(imageSourceURL: string) {
    this.dialogService.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }
}
