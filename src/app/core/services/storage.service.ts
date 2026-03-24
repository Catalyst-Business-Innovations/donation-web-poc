import { Injectable } from '@angular/core';
import { Donor, Donation, Container } from '../models/domain.models';

interface StoredDonor extends Omit<Donor, 'joinDate' | 'lastDonationDate'> {
  joinDate: string;
  lastDonationDate?: string;
}

interface StoredDonation extends Omit<Donation, 'timestamp'> {
  timestamp: string;
}

interface StoredContainer extends Omit<Container, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

interface ExportedData {
  donors?: Donor[];
  donations?: Donation[];
  containers?: Container[];
  version?: string;
  exportedAt?: string;
}

/**
 * Service for persisting donation app data to localStorage
 * Provides methods to save and restore state across sessions
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly STORAGE_KEYS = {
    donors: 'donation-app-donors',
    donations: 'donation-app-donations',
    containers: 'donation-app-containers',
    version: 'donation-app-version',
  };

  private readonly CURRENT_VERSION = '1.0.0';

  constructor() {
    this.checkVersion();
  }

  // ─── Donors ───

  saveDonors(donors: Donor[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.donors, JSON.stringify(donors));
    } catch (error) {
      console.error('Failed to save donors to localStorage:', error);
    }
  }

  loadDonors(): Donor[] | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.donors);
      if (!data) return null;
      const donors: StoredDonor[] = JSON.parse(data);
      // Convert date strings back to Date objects
      return donors.map((d) => ({
        ...d,
        joinDate: new Date(d.joinDate),
        lastDonationDate: d.lastDonationDate ? new Date(d.lastDonationDate) : undefined,
      }));
    } catch (error) {
      console.error('Failed to load donors from localStorage:', error);
      return null;
    }
  }

  // ─── Donations ───

  saveDonations(donations: Donation[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.donations, JSON.stringify(donations));
    } catch (error) {
      console.error('Failed to save donations to localStorage:', error);
    }
  }

  loadDonations(): Donation[] | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.donations);
      if (!data) return null;
      const donations: StoredDonation[] = JSON.parse(data);
      // Convert date strings back to Date objects
      return donations.map((d) => ({
        ...d,
        timestamp: new Date(d.timestamp),
      }));
    } catch (error) {
      console.error('Failed to load donations from localStorage:', error);
      return null;
    }
  }

  // ─── Containers ───

  saveContainers(containers: Container[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.containers, JSON.stringify(containers));
    } catch (error) {
      console.error('Failed to save containers to localStorage:', error);
    }
  }

  loadContainers(): Container[] | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.containers);
      if (!data) return null;
      const containers: StoredContainer[] = JSON.parse(data);
      // Convert date strings back to Date objects
      return containers.map((c) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load containers from localStorage:', error);
      return null;
    }
  }

  // ─── Version Management ───

  private checkVersion(): void {
    const storedVersion = localStorage.getItem(this.STORAGE_KEYS.version);
    if (storedVersion !== this.CURRENT_VERSION) {
      // Version mismatch - clear old data
      console.log('Version mismatch detected. Clearing old data.');
      this.clearAll();
      localStorage.setItem(this.STORAGE_KEYS.version, this.CURRENT_VERSION);
    }
  }

  // ─── Utility Methods ───

  clearAll(): void {
    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.setItem(this.STORAGE_KEYS.version, this.CURRENT_VERSION);
  }

  hasStoredData(): boolean {
    return (
      !!localStorage.getItem(this.STORAGE_KEYS.donors) ||
      !!localStorage.getItem(this.STORAGE_KEYS.donations) ||
      !!localStorage.getItem(this.STORAGE_KEYS.containers)
    );
  }

  exportData(): string {
    return JSON.stringify(
      {
        donors: this.loadDonors(),
        donations: this.loadDonations(),
        containers: this.loadContainers(),
        version: this.CURRENT_VERSION,
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    );
  }

  importData(jsonData: string): boolean {
    try {
      const data: ExportedData = JSON.parse(jsonData);
      if (data.donors) this.saveDonors(data.donors);
      if (data.donations) this.saveDonations(data.donations);
      if (data.containers) this.saveContainers(data.containers);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}
