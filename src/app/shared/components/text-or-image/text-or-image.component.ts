import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { base64ToFile, fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { AnswerDefaultInput } from 'src/app/core/models/webform';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { arrayOfRoutesToBase64 } from 'src/app/core/helpers/files.helpers';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-text-or-image',
  templateUrl: './text-or-image.component.html',
  styleUrls: ['./text-or-image.component.scss'],
})
export class TextOrImageComponent implements OnInit {
  environment: string = environment.assetsUrl;
  itemId: string = null;
  updatingWebform: boolean = false;
  updatingQuestion: boolean = false;
  webformId: string = null;
  questionId: string = null;
  options: Array<{
    text: string;
    void: boolean;
    fileData?: string | ArrayBuffer;
    file?: File;
  }> = [{ text: 'Escribe..', void: true }];
  isUserOnDesktop: boolean = false;

  constructor(
    private webformService: WebformsService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(({ itemId }) => {
      this.route.queryParams.subscribe(
        async ({
          editingQuestion,
          updatingWebform,
          updatingQuestion,
          webformId,
          questionId,
        }) => {
          //editing questions is when you are editing a question that doesn't exists in the database yet, so it's a new question
          //updating question is when you are editing a question that already exists in the database, so it's an existing question

          if (itemId) this.itemId = itemId;

          if (updatingWebform && webformId) {
            this.updatingWebform = Boolean(updatingWebform);
            this.webformId = webformId;
          }

          if (updatingQuestion && questionId && webformId) {
            this.updatingQuestion = Boolean(updatingQuestion);
            this.questionId = questionId;
            this.webformId = webformId;
          }

          if (this.webformService.webformQuestions.length === 0) {
            this.router.navigate(['admin/article-editor/' + this.itemId]);
          }

          //Checks wether the user is on a desktop device or not
          this.isUserOnDesktop = this.isDesktop();

          if (
            !updatingQuestion &&
            editingQuestion &&
            this.webformService.webformQuestions[
              this.webformService.webformQuestions.length - 1
            ]?.answerDefault.length !== 0
          ) {
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
          } else if (
            updatingQuestion &&
            this.webformService.currentEditingQuestion &&
            this.webformService.currentEditingQuestion.answerDefault.length !==
              0
          ) {
            this.options = [];

            let options = [];

            console.log(
              'options',
              this.webformService.currentEditingQuestionChoices
            );

            if (this.webformService.currentEditingQuestionChoices === null) {
              options = await arrayOfRoutesToBase64(
                this.webformService.currentEditingQuestion.answerDefault
              );

              for await (const option of options) {
                const fileData = option as string;

                this.options.push({
                  text: '',
                  file: base64ToFile(option),
                  void: false,
                  fileData,
                });
              }
            } else {
              options = this.webformService.currentEditingQuestionChoices;

              for await (const option of options) {
                const fileData = await fileToBase64(option.media);

                this.options.push({
                  text: '',
                  file: option.media,
                  void: false,
                  fileData,
                });
              }
            }
          }
        }
      );
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

  deleteOption(index: number) {
    this.options.splice(index, 1);
  }

  async loadFile(
    event: Event,
    optionIndex: number,
    directory: boolean = false
  ) {
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList.length) return;

    const toAdd = fileList.length - 1;

    if (toAdd > 0) {
      for (let i = 0; i < fileList.length; i++) {
        if (i > 0) this.addOption();
      }
    }

    let loadedFiles = 0;

    lockUI();

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (e) => {
        loadedFiles++;
        this.options[optionIndex + i].file = file;
        this.options[optionIndex + i].fileData = reader.result;
        //content['background'] = result;

        if (loadedFiles === fileList.length) {
          unlockUI();
        }
      };
    }
  }

  goBackOrSave() {
    const optionsToAdd: Array<AnswerDefaultInput> = [];

    let hasInvalidInputs = false;

    for (const option of this.options) {
      const hasOptionText = Boolean(
        option.text && option.text.length && option.text !== 'Escribe..'
      );
      const hasOptionMedia = option.file;

      if (hasOptionMedia && hasOptionText) {
        optionsToAdd.push({
          active: true,
          isMedia: 'fileData' in option,
          media: 'fileData' in option ? option.file : null,
          value: 'fileData' in option ? null : option.text,
          label:
            'fileData' in option && option.text && !option.void
              ? option.text
              : null,
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

      if (!hasOptionText && !hasOptionMedia && optionsToAdd.length > 0) {
        hasInvalidInputs = true;
      }
    }

    if (!hasInvalidInputs) {
      this.webformService.webformQuestions[
        this.webformService.webformQuestions.length - 1
      ].answerDefault = optionsToAdd;

      if (this.itemId && !this.updatingWebform && !this.updatingQuestion)
        return this.router.navigate(['admin/article-editor/' + this.itemId], {
          queryParams: {
            resumeWebform: true,
          },
        });

      if (this.updatingWebform && !this.updatingQuestion) {
        return this.router.navigate(
          ['admin/webform-metrics/' + this.webformId + '/' + this.itemId],
          {
            queryParams: {
              resumeWebform: true,
            },
          }
        );
      }

      if (this.updatingQuestion) {
        return this.router.navigate(
          ['admin/webforms-editor/' + this.webformId + '/' + this.itemId],
          {
            queryParams: {
              resumeWebform: true,
              lastOpenedQuestionId: this.questionId,
            },
          }
        );
      }

      this.location.back();
    } else {
      this.snackBar.open(
        'Opciones vacías, debes colocar una imagen, un texto/nombre, o ambas, también puedes borrar las opciones vacías',
        '',
        {
          duration: 2000,
        }
      );
    }
  }

  isDesktop = () => {
    const ua = navigator.userAgent;
    return (
      /Windows NT|Macintosh|Linux/i.test(ua) &&
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    );
  };
}
