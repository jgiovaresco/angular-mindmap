import { TestBed } from '@angular/core/testing';

import { ApiMindmapService } from './api-mindmap.service';

describe('ApiMindmapService', () => {
  let service: ApiMindmapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiMindmapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
