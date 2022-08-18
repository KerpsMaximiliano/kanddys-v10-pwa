import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  HostBinding,
  Inject,
  Injector,
  NgZone,
  OnDestroy,
  Output,
  Type,
  ViewChild,
  ViewContainerRef,
  HostListener,
} from '@angular/core';

import { DialogConfig } from './../../types/dialog-config';
import { DIALOG_CHILD } from './../../types/dialog-injector';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  animations: [
    trigger('backdrop', [
      state('*', style({ opacity: 0 })),
      state('shown', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('* <=> *', [animate('0.12s')]),
    ]),
    trigger('frame', [
      state('*', style({ transform: 'translateY(100%)' })),
      state('shown', style({ transform: 'translateY(0%)' })),
      state('hidden', style({ transform: 'translateY(100%)' })),
      transition('* <=> *', [animate('0.18s')]),
    ]),
  ],
})
export class DialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('frame', { read: ViewContainerRef })
  private frame: ViewContainerRef;
  private embeded: ComponentRef<any>;
  closed: EventEmitter<any> = new EventEmitter();

  @HostBinding('attr.state')
  state: 'shown' | 'hidden' = 'shown';

  @HostBinding('attr.type')
  type = 'window';

  @HostBinding('class.maximized')
  maximized: boolean;

  @HostBinding('class')
  customClass: string;

  title: string;
  cancellable: boolean;
  locksize: boolean;
  noHeader: boolean;

  constructor(
    private zone: NgZone,
    private factory: ComponentFactoryResolver,
    private injector: Injector,
    @Inject(DIALOG_CHILD)
    private childType: Type<any>
  ) {
    const config = this.injector.get(DialogConfig);
    this.title = config.title || '';
    this.cancellable = !config.notCancellable;
    this.type = config.type || 'window';
    this.customClass = config.customClass;
    this.maximized = (config.flags || []).includes('maximized');
    this.locksize = (config.flags || []).includes('locksize');
    this.noHeader = (config.flags || []).includes('no-header');
  }

  get child() {
    return this.embeded?.instance;
  }

  @HostListener('window:keydown.esc')
  close(result?: any) {
    this.state = 'hidden';
    setTimeout(() => this.closed.emit(result), 180);
  }

  closeOnOverlayClick(event) {
      if(event.target.className.includes('dialog-frame-content') && event.target != this.frame) {
        this.state = 'hidden';
      setTimeout(() => this.closed.emit(), 180);
    }
  }

  private embed() {
    if (!this.childType) return undefined;
    this.frame.clear();
    const config = this.injector.get(DialogConfig);
    const factory = this.factory.resolveComponentFactory(this.childType);
    this.embeded = this.frame.createComponent(factory);
    if (this.embeded) {
      const props = {};
      for (const prop of [...factory.inputs, ...factory.outputs]) {
        const val = (config.props || {})[prop.propName];
        // tslint:disable-next-line: triple-equals
        if (val != undefined) props[prop.propName] = val;
      }
      Object.assign(this.embeded.instance, props);
      this.embeded.changeDetectorRef?.detectChanges();
    }
  }

  // Dragging
  startPosition: number = 0;
  height: number;
  currentPosition: number;

  onTouchMove(evt) {
    if(this.startPosition == 0) {
      this.startPosition = evt.touches[0].clientY;
    }

    this.height = (document.querySelector(".dialog-frame") as HTMLElement).clientHeight;

    let y = evt.touches[0].clientY;

    this.currentPosition = y - this.startPosition;

    if(this.currentPosition > 0 && this.startPosition > 0) {
      (document.querySelector(".dialog-frame") as HTMLElement).style.transform = "translateY("+this.currentPosition + "px)";
    }
  }

  onTouchEnd() {
    const minimunThreshold = this.height - 350;

    if(this.currentPosition < minimunThreshold || (this.currentPosition === undefined && isNaN(minimunThreshold))) {
      (document.querySelector(".dialog-frame") as HTMLElement).style.transform = "translateY(0%)";
    } else {
      (document.querySelector(".dialog-frame") as HTMLElement).style.transform = "translateY(100%%)";
      this.state = 'hidden';
      this.closed.emit(null);
    }
    this.currentPosition = undefined;
    this.startPosition = 0;
  }
  // Dragging

  ngAfterViewInit() {
    this.zone.run(() => this.embed());
  }

  ngOnDestroy() {
    if (this.embeded) this.embeded.destroy();
  }
}
