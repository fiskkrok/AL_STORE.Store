import { Component } from "@angular/core";
import { SectionComponent } from "../../../../core/components/layout/section.component";
import { ContainerComponent } from "../../../../core/components/layout/container.component";

@Component({
    selector: "app-product-detail",
    standalone: true,

    template: `
    <div class="page-container">
      <app-container>
        <app-section>
          <!-- Product Detail -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Product Image -->
            <div>
              <img [src]="product.imageUrl" [alt]="product.name" class="w-full h-auto">
            </div>
  
            <!-- Product Info -->
            <div>
              <h1 class="h1 text-brand-navy dark:text-white">{{ product.name }}</h1>
              <p class="text-lg text-brand-gray">{{ product.description }}</p>
  
              <!-- Product Price -->
              <div class="flex items-center gap-2 mt-4">
                <span class="text-xl font-bold text-brand-navy">{{ product.price }}</span>
                <span class="text-sm text-muted-foreground">/ {{ product.unit }}</span>
                </div>

                <!-- Product Sizes -->
                <div class="flex items center gap-2 mt-4">
                    <span class="text-lg text-brand-gray">Available Sizes:</span>
                    <div class="flex items-center gap-2">
                        @for (size of product.sizes; track size) {
                            <span class="text-sm text-muted-foreground">{{ size }}</span>
                        }
                    </div>
                </div>

                <!-- Product Colors -->
                <div class="flex items
                center gap-2 mt-4">
                    <span class="text-lg text-brand-gray">Available Colors:</span>
                    <div class="flex items
                    center gap-2">
                        @for (color of product.colors; track color) {
                            <span class="text-sm text-muted-foreground">{{ color }}</span>
                        }
                    </div>
                </div>
            </div>
        </div>
    </app-section>
</app-container>
</div>
`,
    imports: [SectionComponent, ContainerComponent]
})
export class ProductDetailPageComponent {
    product = {
        imageUrl: "https://via.placeholder.com/400",
        name: "Product Name",
        description: "Product description goes here",
        price: "$19.99",
        unit: "each",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Red", "Green", "Blue"]
    };

}
