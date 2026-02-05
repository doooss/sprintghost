'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Progress } from '@repo/ui/components/progress';
import { useCreateProject } from '@/hooks';
import { toast } from '@/lib/toast';
import type { CreateProjectDto } from '@/lib/api';

import { StepBasicInfo } from './steps/step-basic-info';
import { StepGitHub } from './steps/step-github';
import { StepJira } from './steps/step-jira';
import { StepSlack } from './steps/step-slack';
import { StepAI } from './steps/step-ai';
import { StepReview } from './steps/step-review';

export type WizardData = Partial<CreateProjectDto>;

const STEPS = [
  { id: 'basic', title: 'Basic Info', description: 'Project name and description' },
  { id: 'github', title: 'GitHub', description: 'Connect your repository' },
  { id: 'jira', title: 'Jira', description: 'Connect your Jira project' },
  { id: 'slack', title: 'Slack', description: 'Set up notifications' },
  { id: 'ai', title: 'AI', description: 'Configure AI provider (optional)' },
  { id: 'review', title: 'Review', description: 'Review and create' },
] as const;

export function ProjectWizard() {
  const router = useRouter();
  const { createProject, isCreating } = useCreateProject();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>({});

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const step = STEPS[currentStep];

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!data.name) {
      toast.error('Project name is required');
      return;
    }

    try {
      const result = await createProject(data as CreateProjectDto);
      toast.success('Project created successfully!');
      router.push(`/projects/${result.id}`);
    } catch (error) {
      toast.error('Failed to create project');
      console.error(error);
    }
  };

  const renderStep = () => {
    if (!step) return null;
    switch (step.id) {
      case 'basic':
        return <StepBasicInfo data={data} updateData={updateData} onNext={nextStep} />;
      case 'github':
        return (
          <StepGitHub data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />
        );
      case 'jira':
        return (
          <StepJira data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />
        );
      case 'slack':
        return (
          <StepSlack data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />
        );
      case 'ai':
        return <StepAI data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
      case 'review':
        return (
          <StepReview
            data={data}
            onBack={prevStep}
            onSubmit={handleSubmit}
            isSubmitting={isCreating}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="font-medium">{step?.title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="hidden gap-2 md:flex">
        {STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`flex-1 rounded-lg border p-3 text-center text-sm transition-colors ${
              index === currentStep
                ? 'border-primary bg-primary/5'
                : index < currentStep
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-muted'
            }`}
          >
            <div className="font-medium">{step.title}</div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{step?.title}</CardTitle>
          <CardDescription>{step?.description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>
    </div>
  );
}
