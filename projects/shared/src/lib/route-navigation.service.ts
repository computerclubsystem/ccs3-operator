import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RouteNavigationService {
  private readonly navigateToEditDeviceRequestedSubject = new Subject<number>();
  private readonly navigateToCreateDeviceRequestedSubject = new Subject<void>();
  private readonly navigateToCreateNewTariffRequestedSubject = new Subject<void>();
  private readonly navigateToCreateNewPrepaidTariffRequestedSubject = new Subject<void>();
  private readonly navigateToEditTariffRequestedSubject = new Subject<number>();
  private readonly navigateToEditPrepaidTariffRequestedSubject = new Subject<number>();
  private readonly navigateToCreateNewRoleRequestedSubject = new Subject<void>();
  private readonly navigateToEditRoleRequestedSubject = new Subject<number>();
  private readonly navigateToSignInRequestedSubject = new Subject<void>();
  private readonly navigateToCreateDeviceGroupRequestedSubject = new Subject<void>();
  private readonly navigateToEditDeviceGroupRequestedSubject = new Subject<number>();

  navigateToEditDeviceGroupRequested(deviceGroupId: number): void {
    this.navigateToEditDeviceGroupRequestedSubject.next(deviceGroupId);
  }

  getNavigateToEditDeviceGroupRequested(): Observable<number> {
    return this.navigateToEditDeviceGroupRequestedSubject.asObservable();
  }

  navigateToCreateDeviceGroupRequested(): void {
    this.navigateToCreateDeviceGroupRequestedSubject.next();
  }

  getNavigateToCreateDeviceGroupRequested(): Observable<void> {
    return this.navigateToCreateDeviceGroupRequestedSubject.asObservable();
  }

  navigateToSignInRequested(): void {
    this.navigateToSignInRequestedSubject.next();
  }

  getNavigateToSignInRequested(): Observable<void> {
    return this.navigateToSignInRequestedSubject.asObservable();
  }

  navigateToEditRoleRequested(roleId: number): void {
    this.navigateToEditRoleRequestedSubject.next(roleId);
  }

  getNavigateToEditRoleRequested(): Observable<number> {
    return this.navigateToEditRoleRequestedSubject.asObservable();
  }

  navigateToCreateNewRoleRequested(): void {
    this.navigateToCreateNewRoleRequestedSubject.next();
  }

  getNavigateToCreateNewRoleRequested(): Observable<void> {
    return this.navigateToCreateNewRoleRequestedSubject.asObservable();
  }

  navigateToEditTariffRequested(tariffId: number): void {
    this.navigateToEditTariffRequestedSubject.next(tariffId);
  }

  getNavigateToEditTariffRequested(): Observable<number> {
    return this.navigateToEditTariffRequestedSubject.asObservable();
  }

  navigateToCreateNewTariffRequested(): void {
    this.navigateToCreateNewTariffRequestedSubject.next();
  }

  getNavigateToCreateNewTariffRequested(): Observable<void> {
    return this.navigateToCreateNewTariffRequestedSubject.asObservable();
  }

  navigateToEditPrepaidTariffRequested(tariffId: number): void {
    this.navigateToEditPrepaidTariffRequestedSubject.next(tariffId);
  }

  getNavigateToEditPrepaidTariffRequested(): Observable<number> {
    return this.navigateToEditPrepaidTariffRequestedSubject.asObservable();
  }

  navigateToCreateNewPrepaidTariffRequested(): void {
    this.navigateToCreateNewPrepaidTariffRequestedSubject.next();
  }

  getNavigateToCreateNewPrepaidTariffRequested(): Observable<void> {
    return this.navigateToCreateNewPrepaidTariffRequestedSubject.asObservable();
  }

  navigateToCreateDeviceRequested(): void {
    this.navigateToCreateDeviceRequestedSubject.next();
  }

  getNavigateToCreateDeviceRequested(): Observable<void> {
    return this.navigateToCreateDeviceRequestedSubject.asObservable();
  }

  navigateToEditDeviceRequested(deviceId: number): void {
    this.navigateToEditDeviceRequestedSubject.next(deviceId);
  }

  getNavigateToEditDeviceRequested(): Observable<number> {
    return this.navigateToEditDeviceRequestedSubject.asObservable();
  }
}
