import { TestBed } from '@angular/core/testing';

import { EntityTemplateService } from './entity-template.service';

describe('EntityTemplateService', () => {
  let service: EntityTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntityTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
