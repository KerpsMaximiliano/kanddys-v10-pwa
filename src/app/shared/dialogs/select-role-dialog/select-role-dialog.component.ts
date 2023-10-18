import {Component, Inject} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

export interface DialogTemplate {
  title?: string;
  options: Array<{
    value: string;
    active?: boolean;
    callback: () => void;
    noSettings?: boolean;
  }>;
  styles?: Record<string, Record<string, string>>;
  bottomLeft?: {
    text: string;
    callback: () => void;
  };
}

@Component({
  selector: 'app-select-role-dialog',
  templateUrl: './select-role-dialog.component.html',
  styleUrls: ['./select-role-dialog.component.scss']
})
export class SelectRoleDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SelectRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogTemplate,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onClick(index: number) {
    this.data.options[index].callback();
    this.dialogRef.close();
  }

  bottomLeftClick() {
    this.data.bottomLeft.callback();
    this.dialogRef.close();
  }

  signout() {
    this.authService.signout();
  }

  goToMerchantEditor() {
    this.dialogRef.close();
    this.router.navigate(['/admin/merchant-editor']);
    return;
  }

}
