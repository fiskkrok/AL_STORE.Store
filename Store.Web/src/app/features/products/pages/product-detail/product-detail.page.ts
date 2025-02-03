import { Component, computed } from "@angular/core";
import { SectionComponent } from "../../../../core/components/layout/section.component";
import { ContainerComponent } from "../../../../core/components/layout/container.component";
import { Product } from "../../../../core/models/product.model";
import { ActivatedRoute } from '@angular/router';
import { OnInit, signal } from '@angular/core';
import { ProductService } from "../../../../core/services/product.service";

@Component({
    selector: "app-product-detail",
    standalone: true,

    template: `
    @if (product()) {
      <div class="page-container">
        <app-container>
          <app-section>
            <!-- Product Detail -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Product Image -->
              <div>
                <img 
                  [src]="imageUrl()" 
                  [alt]="product()?.name" 
                  class="w-full h-auto">
              </div>
    
              <!-- Product Info -->
              <div>
                <h1 class="h1 text-brand-navy dark:text-white">{{ product()?.name }}</h1>
                <p class="text-lg text-brand-gray">{{ product()?.description }}</p>
    
                <!-- Product Price -->
                <div class="flex items-center gap-2 mt-4">
                  <span class="text-xl font-bold text-brand-navy">{{ product()?.price }}</span>
                  <span class="text-sm text-muted-foreground">/ {{ unit }}</span>
                </div>
    
                <!-- Product Sizes -->
                <div class="flex items center gap-2 mt-4">
                  <span class="text-lg text-brand-gray">Available Sizes:</span>
                  <div class="flex items-center gap-2">
                    @for (size of sizes; track size) {
                      <span class="text-sm text-muted-foreground">{{ size }}</span>
                    }
                  </div>
                </div>
    
                <!-- Product Colors -->
                <div class="flex items center gap-2 mt-4">
                  <span class="text-lg text-brand-gray">Available Colors:</span>
                  <div class="flex items center gap-2">
                    @for (color of colors; track color) {
                      <span class="text-sm text-muted-foreground">{{ color }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          </app-section>
        </app-container>
      </div>
                }
     @else {
      <div class="loading-shimmer">Loading...</div>
    }
`,
    imports: [SectionComponent, ContainerComponent]
})
export class ProductDetailPageComponent implements OnInit {
    unit = "each";
    sizes = ["S", "M", "L", "XL"];
    colors = ["Red", "Green", "Blue"];

    product = signal<Product | null>(null);

    imageUrl = computed<string>(() => {
        const p = this.product();
        if (p && p.images && p.images.length > 0 && p.images[0].url) {
            return p.images[0].url;
        }
        const n = 1;
        return `assets/Pics/${n}.webp`;
    });

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.productService.getProduct(id).subscribe(prod => {
                this.product.set(prod);
            });
        }
    }
}

