import { Component, OnInit, NgZone } from '@angular/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { CroppResult } from '../image-editor/image-editor.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-posts-slides-editor',
  templateUrl: './posts-slides-editor.component.html',
  styleUrls: ['./posts-slides-editor.component.scss'],
})
export class PostsSlidesEditorComponent implements OnInit {
  returnTo: string;
  constructor(
    public postsService: PostsService,
    private ngZone: NgZone,
    private router: Router,
    private headerService: HeaderService,
    private toastsService: ToastrService,
    private _Route : ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (
      !this.postsService.post ||
      !this.postsService.post.slides ||
      !this.postsService.post?.slides?.length ||
      this.postsService.post?.slides?.length === 0
    ) {
      this.router.navigate([
        `/ecommerce/${this.headerService.saleflow.merchant.slug}/cart`,
      ]);
    }
    this.returnTo = this._Route.snapshot.queryParamMap.get('returnTo');
  }

  async onEditSubmit(result: CroppResult) {
    try {
      const file = new File([result.blob], 'image.jpg', {
        type: 'image/jpg',
      });

      lockUI();

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = async (e) => {
        let result = reader.result;

        this.postsService.post.slides[this.postsService.editingSlide][
          'background'
        ] = result;

        this.postsService.post.slides[this.postsService.editingSlide]['media'] =
          file;

        this.ngZone.run(() => {
          this.router.navigate([
            `/ecommerce/${this.headerService.saleflow.merchant.slug}/qr-edit`,
          ], {
            queryParams: {
              returnTo: this.returnTo
            }
          });
        });
      };
      unlockUI();
    } catch (error) {
      console.log('error', error);
      this.toastsService.error(
        'Ocurrio un error al editar la imagen, intenta de nuevo',
        null,
        {
          timeOut: 1500,
        }
      );
    }
  }
}
