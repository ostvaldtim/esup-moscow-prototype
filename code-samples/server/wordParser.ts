/**
 * Парсер Word документов СУП
 * Извлекает блоки из загруженного Word файла
 */

import mammoth from 'mammoth';
import { Block } from './blocks.js';

/**
 * Распарсенный блок (без ID и timestamps)
 */
export interface ParsedBlock {
  number: string;
  title: string;
  text: string;
  section: string;
  subsection: string;
}

/**
 * Парсит Word файл и извлекает блоки СУП
 * @param fileBuffer - буфер Word файла
 * @returns массив распарсенных блоков
 */
export async function parseWordFile(fileBuffer: Buffer): Promise<ParsedBlock[]> {
  try {
    // Извлекаем текст из Word документа
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const text = result.value;

    if (!text || text.trim().length === 0) {
      throw new Error('Файл пуст или не содержит текста');
    }

    // Разбиваем на строки
    const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

    const blocks: ParsedBlock[] = [];
    let currentSection = '';
    let currentSubsection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Определяем разделы (например: "Раздел 1. Организационные аспекты")
      if (line.match(/^Раздел\s+\d+/i)) {
        currentSection = line;
        continue;
      }

      // Определяем подразделы (например: "1.1 Общие положения")
      if (line.match(/^\d+\.\d+\s+/)) {
        currentSubsection = line;
        continue;
      }

      // Ищем номера блоков (паттерн: "1.1.1", "2.1.1.5", etc.)
      const blockNumberMatch = line.match(/^(\d+\.\d+\.\d+(?:\.\d+)*)\s*\.?\s*(.*)?$/);

      if (blockNumberMatch) {
        const number = blockNumberMatch[1];
        let title = blockNumberMatch[2] || '';

        // Если заголовок пустой, берём следующую строку
        if (!title && i + 1 < lines.length) {
          title = lines[i + 1];
          i++;
        }

        // Собираем текст блока до следующего номера
        const textLines: string[] = [];
        let j = i + 1;

        while (j < lines.length) {
          const nextLine = lines[j];

          if (
            nextLine.match(/^\d+\.\d+\.\d+/) ||
            nextLine.match(/^Раздел\s+\d+/i) ||
            nextLine.match(/^\d+\.\d+\s+/)
          ) {
            break;
          }

          textLines.push(nextLine);
          j++;
        }

        const blockText = textLines.join(' ').trim();

        if (title && blockText) {
          blocks.push({
            number,
            title,
            text: blockText,
            section: currentSection,
            subsection: currentSubsection,
          });
        }

        i = j - 1;
      }
    }

    if (blocks.length === 0) {
      throw new Error('В файле не найдено блоков СУП. Проверьте формат документа.');
    }

    console.log(`✅ Распарсено блоков: ${blocks.length}`);
    return blocks;
  } catch (error) {
    console.error('Ошибка парсинга Word файла:', error);
    throw error;
  }
}

export function validateParsedBlock(block: ParsedBlock): boolean {
  return !!(
    block.number &&
    block.title &&
    block.text &&
    block.number.match(/^\d+\.\d+\.\d+/) &&
    block.title.length >= 5 &&
    block.text.length >= 20
  );
}

export function filterValidBlocks(blocks: ParsedBlock[]): ParsedBlock[] {
  return blocks.filter(validateParsedBlock);
}
