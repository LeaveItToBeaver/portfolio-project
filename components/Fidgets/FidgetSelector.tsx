'use client';
import { useState, Suspense } from 'react';
import FluidSimulation from './FluidSimulation';
import MouseFollower from './MouseFollower';
import BubblePhysics from './BubblePhysics';
import Space3D from './Space3D';

type FidgetType = 'fluid' | 'follower' | 'bubbles' | 'space3d';

interface FidgetOption {
  id: FidgetType;
  name: string;
  description: string;
  component: React.ComponentType;
}

const fidgetOptions: FidgetOption[] = [
  {
    id: 'fluid',
    name: 'Fluid Sim',
    description: 'Interactive particle fluid with physics',
    component: FluidSimulation
  },
  {
    id: 'follower',
    name: 'Mouse Trail',
    description: 'Smooth following cursor with customizable trail',
    component: MouseFollower
  },
  {
    id: 'bubbles',
    name: 'Bubble Physics',
    description: 'Spin and bounce connected bouncy ball circles',
    component: BubblePhysics
  },
  {
    id: 'space3d',
    name: '3D Space',
    description: 'Interactive 3D cubes in perspective space',
    component: Space3D
  }
];

const LoadingSpinner = () => (
  <div className="w-full h-96 bg-card rounded-2xl border flex items-center justify-center">
    <div className="flex items-center space-x-3">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-foreground border-t-transparent"></div>
      <span className="text-muted-foreground">Loading fidget...</span>
    </div>
  </div>
);

export default function FidgetSelector() {
  const [selectedFidget, setSelectedFidget] = useState<FidgetType>('fluid');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleFidgetChange = async (fidgetId: FidgetType) => {
    if (fidgetId === selectedFidget) return;

    setIsTransitioning(true);
    // Small delay for smooth transition effect
    await new Promise(resolve => setTimeout(resolve, 100));
    setSelectedFidget(fidgetId);
    setIsTransitioning(false);
  };

  const selectedOption = fidgetOptions.find(option => option.id === selectedFidget);
  const SelectedComponent = selectedOption?.component;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Procrastination Text */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Procrastinate a little bit, you deserve it.</h2>
        <p className="text-muted-foreground">
          Take some time to fidget with these interactive components. Sometimes the best ideas come when you're not trying so hard.
        </p>
      </div>

      {/* Fidget Selector Bar */}
      <div className="bg-card rounded-2xl border p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {fidgetOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleFidgetChange(option.id)}
              className={`
                relative p-4 rounded-xl transition-all duration-200 text-left
                ${selectedFidget === option.id
                  ? 'bg-background border shadow-card scale-105'
                  : 'hover:bg-background/50 hover:scale-102'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{option.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">
                    {option.description}
                  </p>
                </div>
              </div>
              {selectedFidget === option.id && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Current Fidget Component */}
      <div className="relative">
        {isTransitioning ? (
          <LoadingSpinner />
        ) : (
          <div className="animate-in fade-in duration-300">
            <Suspense fallback={<LoadingSpinner />}>
              {SelectedComponent && <SelectedComponent />}
            </Suspense>
          </div>
        )}
      </div>

      {/* Info Panel */}
      {selectedOption && (
        <div className="bg-card/50 rounded-xl border p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span>Currently playing with: <strong>{selectedOption.name}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}