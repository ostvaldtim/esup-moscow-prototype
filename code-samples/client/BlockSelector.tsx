import { useEffect, useState } from 'react';
import {
  getAIRecommendations,
  getRecommendationColor,
  type AIRecommendation,
  type Block,
  type Organization,
} from '@/lib/yandexgpt';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface BlockSelectorProps {
  blocks: Block[];
  selectedBlockIds: number[];
  organization?: Organization;
  onSelectionChange: (selectedIds: number[]) => void;
  showRecommendations?: boolean;
}

const recommendationLabel: Record<AIRecommendation['recommendation'], string> = {
  mandatory: 'Обязательный',
  recommended: 'Рекомендуемый',
  optional: 'Опциональный',
};

export default function BlockSelector({
  blocks,
  selectedBlockIds,
  organization,
  onSelectionChange,
  showRecommendations = true,
}: BlockSelectorProps) {
  const [recommendations, setRecommendations] = useState<Map<number, AIRecommendation>>(new Map());
  const [loading, setLoading] = useState(false);
  const [filterSection, setFilterSection] = useState('all');

  useEffect(() => {
    if (!showRecommendations || !organization || blocks.length === 0) {
      setRecommendations(new Map());
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const recs = await getAIRecommendations(organization.id, blocks);
        if (!cancelled) {
          setRecommendations(new Map(recs.map(rec => [rec.blockId, rec])));
        }
      } catch (error) {
        console.error('Ошибка загрузки рекомендаций:', error);
        if (!cancelled) setRecommendations(new Map());
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [organization?.id, blocks, showRecommendations]);

  const toggleBlock = (blockId: number) => {
    onSelectionChange(
      selectedBlockIds.includes(blockId)
        ? selectedBlockIds.filter(id => id !== blockId)
        : [...selectedBlockIds, blockId]
    );
  };

  const sections = Array.from(new Set(blocks.map(block => block.section)));
  const filteredBlocks =
    filterSection === 'all' ? blocks : blocks.filter(block => block.section === filterSection);

  const selectFiltered = () => {
    const filteredIds = filteredBlocks.map(block => block.id);
    onSelectionChange([...new Set([...selectedBlockIds, ...filteredIds])]);
  };

  const selectMandatory = () => {
    const mandatoryIds = blocks.filter(block => block.is_mandatory).map(block => block.id);
    onSelectionChange([...new Set([...selectedBlockIds, ...mandatoryIds])]);
  };

  const selectRecommended = () => {
    const ids = Array.from(recommendations.entries())
      .filter(([, rec]) => rec.recommendation !== 'optional')
      .map(([blockId]) => blockId);

    onSelectionChange([...new Set([...selectedBlockIds, ...ids])]);
  };

  const mandatoryCount = blocks.filter(block => block.is_mandatory).length;
  const selectedMandatoryCount = blocks.filter(
    block => block.is_mandatory && selectedBlockIds.includes(block.id)
  ).length;

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Выбор блоков СУП</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Выбрано: {selectedBlockIds.length} из {blocks.length}</Badge>
            <Badge variant={selectedMandatoryCount === mandatoryCount ? 'success' : 'destructive'}>
              Обязательных: {selectedMandatoryCount} / {mandatoryCount}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={selectFiltered}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Выбрать показанные
          </Button>

          <Button variant="outline" size="sm" onClick={selectMandatory}>
            <AlertCircle className="w-4 h-4 mr-2" />
            Обязательные
          </Button>

          {showRecommendations && organization && (
            <Button variant="outline" size="sm" onClick={selectRecommended} disabled={loading}>
              {loading ? 'Загрузка рекомендаций...' : 'Добавить рекомендованные'}
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={() => onSelectionChange([])}>
            Очистить
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filterSection === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSection('all')}
        >
          Все разделы ({blocks.length})
        </Button>

        {sections.map(section => {
          const count = blocks.filter(block => block.section === section).length;
          return (
            <Button
              key={section}
              variant={filterSection === section ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSection(section)}
            >
              {section} ({count})
            </Button>
          );
        })}
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredBlocks.map(block => {
          const selected = selectedBlockIds.includes(block.id);
          const recommendation = recommendations.get(block.id);

          return (
            <div
              key={block.id}
              className={`border rounded-lg p-3 transition-colors ${
                selected ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
              } ${block.is_mandatory ? 'border-l-4 border-l-red-500' : ''}`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => toggleBlock(block.id)}
                  className="mt-1"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-gray-500">{block.number}</span>
                    {block.is_mandatory && (
                      <Badge variant="destructive" className="text-xs">Обязательный</Badge>
                    )}
                    {recommendation && showRecommendations && (
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${getRecommendationColor(recommendation.recommendation)}20`,
                          borderColor: getRecommendationColor(recommendation.recommendation),
                        }}
                        className="text-xs"
                      >
                        {recommendationLabel[recommendation.recommendation]}
                      </Badge>
                    )}
                  </div>

                  <h4 className="font-semibold text-sm mb-1">{block.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">{block.full_text}</p>

                  {recommendation?.reason && showRecommendations && (
                    <p className="text-xs text-gray-500 mt-2">{recommendation.reason}</p>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{block.section}</Badge>
                    {block.subsection && (
                      <Badge variant="outline" className="text-xs">{block.subsection}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
