import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-customizer-stickers',
  templateUrl: './customizer-stickers.component.html',
  styleUrls: ['./customizer-stickers.component.scss']
})
export class CustomizerStickersComponent implements OnInit {
  @Input() stickers: string[] = [];

  constructor(
    private customizerValueService: CustomizerValueService, 
    private ref: DialogRef,
    private sanitizer: DomSanitizer
    ) { }

  ngOnInit(): void {
  }

  sanitizeImageUrl(imageUrl: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl("data:image/svg+xml;charset=UTF-8," + imageUrl);
}

  onClick(url: string, id: number) {
    this.customizerValueService.urlEmitter.next({url, id});
    this.ref.close();
  }
}
