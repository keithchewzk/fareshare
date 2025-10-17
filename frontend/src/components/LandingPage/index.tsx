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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl">
          Collaborative Car Usage<br />Tracking Made Simple
        </h1>
        <p className="mx-auto max-w-2xl mb-8 text-muted-foreground text-lg">
          FareShare helps groups of people fairly track and split car-related expenses.
          Whether you're sharing a family car or carpooling with colleagues, we make it easy.
        </p>
        <Button size="lg" onClick={onGetStarted} className="px-8">
          Start Tracking Now
        </Button>
      </section>

      {/* Rest of content will go here */}
    </div>
  );
}