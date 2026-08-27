import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { Organization, PolicySection } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';

const STEPS = [
  { id: 1, title: 'Организация' },
  { id: 2, title: 'Применимые разделы' },
  { id: 3, title: 'Выбор разделов' },
  { id: 4, title: 'Предпросмотр' },
];

type WizardState = {
  organizationId: number | null;
  selectedSections: number[];
};

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<WizardState>({
    organizationId: null,
    selectedSections: [],
  });

  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
  });

  const { data: applicableSections = [] } = useQuery<PolicySection[]>({
    queryKey: ['/api/policy-sections/applicable', state.organizationId],
    enabled: state.organizationId !== null,
  });

  const generatePolicy = useMutation({
    mutationFn: () =>
      apiRequest('POST', '/api/generated-policies', {
        organizationId: state.organizationId,
        selectedSections: state.selectedSections,
      }),
  });

  const selectedOrg = organizations.find(org => org.id === state.organizationId);
  const selectedSectionDetails = applicableSections.filter(section =>
    state.selectedSections.includes(section.id)
  );

  const toggleSection = (sectionId: number) => {
    setState(prev => ({
      ...prev,
      selectedSections: prev.selectedSections.includes(sectionId)
        ? prev.selectedSections.filter(id => id !== sectionId)
        : [...prev.selectedSections, sectionId],
    }));
  };

  const canGoNext =
    (currentStep === 1 && state.organizationId !== null) ||
    currentStep === 2 ||
    (currentStep === 3 && state.selectedSections.length > 0);

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      <Progress value={progress} />

      <div className="flex gap-3 text-sm">
        {STEPS.map(step => (
          <span
            key={step.id}
            className={step.id === currentStep ? 'font-semibold' : 'text-muted-foreground'}
          >
            {step.id}. {step.title}
          </span>
        ))}
      </div>

      {currentStep === 1 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Выберите организацию</h2>
          {organizations.map(org => (
            <Button
              key={org.id}
              variant={state.organizationId === org.id ? 'default' : 'outline'}
              onClick={() =>
                setState({ organizationId: org.id, selectedSections: [] })
              }
            >
              {org.name}
            </Button>
          ))}
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Применимые разделы</h2>
          <p className="text-sm text-muted-foreground">
            Для {selectedOrg?.name ?? 'выбранной организации'} найдено {applicableSections.length} разделов.
          </p>
          {applicableSections.map(section => (
            <div key={section.id} className="border rounded-lg p-3">
              <strong>{section.sectionNumber} — {section.title}</strong>
              <p className="text-sm text-muted-foreground">{section.content}</p>
            </div>
          ))}
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Выберите разделы для политики</h2>
          {applicableSections.map(section => (
            <label key={section.id} className="flex items-start gap-3 border rounded-lg p-3">
              <Checkbox
                checked={state.selectedSections.includes(section.id)}
                onCheckedChange={() => toggleSection(section.id)}
              />
              <span>
                <strong>{section.sectionNumber} — {section.title}</strong>
                <span className="block text-sm text-muted-foreground">
                  {section.content.substring(0, 120)}...
                </span>
              </span>
            </label>
          ))}
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Предпросмотр</h2>
          <p>{selectedOrg?.name}</p>
          {selectedSectionDetails.map(section => (
            <div key={section.id} className="border rounded-lg p-3">
              <strong>{section.sectionNumber} — {section.title}</strong>
            </div>
          ))}
          <Button onClick={() => generatePolicy.mutate()} disabled={generatePolicy.isPending}>
            {generatePolicy.isPending ? 'Формирование...' : 'Сформировать политику'}
          </Button>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep(step => step - 1)}
        >
          Назад
        </Button>
        <Button
          disabled={currentStep === 4 || !canGoNext}
          onClick={() => setCurrentStep(step => step + 1)}
        >
          Далее
        </Button>
      </div>
    </div>
  );
}
