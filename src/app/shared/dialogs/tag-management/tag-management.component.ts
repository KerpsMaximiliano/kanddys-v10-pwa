import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-tag-management',
  templateUrl: './tag-management.component.html',
  styleUrls: ['./tag-management.component.scss'],
})
export class TagManagementComponent implements OnInit {
  tags: string[] = [
    '#tacomid',
    '#tacomid',
    '#tacomid',
    '#tacomid',
    '#tacomid',
    '#tacomid',
    '#tacomid',
    '#tacomid',
  ];
  images: any = [['']];
  tag: string[] = [];
  controllers: FormArray = new FormArray([]);
  @Input('multipleImages') multipleImages: boolean = false;
  @Input('multiple') multiple: boolean = false;
  @Input('multipleTags') multipleTags: boolean = false;
  dots = { active: true };
  mainText: any = {
    text: '',
    fontSize: '',
    fontFamily: '',
  };
  fields: any[] = [
    {
      name: 'name',
      label: 'Nombre',
      value: '',
      validators: [Validators.required],
      type: 'text',
    },
    {
      name: 'images',
      label: 'Imagen',
      style: {
        marginLeft: '36px',
      },
      value: this.fillList(1),
      validators: [Validators.required, this.imagesValid],
      type: 'file',
    },
  ];
  constructor(protected _DomSanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.tags = this.tags.map((tag, index) => tag + index);
    this.initControllers();
  }

  initControllers(): void {
    const list = this.fillList(1);
    list.forEach((item, i) => {
      const controller: FormGroup = new FormGroup({});
      this.fields.forEach(
        ({ name, value, validators, type }: any, j: number) => {
          controller.addControl(name, new FormControl(value, validators));
          if (type === 'file') this.images[i][j] = '';
        }
      );
      this.controllers.push(controller);
    });
  }

  public get demoFormArrayControls() {
    return this.controllers.controls as FormGroup[];
  }

  getFormGroupAt(i: number) {
    return this.controllers.at(i) as FormGroup;
  }

  fillList(n: number): any[] {
    const result = [...Array(n).keys()].map(() => '');
    return result;
  }

  loadFile(event: any, i: number, j: number) {
    const [file] = event.target.files;
    if (!file || !['image/png', 'image/jpg', 'image/jpeg'].includes(file.type))
      return;
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const result = reader.result;
      this.images[i][j] = this._DomSanitizer.bypassSecurityTrustStyle(
        `url(${result}) no-repeat center center / cover #E9E371`
      );
      const images = this.controllers
        .at(i)
        .get('images')
        .value.map((image, index: number) => {
          return index === j ? result : image;
        });
      this.controllers.at(i).get('images').setValue(images);
    };

    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

  sanitize(image: string | ArrayBuffer, i: number, j: number) {
    return this._DomSanitizer.bypassSecurityTrustStyle(
      `url(${this.images[i][j]}) no-repeat center center / cover #E9E371`
    );
  }

  submit(): void {
    if (this.controllers.invalid) return;
    const results = this.controllers.value.map(({ name, images }) => {
      let imagen;
      if (this.multipleImages) imagen = images;
      else [imagen] = images;
      const result = {
        name,
        ['image' + (this.multipleImages ? 's' : '')]: imagen,
      };
      return result;
    });
    let value;
    if (this.multiple) value = results;
    else [value] = results;
    console.log('value: ', value);
  }

  addImage(i: number, j: number, el: HTMLElement): void {
    const controller = this.controllers.at(i).get('images');
    controller.setValue([...controller.value, '']);
    const keys = Object.keys(this.images);
    const max = Math.max(...keys.map((key) => +key));
    this.images[i].push('');
    setTimeout(() => (el.scrollLeft = el.scrollWidth), 50);
  }

  removeImage(i, j): void {
    const controller = this.controllers.at(i).get('images');
    controller.setValue(controller.value.filter((image, index) => index !== j));
    this.images[i] = this.images[i].filter((image, index) => index !== j);
  }

  addController(): void {
    if (this.controllers.invalid) return;
    this.images.push([]);
    this.initControllers();
  }

  removeController(index: number): void {
    this.controllers.removeAt(index);
    this.images = this.images.filter((images, i) => i !== index);
  }

  setTag(tag): void {
    if (this.tag.includes(tag)) this.tag = this.tag.filter((tg) => tg !== tag);
    else {
      const value = this.multipleTags ? [...this.tag, tag] : [tag];
      this.tag = value;
    }
  }

  imagesValid(g: FormControl) {
    return g.value.some((image) => !image) ? { invalid: true } : null;
  }
}
