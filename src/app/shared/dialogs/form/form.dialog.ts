import { Component, Input } from '@angular/core';
import { Form } from '@mukuve/ngx-forms';
import { compressImage } from 'src/app/core/helpers/files.helpers';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-form-dialog',
  templateUrl: './form.dialog.html',
  styleUrls: ['./form.dialog.scss'],
})
// tslint:disable-next-line: component-class-suffix
export class FormDialog {
  @Input() form: Form;
  @Input() withImage: boolean;
  @Input() imageKey = 'image';
  @Input() image: string | ArrayBuffer;
  imageFile: File;
  env: string = environment.assetsUrl;

  constructor(public ref: DialogRef) {}

  async imageChange(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      if (file) {
        const converted = await compressImage(file);
        this.imageFile = converted;
        const reader = new FileReader();
        reader.onload = (e) => (this.image = e.target.result);
        reader.readAsDataURL(file);
      }
    }
  }

  submit() {
    // if (!(await this.ui.authDialog())) return;
    const values = this.form.values;
    if (this.withImage) values[this.imageKey] = this.imageFile;
    this.ref.close(values);
  }
}
