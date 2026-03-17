import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent, IconName } from '../../../shared/components/icon/icon.component';

interface ModuleCard {
  icon: IconName;
  name: string;
  description: string;
  features: string[];
  btnLabel: string;
  route: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly modules: ModuleCard[] = [
    {
      icon: 'user',
      name: 'Donor Portal',
      route: '/donor/login',
      btnLabel: 'Sign In',
      description: 'Self-service portal for donors to manage donations, history and rewards.',
      features: ['View donation history', 'Download tax receipts', 'Track loyalty rewards', 'Schedule donations']
    },
    {
      icon: 'package',
      name: 'Staff Portal',
      route: '/staff',
      btnLabel: 'Launch',
      description: 'Fast donation intake for store staff — complete a donation in under 10 seconds.',
      features: ['Donor identification', 'Category quick-tap', 'Presort management', 'Container tracking']
    }
  ];
}
