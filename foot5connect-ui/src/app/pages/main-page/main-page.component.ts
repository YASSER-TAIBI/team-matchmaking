import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidenavComponent } from '../../components/sidenav/sidenav.component';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-main-page',
  imports: [RouterOutlet, SidenavComponent, MenuComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

}
