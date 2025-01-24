import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// Reviews component
@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="space-y-8">
      <!-- Reviews Summary -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center">
            <span class="text-2xl font-bold">{{ averageRating }}</span>
            <div class="ml-2">
              <div class="flex gap-0.5">
                @for (star of [1,2,3,4,5]; track star) {
                  <svg 
                    class="w-5 h-5"
                    [class]="star <= averageRating ? 'text-yellow-400' : 'text-gray-300'"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                }
              </div>
              <p class="text-sm text-muted-foreground">
                Based on {{ reviews.length }} reviews
              </p>
            </div>
          </div>
        </div>

        <button 
          class="px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-opacity-90 transition"
          (click)="showReviewForm = true"
        >
          Write a Review
        </button>
      </div>

      <!-- Review List -->
      <div class="space-y-6">
        @for (review of reviews; track review.id) {
          <div class="border-b pb-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex gap-0.5">
                  @for (star of [1,2,3,4,5]; track star) {
                    <svg 
                      class="w-4 h-4"
                      [class]="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  }
                </div>
                <p class="mt-1 font-medium">{{ review.title }}</p>
              </div>
              <div class="text-sm text-muted-foreground">
                {{ review.date | date }}
              </div>
            </div>
            <p class="mt-2">{{ review.comment }}</p>
            <div class="mt-2 text-sm text-muted-foreground">
              By {{ review.author }}
              @if (review.verified) {
                <span class="ml-2 text-green-600">✓ Verified Purchase</span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Review Form -->
      @if (showReviewForm) {
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-background rounded-lg p-6 w-full max-w-lg">
            <h3 class="text-lg font-medium mb-4">Write a Review</h3>
            <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
              <div class="space-y-4">
                <div>
                  <label for="rating" class="block text-sm font-medium mb-1">Rating</label>
                  <div class="flex gap-2">
                    @for (star of [1,2,3,4,5]; track star) {
                      <button 
                        type="button"
                        id="rating" (click)="setRating(star)"
                        class="focus:outline-none"
                      >
                        <svg 
                          class="w-6 h-6"
                          [class]="star <= reviewForm.get('rating')!.value! ? 'text-yellow-400' : 'text-gray-300'"
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    }
                  </div>
                </div>

                <div>
                  <label for="title" class="block text-sm font-medium mb-1">Title</label>
                  <input 
                    id="title"
                    type="text"
                    formControlName="title"
                    class="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label for="comment" class="block text-sm font-medium mb-1">Review</label>
                  <textarea
                    id="comment"
                    formControlName="comment"
                    rows="4"
                    class="w-full px-3 py-2 border rounded-md"
                  ></textarea>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  class="px-4 py-2 border rounded-md hover:bg-muted transition"
                  (click)="showReviewForm = false"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-brand-navy text-white rounded-md hover:bg-opacity-90 transition"
                  [disabled]="!reviewForm.valid || submittingReview"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ReviewsComponent {
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);

  averageRating = 4.5;
  reviews = [
    {
      id: '1',
      rating: 5,
      title: 'Great product!',
      comment: 'Really happy with this purchase. The quality is excellent.',
      author: 'John D.',
      date: new Date(),
      verified: true
    },
    // Add more reviews...
  ];

  showReviewForm = false;
  submittingReview = false;

  reviewForm = this.fb.group({
    rating: [0, Validators.required],
    title: ['', Validators.required],
    comment: ['', [Validators.required, Validators.minLength(10)]]
  });

  setRating(rating: number) {
    this.reviewForm.patchValue({ rating });
  }

  async submitReview() {
    if (this.reviewForm.valid) {
      this.submittingReview = true;
      try {
        // Submit review logic here
        this.showReviewForm = false;
        this.reviewForm.reset();
      } finally {
        this.submittingReview = false;
      }
    }
  }
}
