/**
 * Компонент для сравнения версий блоков СУП (diff viewer)
 */

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Plus, Minus, Equal } from 'lucide-react';

interface DiffViewerProps {
  oldText: string;
  newText: string;
  oldVersion?: number;
  newVersion?: number;
  blockNumber?: string;
  blockTitle?: string;
}

type DiffLine = {
  type: 'equal' | 'insert' | 'delete';
  value: string;
  lineNumber?: number;
};

export default function DiffViewer({
  oldText,
  newText,
  oldVersion = 1,
  newVersion = 2,
  blockNumber,
  blockTitle
}: DiffViewerProps) {
  const diff = useMemo(() => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const result: DiffLine[] = [];

    let i = 0;
    let j = 0;

    while (i < oldLines.length || j < newLines.length) {
      if (i >= oldLines.length) {
        result.push({ type: 'insert', value: newLines[j], lineNumber: j + 1 });
        j++;
      } else if (j >= newLines.length) {
        result.push({ type: 'delete', value: oldLines[i], lineNumber: i + 1 });
        i++;
      } else if (oldLines[i] === newLines[j]) {
        result.push({ type: 'equal', value: oldLines[i], lineNumber: i + 1 });
        i++;
        j++;
      } else {
        const foundInNew = newLines.slice(j + 1).indexOf(oldLines[i]);
        const foundInOld = oldLines.slice(i + 1).indexOf(newLines[j]);

        if (foundInNew !== -1 && (foundInOld === -1 || foundInNew < foundInOld)) {
          result.push({ type: 'insert', value: newLines[j], lineNumber: j + 1 });
          j++;
        } else {
          result.push({ type: 'delete', value: oldLines[i], lineNumber: i + 1 });
          i++;
        }
      }
    }

    return result;
  }, [oldText, newText]);

  const stats = useMemo(() => {
    const insertions = diff.filter(d => d.type === 'insert').length;
    const deletions = diff.filter(d => d.type === 'delete').length;
    const unchanged = diff.filter(d => d.type === 'equal').length;
    return { insertions, deletions, unchanged };
  }, [diff]);

  const getLineIcon = (type: DiffLine['type']) => {
    switch (type) {
      case 'insert': return <Plus className="w-4 h-4" />;
      case 'delete': return <Minus className="w-4 h-4" />;
      case 'equal': return null;
    }
  };

  const getLineBgColor = (type: DiffLine['type']) => {
    switch (type) {
      case 'insert': return 'bg-green-50 border-l-4 border-l-green-500';
      case 'delete': return 'bg-red-50 border-l-4 border-l-red-500';
      case 'equal': return 'bg-white';
    }
  };

  const getLineTextColor = (type: DiffLine['type']) => {
    switch (type) {
      case 'insert': return 'text-green-800';
      case 'delete': return 'text-red-800';
      case 'equal': return 'text-gray-700';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 border-b p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-5 h-5 text-blue-600" />
            <div>
              {blockNumber && blockTitle && (
                <h3 className="font-semibold text-base">{blockNumber} {blockTitle}</h3>
              )}
              <p className="text-sm text-gray-600">Сравнение версий: v{oldVersion} → v{newVersion}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {stats.insertions > 0 && <Badge variant="outline">+{stats.insertions} добавлено</Badge>}
            {stats.deletions > 0 && <Badge variant="outline">-{stats.deletions} удалено</Badge>}
            {stats.unchanged > 0 && <Badge variant="outline">{stats.unchanged} без изменений</Badge>}
          </div>
        </div>
      </div>

      <div className="bg-white">
        {diff.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Equal className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Изменений не обнаружено</p>
          </div>
        ) : (
          <div className="font-mono text-sm">
            {diff.map((line, index) => (
              <div key={index} className={`flex items-start gap-2 px-4 py-1 ${getLineBgColor(line.type)}`}>
                <span className="text-gray-400 select-none w-12 text-right flex-shrink-0">{line.lineNumber}</span>
                <span className={`flex-shrink-0 mt-1 ${getLineTextColor(line.type)}`}>{getLineIcon(line.type)}</span>
                <span className={`flex-1 whitespace-pre-wrap ${getLineTextColor(line.type)}`}>{line.value || '\u00A0'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
