import React from "react";
import { Button } from '../ui/button';
import { Car, Users, Receipt } from 'lucide-react';

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

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 mb-4">
              <Users className="size-6" />
            </div>
            <h3 className="mb-2">Create & Join Groups</h3>
            <p className="text-muted-foreground">
              Set up groups for your shared car and invite others with unique codes
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 mb-4">
              <Car className="size-6" />
            </div>
            <h3 className="mb-2">Track Your Trips</h3>
            <p className="text-muted-foreground">
              Log trips with automatic cost calculation based on distance and rates
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 mb-4">
              <Receipt className="size-6" />
            </div>
            <h3 className="mb-2">Stay Organized</h3>
            <p className="text-muted-foreground">
              View trip history and monitor payment status for fair cost sharing
            </p>
          </div>
        </div>
      </section>

      {/* Rest of content will go here */}
    </div>
  );
}