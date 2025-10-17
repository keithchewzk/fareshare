import React from "react";
import { Button } from '../ui/button';
import { Car } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="size-6" />
            <span className="text-xl">FareShare</span>
          </div>
          <Button onClick={onGetStarted}>Get Started</Button>
        </div>
      </header>

      {/* Rest of content will go here */}
    </div>
  );
}