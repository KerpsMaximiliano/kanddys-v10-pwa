import { Component, OnInit, Input } from '@angular/core';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

type FunnelTag = {
  title: String;
  subtitle: String;
  options: Options[];
};

interface Options {
  id: Number;
  label: String;
  type: String;
  selected: boolean;
}

@Component({
  selector: 'app-form-funnel-v2',
  templateUrl: './form-funnel-v2.component.html',
  styleUrls: ['./form-funnel-v2.component.scss']
})
export class FormFunnelV2Component implements OnInit {
  @Input() inputTags: FunnelTag[];
  form: FormGroup;

  constructor(private fb: FormBuilder, private ref: DialogRef, private header: HeaderService) {}

  buildTags() {
    return this.fb.array(
      this.inputTags.map((tag) => this.fb.array(
        tag.options.map((option) => this.fb.control(option.selected))
      ))
    );
  }

  get getTags() {
    return this.form.get('tags');
  }
  
  ngOnInit(): void {
    console.log(this.inputTags);
    this.form = this.fb.group({
      tags: this.buildTags(),
    });
    this.header.tags = this.makeTags(this.form.get('tags').value);
  }

  close() {
    let results = this.makeTags(this.form.get('tags').value);
    this.header.tags = results;
    this.ref.close();
  }

  getValues(i: number, j: number, value: HTMLInputElement) {
    let results: boolean[][] | FunnelTag[] = this.form.get('tags').value;
    results[i][j] = value.checked;
    this.header.tags = this.makeTags(results);
  }

  makeTags(data) {
    let tempTags = this.inputTags.reduce((acc, curr, i) => {
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
  }
}
