import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-general-form-submission-dialog',
  templateUrl: './general-form-submission-dialog.component.html',
  styleUrls: ['./general-form-submission-dialog.component.scss']
})
export class GeneralFormSubmissionDialogComponent implements OnInit {
  env: string = environment.assetsUrl;
  @Input() icon: string = 'check-circle.svg';
  @Input() message: string = 'Se ha registrado exitosamente tu orden';
  @Input() showCloseButton: boolean = false;

  constructor(
    private ref: DialogRef
  ) { }

  ngOnInit(): void {
  }

  closeDialog() {
    this.ref.close();
  }

}
