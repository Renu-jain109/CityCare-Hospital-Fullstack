import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialitiesCard } from './specialities-card';

describe('SpecialitiesCard', () => {
  let component: SpecialitiesCard;
  let fixture: ComponentFixture<SpecialitiesCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialitiesCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialitiesCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
