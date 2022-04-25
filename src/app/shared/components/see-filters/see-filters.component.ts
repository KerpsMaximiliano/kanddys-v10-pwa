import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { filter } from 'rxjs/operators';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { environment } from 'src/environments/environment';
import { FormFunnelV2Component } from '../../dialogs/form-funnel-v2/form-funnel-v2.component';
//import { FormFunnelComponent } from './../../dialogs/form-funnel/form-funnel.component';


export interface searchInput {
  value: string
  searchFunction?: any
  placeholder?: string
  background?: string
  fontFamily?: string
}

@Component({
  selector: 'app-see-filters',
  templateUrl: './see-filters.component.html',
  styleUrls: ['./see-filters.component.scss'],
})
export class SeeFiltersComponent implements OnInit {
  @Input() tags: Array<any>;
  @Input() text: string;
  @Input() title: string = 'Filters';
  @Input() type: number = 2;
  @Input() searchBar: searchInput
  @Input() showOptions: boolean = true;
  @Output() eventTags = new EventEmitter();
  @Output() deletedTag = new EventEmitter();
  @Output() loadingSwiper = new EventEmitter();
  activedTags: any[];
  notificationCount: number = 0;
  @Input() hasBookmark: boolean;
  env: string = environment.assetsUrl;

  constructor(private dialog: DialogService, public header: HeaderService) {}

  ngOnInit(): void {
    this.notificationCount = this.tags.length;
    this.updateActivedTags(this.tags);
  }

  closeTagEvent($event) {
    this.notificationCount--;
    this.eventTags.emit($event);
    console.log('Closing tag');
  }

  deletedTagFunction(e) {
    this.deletedTag.emit(e);
    let label: string;
    e.name.map(tag => label = tag.label);
    this.tags.map((tag) => {
      tag.options.map((option) => {
        if (option.label === label) {
          option.selected = false;
        }
        return option;
      });
    });
  }


  openDialog() {
    this.loadingSwiper.emit(true);
    const dialogref = this.dialog.open(FormFunnelV2Component, {
      type: 'fullscreen',
      flags: ['no-header'],
      customClass: 'app-dialog',
      props: {
        inputTags: this.tags,
        activeTags: this.activedTags,
      },
    });
    const sub = dialogref.events
      .pipe(filter((e) => e.type === 'result'))
      .subscribe((e) => {
        console.log('esta es una prueba');
        console.log(this.header.tags);
        let results = this.makeTags(this.header.tags);
        this.updateActivedTags(results);
        this.eventTags.emit(results);
        sub.unsubscribe();
      });
  }
  /*makeTags(data) {
    let tempTags = this.tags.reduce((acc, curr, i) => {
      let tag = curr.options.reduce((acc2, curr2, j) => {
        acc2.push({
          ...curr2,
          selected: data[i][j],
        });
        return acc2;
      }, []);
      acc.push({
        ...curr,
        options: tag,
      });
      return acc;
    }, []) as any[];
    return tempTags;
  }*/

  makeTags(data) {
    let tempTag: Array<any> = [];
    for (let i = 0; i < this.tags.length; i++) {
      tempTag.push(this.tags[i]);
      let tagData = data[i];
      for (let j = 0; j < tempTag[i].options.length; j++) {
        let optionData = tagData.options[j];
        tempTag[i].options[j].selected = optionData.selected;
      }
    }
    console.log(tempTag);
    return tempTag;
  }

  updateActivedTags(data) {
    let tempTags = [];
    data.map((tag) => {
      tag.options.map((option) => {
        if (option.selected) {
          tempTags.push(option);
        }
      });
    });
    this.activedTags = tempTags;
  }
}
