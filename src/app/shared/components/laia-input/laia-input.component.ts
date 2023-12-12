import {
  Component,
  ViewChild,
  Input,
  OnDestroy,
  NgZone,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

// * Env.
import { environment } from 'src/environments/environment';

// * Services.
import { RecordRTCService } from 'src/app/core/services/recordrtc.service';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { HeaderService } from 'src/app/core/services/header.service';

// * Interfaces.
import { DialogConfig } from 'src/app/libs/dialog/types/dialog-config';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

interface DialogEvent {
  type: string;
  data?: IData;
}

interface IData {
  blob: Blob;
  title: string;
}

interface IConfig {
  placeholder?: string;
  store?: string;
}

// * Forms.
import { FormControl } from '@angular/forms';

// * Material.
import { MatDialog } from '@angular/material/dialog';

// * Components.
import { AudioRecorderComponent } from 'src/app/shared/components/audio-recorder/audio-recorder.component';
import { StatusAudioRecorderComponent } from 'src/app/shared/dialogs/status-audio-recorder/status-audio-recorder.component';
import { WhatsappDialogComponent } from '../../dialogs/whatsapp-dialog/whatsapp-dialog.component';

/**
 * @class
 * @name LaiaInputComponent
 * @description
 * Un componente que permite al usuario interactuar con la aplicación a través de texto o audio.
 * El usuario puede ingresar texto directamente en el área de texto o puede grabar un mensaje de audio que se convertirá en texto.
 *
 * @selector 'app-laia-input'
 * @templateUrl './laia-input.component.html'
 * @styleUrls ['./laia-input.component.scss']
 *
 * @public
 * @property config - Configuración del componente, incluyendo el placeholder y la tienda.
 * @property textarea - Control de formulario para el área de texto.
 * @property autosize - Referencia al elemento de autoajuste del área de texto.
 *
 * @private
 * @property _audio - Datos del audio grabado.
 * @property _slug - Slug del entorno de inteligencia artificial.
 * @property _destroyed$ - Observable que emite cuando el componente se destruye.
 *
 * @method ngAfterViewInit - Método del ciclo de vida que se llama después de que la vista del componente se inicializa.
 * @method ngOnDestroy - Método del ciclo de vida que se llama justo antes de que Angular destruya el componente.
 * @method record - Método que redirige al usuario o inicia la grabación de audio.
 * @method open - Método que abre el diálogo de WhatsApp.
 * @method _resize - Método privado que redimensiona el área de texto para ajustarse al contenido.
 * @method _redirect - Método privado que redirige al usuario a una URL específica.
 * @method _recording - Método privado que inicia la grabación de audio.
 */
@Component({
  selector: 'app-laia-input',
  templateUrl: './laia-input.component.html',
  styleUrls: ['./laia-input.component.scss'],
})
export class LaiaInputComponent implements AfterViewInit, OnDestroy {
  @Input() public config: IConfig;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  public textarea: FormControl = new FormControl();

  private _audio: IData | null = null;
  private _slug: string = environment.ai.slug;
  private _destroyed$ = new Subject();

  constructor(
    private _dialogService: DialogService,
    private _recordRTCService: RecordRTCService,
    private _headerService: HeaderService,
    private _gptService: Gpt3Service,
    private _router: Router,
    private _ngZone: NgZone,
    private _dialog: MatDialog
  ) {}

  public ngAfterViewInit(): void {
    this._resize();
  }

  private _resize(): void {
    this.textarea.valueChanges.subscribe(() => {
      this._ngZone.onStable
        .pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
    });
  }

  public record(): void {
    if (this.textarea.value) {
      this._redirect(this.textarea.value);
    } else {
      this._recording();
    }
  }

  public open(): void {
    this._dialog.open(WhatsappDialogComponent, {
      width: '100vw',
      panelClass: 'whatsapp-dialog',
    });
  }

  public ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  private _redirect(message: string): void {
    let url: string = `/ecommerce/${this._slug}/chat-merchant`;
    if (this.config.store) {
      url = `/ecommerce/${this.config.store}/chat-merchant`;
    }
    this._router.navigate([url], {
      queryParams: {
        message: message,
      },
    });
  }

  private _recording(): void {
    const dialogConfig: DialogConfig<Record<string, any>> = {
      type: 'flat-action-sheet',
      props: { canRecord: true, isDialog: true },
      customClass: 'app-dialog',
      flags: ['no-header'],
    };

    const dialogRef: DialogRef = this._dialogService.open(
      AudioRecorderComponent,
      dialogConfig
    );

    dialogRef.events
      .pipe(
        filter((e: DialogEvent) => e.type === 'result'),
        takeUntil(this._destroyed$)
      )
      .subscribe((e: DialogEvent) => {
        if (e?.data) {
          this._audio = e.data;
          this._save();
        }
        this._audio = null;
        this._recordRTCService.abortRecording();
      });
  }

  private async _save(): Promise<void> {
    let dialogRef: DialogRef;
    const dialogConfig: DialogConfig<Record<string, any>> = {
      type: 'flat-action-sheet',
      props: {
        message: 'Conviertiéndo el audio a texto',
        backgroundColor: '#181D17',
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    };
    try {
      dialogRef = this._dialogService.open(
        StatusAudioRecorderComponent,
        dialogConfig
      );
      if (!this._audio) {
        return;
      }
      this.textarea.setValue(
        await this._gptService.openAiWhisper(
          this._audio &&
            new File([this._audio.blob], this._audio.title ?? 'audio.mp3', {
              type: (<Blob>this._audio.blob)?.type,
            })
        )
      );
    } catch (error) {
      console.error(error);
      this._headerService.showErrorToast();
    } finally {
      dialogRef.close();
    }
  }
}
