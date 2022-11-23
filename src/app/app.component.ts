import { Component } from '@angular/core';
import { MetaMaskService } from "./metamask/metamask.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private metaMaskService: MetaMaskService) {}

 }