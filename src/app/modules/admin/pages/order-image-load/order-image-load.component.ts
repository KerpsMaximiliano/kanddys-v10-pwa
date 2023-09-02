import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-image-load',
  templateUrl: './order-image-load.component.html',
  styleUrls: ['./order-image-load.component.scss'],
})
export class OrderImageLoadComponent implements OnInit {
  statusList: Array<{
    name: string;
    status?: string;
  }> = [
    { name: 'progressId' },
    { name: 'progressId' },
    { name: 'progressId' },
    { name: 'progressId' },
  ];
  image: any;
  constructor() {}

  ngOnInit(): void {}
  
  onFileSelected(event) {
    const file: File = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.image = reader.result;
    };
  }
}
