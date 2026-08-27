/**
 * Компонент проверки полноты учётной политики
 * С блокировкой действий при неполноте
 */

import { useState, useEffect } from 'react';
import { checkPolicyCompleteness, type CompletenessCheck } from '@/lib/yandexgpt';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface CompletenessCheckerProps {
  policyId: number;
  onCompletenessChange?: (isComplete: boolean) => void;
  blockActions?: boolean;
}

export default function CompletenessChecker({
  policyId,
  onCompletenessChange,
  blockActions = true
}: CompletenessCheckerProps) {
  const [check, setCheck] = useState<CompletenessCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompleteness();
  }, [policyId]);

  useEffect(() => {
    if (check && onCompletenessChange) {
      onCompletenessChange(check.isComplete);
    }
  }, [check?.isComplete]);

  const loadCompleteness = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await checkPolicyCompleteness(policyId);
      setCheck(result);
    } catch (err) {
      setError('Ошибка проверки полноты политики');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-gray-500" />
          <span className="text-sm text-gray-600">Проверка полноты учётной политики...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!check) return null;

  const getVariant = () => {
    if (check.isComplete) return 'success';
    if (check.missingMandatory.length > 0) return 'destructive';
    return 'warning';
  };

  const getIcon = () => {
    if (check.isComplete) return <CheckCircle className="h-5 w-5" />;
    if (check.missingMandatory.length > 0) return <XCircle className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  const getTitle = () => {
    if (check.isComplete) return 'Учётная политика полная';
    if (check.missingMandatory.length > 0) return 'Отсутствуют обязательные блоки';
    return 'Учётная политика неполная';
  };

  const getDescription = () => {
    const parts = [];

    if (check.missingMandatory.length > 0) {
      parts.push(`Отсутствует ${check.missingMandatory.length} обязательных блоков`);
    }

    if (check.missingRecommended.length > 0) {
      parts.push(`Отсутствует ${check.missingRecommended.length} рекомендуемых блоков`);
    }

    if (parts.length === 0) {
      return 'Все обязательные и рекомендуемые блоки включены в политику.';
    }

    return parts.join('. ') + '.';
  };

  return (
    <div className="space-y-4">
      <Alert variant={getVariant()}>
        {getIcon()}
        <AlertTitle className="text-base font-semibold">{getTitle()}</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="space-y-3">
            <p>{getDescription()}</p>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Полнота учётной политики</span>
                <span className="font-semibold">{check.completenessScore}%</span>
              </div>
              <Progress value={check.completenessScore} className="h-2" />
            </div>

            {check.missingMandatory.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <h4 className="font-semibold text-sm text-red-800 mb-2">
                  ⚠️ Обязательные блоки для добавления:
                </h4>
                <ul className="text-xs text-red-700 space-y-1">
                  {check.missingMandatory.slice(0, 5).map(blockId => (
                    <li key={blockId}>• Блок #{blockId}</li>
                  ))}
                  {check.missingMandatory.length > 5 && (
                    <li className="italic">... и ещё {check.missingMandatory.length - 5}</li>
                  )}
                </ul>
              </div>
            )}

            {check.missingRecommended.length > 0 && check.missingMandatory.length === 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-semibold text-sm text-yellow-800 mb-2">
                  💡 Рекомендуемые блоки для добавления:
                </h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {check.missingRecommended.slice(0, 3).map(blockId => (
                    <li key={blockId}>• Блок #{blockId}</li>
                  ))}
                  {check.missingRecommended.length > 3 && (
                    <li className="italic">... и ещё {check.missingRecommended.length - 3}</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={loadCompleteness}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Обновить проверку
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {blockActions && !check.isComplete && check.missingMandatory.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Действие заблокировано</AlertTitle>
          <AlertDescription>
            Невозможно утвердить или подписать политику без всех обязательных блоков.
            Добавьте недостающие блоки, чтобы продолжить.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
