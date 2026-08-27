/**
 * Генератор Word документов учётных политик
 * Создаёт готовый документ из блоков СУП
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from 'docx';
import { PolicyWithDetails } from './policies.js';

export async function generatePolicyDocument(
  policy: PolicyWithDetails,
  organization: {
    name: string;
    inn: string;
    kpp: string;
    industry: string;
    account_type: string;
  }
): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'УЧЁТНАЯ ПОЛИТИКА',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: `для целей ${organization.account_type} учёта`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),
          new Paragraph({
            text: organization.name,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            bold: true,
          }),
          new Paragraph({
            text: `ИНН: ${organization.inn}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: `КПП: ${organization.kpp}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: `Отрасль: ${organization.industry}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: `Дата создания: ${new Date(policy.created_at).toLocaleDateString('ru-RU')}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Статус: ${policy.status}`, bold: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          ...(policy.status === 'утверждена' && policy.approved_at
            ? [
                new Paragraph({
                  text: `Утверждена: ${new Date(policy.approved_at).toLocaleDateString('ru-RU')}`,
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 800 },
                }),
              ]
            : []),
          new Paragraph({
            text: 'СОДЕРЖАНИЕ',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 300 },
            pageBreakBefore: true,
          }),
          ...policy.blocks.map(
            (block) =>
              new Paragraph({
                text: `${block.number}. ${block.title}`,
                spacing: { after: 100 },
              })
          ),
          new Paragraph({ text: '', pageBreakBefore: true }),
          ...policy.blocks.flatMap((block) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${block.number}. `, bold: true }),
                new TextRun({ text: block.title, bold: true }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            ...(block.section
              ? [
                  new Paragraph({
                    text: `(${block.section})`,
                    italics: true,
                    spacing: { after: 100 },
                  }),
                ]
              : []),
            ...(block.subsection
              ? [
                  new Paragraph({
                    text: `(${block.subsection})`,
                    italics: true,
                    spacing: { after: 200 },
                  }),
                ]
              : []),
            new Paragraph({
              text: block.text,
              spacing: { after: 400 },
              alignment: AlignmentType.JUSTIFIED,
            }),
          ]),
          new Paragraph({ text: '', spacing: { before: 800 } }),
          new Paragraph({ text: 'УТВЕРЖДАЮ', spacing: { after: 200 } }),
          new Paragraph({ text: 'Руководитель: _______________________', spacing: { after: 200 } }),
          new Paragraph({ text: 'Главный бухгалтер: _______________________', spacing: { after: 200 } }),
          new Paragraph({
            text: `Дата: «___» ____________ ${new Date().getFullYear()} г.`,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Документ создан автоматически системой SPACE-Конструктор',
                size: 16,
                color: '999999',
                italics: true,
              }),
            ],
            spacing: { before: 400, after: 100 },
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export function generateFileName(organizationName: string, policyId: number): string {
  const safeName = organizationName
    .replace(/[^а-яА-ЯёЁa-zA-Z0-9\s]/g, '')
    .trim()
    .substring(0, 50);

  const date = new Date().toISOString().split('T')[0];
  return `UP_${safeName}_${policyId}_${date}.docx`;
}
