/**
 * Компонент выбора блоков СУП с чекбоксами и AI рекомендациями
 */

import { useState, useEffect } from 'react';
import { 
  getAIRecommendations, 
  getRecommendationIcon, 
  getRecommendationColor,
  type AIRecommendation,
  type Block,
  type Organization
} from '@/lib/yandexgpt';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface BlockSelectorProps {
  blocks: Block[];
  selectedBlockIds: number[];
  organization?: Organization;
  onSelectionChange: (selectedIds: number[]) => void;
  showAIRecommendations?: boolean;
}

export default function BlockSelector({
  blocks,
  selectedBlockIds,
  organization,
  onSelectionChange,
  showAIRecommendations = true
}: BlockSelectorProps) {
  const [recommendations, setRecommendations] = useState<Map<number, AIRecommendation>>(new Map());
  const [loading, setLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [filterSection, setFilterSection] = useState<string>('all');

  useEffect(() => {
    if (showAIRecommendations && organization && blocks.length > 0) {
      loadRecommendations();
    }
  }, [organization?.id, blocks.length]);

  const loadRecommendations = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      const recs = await getAIRecommendations(organization.id, blocks);
      const recMap = new Map<number, AIRecommendation>();
      recs.forEach(rec => recMap.set(rec.blockId, rec));
      setRecommendations(recMap);
    } catch (error) {
      console.error('Ошибка загрузки рекомендаций:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = (blockId: number) => {
    if (selectedBlockIds.includes(blockId)) {
      onSelectionChange(selectedBlockIds.filter(id => id !== blockId));
    } else {
      onSelectionChange([...selectedBlockIds, blockId]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const filteredBlocks = getFilteredBlocks();
      const allIds = filteredBlocks.map(b => b.id);
      onSelectionChange([...new Set([...selectedBlockIds, ...allIds])]);
    } else {
      onSelectionChange([]);
    }
  };

  const selectMandatory = () => {
    const mandatoryIds = blocks.filter(b => b.is_mandatory).map(b => b.id);
    onSelectionChange([...new Set([...selectedBlockIds, ...mandatoryIds])]);
  };

  const selectRecommended = () => {
    const recommendedIds = Array.from(recommendations.entries())
      .filter(([_, rec]) => rec.recommendation === 'mandatory' || rec.recommendation === 'recommended')
      .map(([blockId]) => blockId);
    onSelectionChange([...new Set([...selectedBlockIds, ...recommendedIds])]);
  };

  const deselectAll = () => {
    onSelectionChange([]);
    setSelectAll(false);
  };

  const sections = Array.from(new Set(blocks.map(b => b.section)));

  const getFilteredBlocks = () => {
    if (filterSection === 'all') return blocks;
    return blocks.filter(b => b.section === filterSection);
  };

  const filteredBlocks = getFilteredBlocks();

  const stats = {
    total: blocks.length,
    selected: selectedBlockIds.length,
    mandatory: blocks.filter(b => b.is_mandatory).length,
    mandatorySelected: blocks.filter(b => b.is_mandatory && selectedBlockIds.includes(b.id)).length
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Выбор блоков СУП</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Выбрано: {stats.selected} из {stats.total}</Badge>
            <Badge variant={stats.mandatorySelected === stats.mandatory ? "success" : "destructive"}>
              Обязательных: {stats.mandatorySelected} / {stats.mandatory}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSelectAll(!selectAll)}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {selectAll ? 'Снять всё' : 'Выбрать всё'}
          </Button>

          <Button variant="outline" size="sm" onClick={selectMandatory}>
            <AlertCircle className="w-4 h-4 mr-2" />
            Обязательные
          </Button>

          {showAIRecommendations && organization && (
            <Button variant="outline" size="sm" onClick={selectRecommended} disabled={loading}>
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? 'Загрузка AI...' : 'Рекомендованные AI'}
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={deselectAll}>Очистить</Button>
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
          const count = blocks.filter(b => b.section === section).length;
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
          const isSelected = selectedBlockIds.includes(block.id);
          const recommendation = recommendations.get(block.id);

          return (
            <div
              key={block.id}
              className={`border rounded-lg p-3 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'} ${block.is_mandatory ? 'border-l-4 border-l-red-500' : ''}`}
              onClick={() => toggleBlock(block.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox checked={isSelected} onCheckedChange={() => toggleBlock(block.id)} className="mt-1" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-gray-500">{block.number}</span>
                    {block.is_mandatory && <Badge variant="destructive" className="text-xs">Обязательный</Badge>}
                    {recommendation && showAIRecommendations && (
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: getRecommendationColor(recommendation.recommendation) + '20',
                          borderColor: getRecommendationColor(recommendation.recommendation)
                        }}
                        className="text-xs"
                      >
                        {getRecommendationIcon(recommendation.recommendation)} AI: {recommendation.recommendation}
                      </Badge>
                    )}
                  </div>

                  <h4 className="font-semibold text-sm mb-1">{block.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">{block.full_text}</p>

                  {recommendation && showAIRecommendations && (
                    <p className="text-xs text-gray-500 mt-2 italic">💡 {recommendation.reason}</p>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{block.section}</Badge>
                    {block.subsection && <Badge variant="outline" className="text-xs">{block.subsection}</Badge>}
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
