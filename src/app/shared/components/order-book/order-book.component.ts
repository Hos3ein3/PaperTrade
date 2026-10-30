import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
  percent: number;
}

@Component({
  selector: 'app-order-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-book.component.html'
})
export class OrderBookComponent {
  public readonly currentPrice = input<number>(67450.50);
  public readonly spread = input<number>(0.50);
  public readonly spreadPercent = input<number>(0.001);

  public readonly asks = input<OrderBookLevel[]>([
    { price: 67455.0, size: 0.842, total: 56797.02, percent: 85 },
    { price: 67454.0, size: 1.250, total: 84317.50, percent: 72 },
    { price: 67453.0, size: 0.420, total: 28330.26, percent: 55 },
    { price: 67452.0, size: 2.100, total: 141649.20, percent: 45 },
    { price: 67451.0, size: 1.050, total: 70823.55, percent: 25 },
  ]);

  public readonly bids = input<OrderBookLevel[]>([
    { price: 67450.0, size: 1.540, total: 103873.00, percent: 30 },
    { price: 67449.0, size: 2.300, total: 155132.70, percent: 50 },
    { price: 67448.0, size: 0.950, total: 64075.60, percent: 65 },
    { price: 67447.0, size: 1.820, total: 122753.54, percent: 78 },
    { price: 67446.0, size: 3.410, total: 230000.86, percent: 92 },
  ]);
}
