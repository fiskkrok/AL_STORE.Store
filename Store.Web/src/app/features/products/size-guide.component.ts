import { Component } from '@angular/core';

// Size guide content for the tabs
@Component({
    selector: 'app-size-guide',
    standalone: true,
    template: `
    <div class="space-y-6">
      <div class="prose max-w-none">
        <h3>Size Guide</h3>
        <p>Find your perfect fit with our detailed size guide.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-muted">
              <th class="border p-2 text-left">Size</th>
              <th class="border p-2 text-left">Chest (inches)</th>
              <th class="border p-2 text-left">Waist (inches)</th>
              <th class="border p-2 text-left">Hip (inches)</th>
            </tr>
          </thead>
          <tbody>
            @for (size of sizeGuide; track size.name) {
              <tr>
                <td class="border p-2">{{ size.name }}</td>
                <td class="border p-2">{{ size.chest }}</td>
                <td class="border p-2">{{ size.waist }}</td>
                <td class="border p-2">{{ size.hip }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="bg-muted p-4 rounded-lg">
        <h4 class="font-medium mb-2">How to Measure</h4>
        <ul class="space-y-2 text-sm">
          <li>
            <strong>Chest:</strong> Measure around the fullest part of your chest
          </li>
          <li>
            <strong>Waist:</strong> Measure around your natural waistline
          </li>
          <li>
            <strong>Hip:</strong> Measure around the fullest part of your hips
          </li>
        </ul>
      </div>
    </div>
  `
})

export class SizeGuideComponent {
    sizeGuide = [
        { name: 'S', chest: '36-38', waist: '30-32', hip: '37-39' },
        { name: 'M', chest: '38-40', waist: '32-34', hip: '39-41' },
        { name: 'L', chest: '40-42', waist: '34-36', hip: '41-43' },
        { name: 'XL', chest: '42-44', waist: '36-38', hip: '43-45' },
    ];
}
