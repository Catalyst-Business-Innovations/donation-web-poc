import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import * as packageJson from '../../../../package.json';
// const packageJson = require('../../../../package.json');

@Injectable({
  providedIn: 'root'
})
export class CacheBusterService {
  private readonly buildDate = Number(packageJson.buildDate) || 0;
  private readonly reloadStorageKey = 'lastReloadForBuild';
  private readonly isChecked = false;
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  init(): void {
    this.clearInitialCache();

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.checkForNewBuild();
    });
  }

  private clearInitialCache(): void {
    const isCleared = localStorage.getItem('initialCacheCleared');
    if (isCleared !== 'Yes') {
      if ('caches' in window) {
        caches.keys().then(keys => {
          Promise.all(keys.map(key => caches.delete(key)))
            .then(() => {
              localStorage.setItem('initialCacheCleared', 'Yes');
            })
            .catch(err => console.error('Initial cache clearing failed:', err));
        });
      }
    }
  }

  private checkForNewBuild(): void {
    const timestamp = new Date().getTime();

    this.http
      .get<{ buildDate: string | number }>(`/assets/meta.json?${timestamp}`, {
        headers: { 'Cache-Control': 'no-cache' }
      })
      .subscribe({
        next: meta => {
          const latestBuildDate = Number(meta.buildDate || 0);

          if (!(latestBuildDate > this.buildDate)) {
            return;
          }
          let storedLast = 0;
          try {
            storedLast = Number(sessionStorage.getItem(this.reloadStorageKey) || 0);
          } catch (e) {
            storedLast = 0;
          }

          // If we've already seen an equal-or-newer build this session, skip
          if (latestBuildDate <= storedLast) {
            return;
          }

          // If meta doesn't indicate a newer build than the embedded package, do nothing
          if (latestBuildDate <= this.buildDate) {
            return;
          }

          if ('caches' in window) {
            caches.keys().then(keys => {
              Promise.all(keys.map(key => caches.delete(key)))
                .then(() => {
                  try {
                    sessionStorage.setItem(this.reloadStorageKey, String(latestBuildDate));
                  } catch (e) {
                    // Ignore storage failures
                  }
                  location.reload();
                })
                .catch(err => console.error('Cache clearing failed:', err));
            });
          }
        },
        error: err => console.error('An error occurred while fetching meta.json:', err)
      });
  }
}
