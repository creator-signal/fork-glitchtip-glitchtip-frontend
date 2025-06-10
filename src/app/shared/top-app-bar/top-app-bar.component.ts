import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'gt-top-app-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule
  ],
  templateUrl: './top-app-bar.component.html',
  styleUrls: ['./top-app-bar.component.scss']
})
export class TopAppBarComponent {
  
}