import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { AnswerDefaultInput } from 'src/app/core/models/webform';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-text-or-image',
  templateUrl: './text-or-image.component.html',
  styleUrls: ['./text-or-image.component.scss'],
})
export class TextOrImageComponent implements OnInit {
  environment: string = environment.assetsUrl;
  itemId: string = null;
  options: Array<{
    text: string;
    void: boolean;
    fileData?: string | ArrayBuffer;
    file?: File;
  }> = [{ text: 'Escribe..', void: true }];

  constructor(
    private webformService: WebformsService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(({ itemId }) => {
      this.route.queryParams.subscribe(async ({ editingQuestion }) => {
        if (itemId) this.itemId = itemId;

        if(this.webformService.webformQuestions.length === 0) {
          this.router.navigate(['admin/article-editor/' + this.itemId]);
        }

        if (editingQuestion) {
          this.options = [];
          for await (const option of this.webformService.webformQuestions[
            this.webformService.webformQuestions.length - 1
          ].answerDefault) {
            const fileData = option.media
              ? await fileToBase64(option.media)
              : null;

            this.options.push({
              text: !option.media
                ? option.value
                : option.label
                ? option.label
                : null,
              file: !option.media ? null : option.media,
              void: false,
              fileData,
            });
          }
        }
      });
    });
  }

  textChanged(index: number) {
    if (this.options[index].text.trim() == '') {
      this.options[index].void = true;
    } else {
      this.options[index].void = false;
    }
  }

  focusInEvent(index: number) {
    if (this.options[index].void) {
      this.options[index].text = '';
    }
  }
  focusOutEvent(index: number) {
    if (this.options[index].text.trim() == '') {
      this.options[index].text = 'Escribe..';
    }
  }

  addOption() {
    this.options.push({ text: 'Escribe..', void: true });
  }

  async loadFile(event: Event, optionIndex: number) {
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList.length) return;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (e) => {
        this.options[optionIndex].file = file;
        this.options[optionIndex].fileData = reader.result;
        console.log(this.options[optionIndex]);
        //content['background'] = result;
      };
    }
  }

  goBackOrSave() {
    const optionsToAdd: Array<AnswerDefaultInput> = [];

    for (const option of this.options) {
      const hasOptionText = option.text && option.text.length;
      const hasOptionMedia = option.file;

      if (hasOptionMedia && hasOptionText) {
        optionsToAdd.push({
          active: true,
          isMedia: 'fileData' in option,
          media: 'fileData' in option ? option.file : null,
          value: 'fileData' in option ? null : option.text,
          label: 'fileData' in option && option.text && !option.void ? option.text : null,
        });
      }

      if (!hasOptionText && hasOptionMedia) {
        optionsToAdd.push({
          isMedia: true,
          media: option.file,
        });
      }

      if (hasOptionText && !hasOptionMedia) {
        optionsToAdd.push({
          active: true,
          isMedia: false,
          value: option.text,
        });
      }
    }

    this.webformService.webformQuestions[
      this.webformService.webformQuestions.length - 1
    ].answerDefault = optionsToAdd;

    if (this.itemId)
      this.router.navigate(['admin/article-editor/' + this.itemId], {
        queryParams: {
          resumeWebform: true,
        },
      });
    this.location.back();
  }
}
