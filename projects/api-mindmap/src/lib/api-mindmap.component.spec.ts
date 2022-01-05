import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiMindmapComponent } from './api-mindmap.component';

describe('ApiMindmapComponent', () => {
  let component: ApiMindmapComponent;
  let fixture: ComponentFixture<ApiMindmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiMindmapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiMindmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
