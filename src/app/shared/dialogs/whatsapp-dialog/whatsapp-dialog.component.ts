import { Component } from '@angular/core';

/**
 * @class
 * @name WhatsappDialogComponent
 * @description
 * Un componente que permite al usuario abrir una conversación de WhatsApp.
 * El usuario puede hacer clic en un botón que abre una nueva pestaña con la conversación de WhatsApp.
 *
 * @public
 * @property url - Dirección de la conversación de WhatsApp.
 *
 * @private
 * @property _phone - Número de teléfono del usuario.
 */
@Component({
  selector: 'app-whatsapp-dialog',
  template: `
    <div>
      <p>Abrir la conversación en WhatsApp</p>
      <a [href]="url" target="_blank">
        <button mat-icon-button>
          <mat-icon>open_in_new</mat-icon>
        </button>
      </a>
    </div>
  `,
  styles: [
    `
      div {
        background-color: #181d17;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr max-content;
        align-items: center;
        margin: 0;
        padding: 16px;
        border-radius: 12px;

        & p {
          margin: 0;
          color: #c4c5c3;
          font-size: 16px;
        }

        & button {
          background-color: #353434;
          color: #ffffff;
        }
      }
    `,
  ],
})
export class WhatsappDialogComponent {
  public url: string;

  private _phone: string = '0';

  // private _phoneService: PhoneService
  constructor() {}

  public ngOnInit(): void {
    // const phone: string = this._phoneService.phone();
    // this._phone = `https://api.whatsapp.com/send?phone=${this._phone}`;
  }
}
