import { Component, OnInit } from '@angular/core';
import { MetaMaskService } from "../metamask.service";

@Component({
  selector: 'app-logout-metamask',
  templateUrl: './logout-metamask.component.html',
  styleUrls: ['./logout-metamask.component.css']
})
export class LogoutMetamaskComponent implements OnInit {

  constructor(private metaMaskService: MetaMaskService) {}

  ngOnInit(): void {
  }

  onLogout(): void {
    this.metaMaskService.clearContext();
  }

}
