import { ThemeColor } from './../../../core/types/general.types';
import {
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { TabComponent } from './tab.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements AfterViewInit, OnDestroy {
  current: TabComponent;

  @ContentChildren(TabComponent)
  tabs: QueryList<TabComponent>;

  @HostBinding('attr.type')
  @Input()
  type: 'circle' | 'rounded' | 'elliptical' = 'rounded';

  @HostBinding('attr.color')
  @Input()
  color?: ThemeColor = undefined;

  @Input()
  withoutContent: boolean;

  @Input()
  allowSameTab = true;

  @Output()
  private selected: EventEmitter<TabComponent> = new EventEmitter();
  private routeSub: Subscription;

  env: string = environment.assetsUrl;

  constructor(
    private ref: ElementRef,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private chd: ChangeDetectorRef
  ) {}

  @HostBinding('style')
  get classes() {
    if (!this.current) return '';
    const el = this.ref.nativeElement as HTMLElement;
    const textEl: HTMLElement = el.querySelector(
      `.tab[code="${this.current.code}"] .tab-text`
    );
    const { offsetLeft, offsetTop } = textEl;
    const styles = getComputedStyle(textEl);
    return this.sanitizer.bypassSecurityTrustStyle(`
      --indicator-x: ${offsetLeft}px;
      --indicator-y: ${offsetTop}px;
      --indicator-width: ${styles.width};
      --indicator-height: ${styles.height};
    `);
  }

  select(tab: TabComponent, emit = true) {
    if (this.current?.code === tab.code && !this.allowSameTab) return;
    if (this.current) this.current.active = false;
    this.current = tab;
    if (this.current) {
      this.current.click(emit);
      if (emit) this.selected.emit(tab);
    }
  }

  ngAfterViewInit() {
    if (this.tabs.length <= 0) return;
    let active: TabComponent =
      this.tabs.find((tab) => tab.active) || this.tabs[0];
    const { url } = (this.route.snapshot as any)._routerState;
    if (url) {
      const activeWithUrl = this.tabs.find((tab) => tab.link === url);
      if (activeWithUrl) {
        active.active = false;
        active = activeWithUrl;
      }
    }
    if (active) setTimeout(() => this.select(active, false), 10);
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  @HostListener('window:resize')
  protected onResize() {
    this.chd.detectChanges();
  }
}
