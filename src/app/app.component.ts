import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorModalComponent } from './shared/components/error-modal/error-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ErrorModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
