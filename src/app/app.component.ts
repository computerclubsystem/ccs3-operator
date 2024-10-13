import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { ConnectorService, ConnectorSettings } from './connector/connector.service';
import { SubjectsService } from './shared/subjects.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly connectorSvc: ConnectorService,
    private readonly subjectsSvc: SubjectsService,
    @Inject(DOCUMENT) private readonly document: Document,
  ) { }

  ngOnInit(): void {
    this.loadWebAppConfig();
    const connectorSettings: ConnectorSettings = {
      url: `wss://${this.document.defaultView?.location.host}`,
    };
    this.connectorSvc.start(connectorSettings);
    this.router.navigate(['sign-in']);
    this.connectorSvc.getMessageObservable().subscribe(ev => this.processConnectorMessage(ev));
    this.connectorSvc.getConnectedObservable().subscribe(ev => this.processConnectorConnected(ev));
    this.connectorSvc.getClosedObservable().subscribe(ev => this.processConnectorClosed(ev));
    this.connectorSvc.getErrorObservable().subscribe(ev => this.processConnectorError(ev));
    this.connectorSvc.getMessageErrorObservable().subscribe(ev => this.processConnectorMessageError(ev));
  }

  private async loadWebAppConfig(): Promise<void> {
    const res = await fetch('web-app-config.json');
    const config = await res.json();
    this.subjectsSvc.getWebAppConfigSubject().next(config);
  }

  private processConnectorMessage(ev: any): void {
    console.log('Connector message', ev);
  }

  private processConnectorConnected(ev: any): void {
    console.log('Connector connected', ev);
  }

  private processConnectorClosed(ev: any): void {
    console.log('Connector closed', ev);
  }

  private processConnectorError(ev: any): void {
    console.log('Connector error', ev);
  }

  private processConnectorMessageError(ev: any): void {
    console.log('Connector message error', ev);
  }
}
