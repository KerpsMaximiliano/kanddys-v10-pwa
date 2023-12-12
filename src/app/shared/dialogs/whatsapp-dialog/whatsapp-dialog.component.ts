import { Component, Inject } from '@angular/core';

// * Environment.
import { environment } from 'src/environments/environment';

// * Services.
import { MerchantsService } from 'src/app/core/services/merchants.service';

// * Material.
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * @class
 * @name WhatsappDialogComponent
 * @description
 * Un componente que permite al usuario abrir una conversación de WhatsApp.
 * El usuario puede hacer clic en un botón que abre una nueva pestaña con la conversación de WhatsApp.
 *
 * @public
 * @property url - Dirección de la conversación de WhatsApp.
 * @property status - Estado de la solicitud.
 * @property data - Datos inyectados en el diálogo: slug.
 *
 * @private
 * @property _merchantService - Servicio para interactuar con los comerciantes.
 * @property dialogRef - Referencia al diálogo abierto.
 */
@Component({
  selector: 'app-whatsapp-dialog',
  template: `
    <style>
      div {
        background-color: #181d17;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr max-content;
        align-items: center;
        margin: 0;
        padding: 16px;
        border-radius: 12px;
      }

      p {
        margin: 0;
        color: #c4c5c3;
        font-size: 16px;
      }

      button {
        background-color: #353434;
        color: #ffffff;
      }
    </style>
    <div>
      <p>Abrir la conversación en WhatsApp</p>
      <a [href]="url" *ngIf="status" target="_blank">
        <button mat-icon-button>
          <mat-icon>open_in_new</mat-icon>
        </button>
      </a>
    </div>
  `,
})
export class WhatsappDialogComponent {
  public url: string;
  public status: boolean = false;

  constructor(
    private _merchantService: MerchantsService,
    public dialogRef: MatDialogRef<WhatsappDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  public ngOnInit(): void {
    let id: string = environment.ai.slug;
    if (this.data?.slug) id = this.data.slug;
    this._merchantService
      .merchantBySlug(id)
      .then((res: any) => {
        if (res?.owner?.phone) {
          this.status = true;
          this.url = `https://api.whatsapp.com/send?phone=${res.owner.phone}`;
        }
      })
      .catch((err) => {
        console.error('whatsapp-dialog.component.ts => ngOnInit() => ', err);
      });
  }
}
