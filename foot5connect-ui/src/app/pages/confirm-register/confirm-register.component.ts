import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-register',
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  standalone: true,
  templateUrl: './confirm-register.component.html',
  styleUrl: './confirm-register.component.scss'
})
export class ConfirmRegisterComponent {

}
