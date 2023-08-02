import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-card-image',
  templateUrl: './card-image.component.html',
  styleUrls: ['./card-image.component.scss']
})
export class CardImageComponent implements OnInit {
  @ViewChild('fileInput') fileInput: any;
  @Input() paymentText = 'FechaId'
  @Input() title = 'EmbajadorId'
  @Input() paid = false;
  @Input() imageUrl = null;
  @Input() barText = '';
  selectedFile: File | null = null;
  @Output() paymentImage = new EventEmitter<File>();

  constructor() { }

  ngOnInit(): void {
  }
  selectFile() {
    if(this.paid) return;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.selectedFile = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        this.imageUrl = e.target?.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.imageUrl = null;
    }
    this.paymentImage.emit(event)
  }
}
