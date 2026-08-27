import mammoth from 'mammoth';

export interface ParsedBlock {
  number: string;
  title: string;
  text: string;
  section: string;
  subsection: string;
}

export async function parseWordFile(fileBuffer: Buffer): Promise<ParsedBlock[]> {
  const result = await mammoth.extractRawText({ buffer: fileBuffer });
  const text = result.value;

  if (!text?.trim()) {
    throw new Error('Файл пуст или не содержит текста');
  }

  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const blocks: ParsedBlock[] = [];
  let currentSection = '';
  let currentSubsection = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^Раздел\s+\d+/i.test(line)) {
      currentSection = line;
      currentSubsection = '';
      continue;
    }

    if (/^\d+\.\d+\s+/.test(line)) {
      currentSubsection = line;
      continue;
    }

    const blockMatch = line.match(/^(\d+\.\d+\.\d+(?:\.\d+)*)\s*\.?\s*(.*)?$/);
    if (!blockMatch) continue;

    const number = blockMatch[1];
    let title = blockMatch[2]?.trim() ?? '';

    if (!title && i + 1 < lines.length) {
      title = lines[++i];
    }

    const textLines: string[] = [];
    let j = i + 1;

    while (j < lines.length) {
      const nextLine = lines[j];
      const startsNextBlock = /^\d+\.\d+\.\d+/.test(nextLine);
      const startsSection = /^Раздел\s+\d+/i.test(nextLine);
      const startsSubsection = /^\d+\.\d+\s+/.test(nextLine);

      if (startsNextBlock || startsSection || startsSubsection) break;

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

  if (blocks.length === 0) {
    throw new Error('В файле не найдено блоков СУП. Проверьте формат документа.');
  }

  return blocks;
}

export function validateParsedBlock(block: ParsedBlock): boolean {
  return Boolean(
    block.number &&
      block.title &&
      block.text &&
      /^\d+\.\d+\.\d+/.test(block.number) &&
      block.title.length >= 5 &&
      block.text.length >= 20
  );
}

export function filterValidBlocks(blocks: ParsedBlock[]): ParsedBlock[] {
  return blocks.filter(validateParsedBlock);
}
