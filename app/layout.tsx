import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Daytona Flood Watch | Coastal & Rainfall Conditions', description: 'Independent public dashboard for coastal water levels, flood-related alerts and rainfall forecasts in the Daytona Beach area.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
