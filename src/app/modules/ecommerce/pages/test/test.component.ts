import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CustomFieldsComponent } from 'src/app/shared/dialogs/custom-fields/custom-fields.component';
import { MagicLinkDialogComponent } from 'src/app/shared/components/magic-link-dialog/magic-link-dialog.component';
import { CollaborationsComponent } from 'src/app/shared/dialogs/collaborations/collaborations.component';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  constructor(private dialog: DialogService) { }

  ngOnInit(): void { }

  openDialog() {
    // this.dialog.open(CustomFieldsComponent, {
    //   type: 'flat-action-sheet',
    //   customClass: 'app-dialog',
    //   flags: ['no-header'],
    // });

    // this.dialog.open(MagicLinkDialogComponent, {
    //   type: 'flat-action-sheet',
    //   customClass: 'app-dialog',
    //   flags: ['no-header'],
    // });
    // this.dialog.open(CollaborationsComponent, {
    //   type: 'flat-action-sheet',
    //   customClass: 'app-dialog',
    //   flags: ['no-header'],
    // });
    // +++++++ Para verificar la task 958
    // const options: StoreShareOption[] = [
    //   {
    //     text: 'asd test',
    //     mode: 'clipboard',
    //     link: 'dasdasdasdsa',
    //     icon: {
    //       src: '/upload.svg',
    //       size: {
    //         width: 20,
    //         height: 26
    //       }
    //     }
    //   },
    //   {
    //     text: 'now sharing!',
    //     mode: 'share',
    //     link: 'this is the linkj to share',
    //     icon: {
    //       src: '/upload.svg',
    //       size: {
    //         width: 20,
    //         height: 26
    //       }
    //     }
    //   },
    //   {
    //     text: 'qr thing',
    //     mode: 'qr',
    //     link: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    //     icon: {
    //       src: '/qr-code.svg',
    //       size: {
    //         width: 30,
    //         height: 30
    //       }
    //     }
    //   },
    //   {
    //     text: 'xd',
    //     func: () => console.log('uwu'),
    //   }
    // ];
    // this.dialog.open(StoreShareComponent, {
    //   type: 'fullscreen-translucent',
    //   props: {
    //     title: 'test!!!',
    //     options
    //   },
    //   customClass: 'app-dialog',
    //   flags: ['no-header'],
    // });
    // ------- Para verificar la task 958
    this.dialog.open(GeneralFormSubmissionDialogComponent, {
      type: 'centralized-fullscreen',
      props: {
        icon: 'check-circle.svg'
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  testing(){
    console.log('uwu')
  }

  displau(){
    console.log('Clickaste display');
  } 
}
