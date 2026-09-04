import { expect, test, describe } from 'bun:test';
import { markdownToVisualBlocks, visualBlocksToMarkdown } from '../src/utils/visualBlocks';

describe('Visual Blocks Form Builder Engine', () => {
  test('parses headings, texts, dividers, and fields into visual blocks', () => {
    const markdown = `# Patient Intake Form

Please fill in your accurate medical details.

---

### Personal Details
- **Patient Name:** {{input:name label="Patient Name" required=true}}
- **Birth Date:** {{date:dob label="Birth Date" required=true}}

> Legal Note: Information is strictly confidential.

{{signature:sig label="Signature" required=true}}
`;

    const blocks = markdownToVisualBlocks(markdown);

    expect(blocks.length).toBe(8);
    expect(blocks[0].type).toBe('heading');
    expect(blocks[0].headingText).toBe('Patient Intake Form');
    expect(blocks[1].type).toBe('text');
    expect(blocks[2].type).toBe('divider');
    expect(blocks[3].type).toBe('heading');
    expect(blocks[4].type).toBe('field');
    expect(blocks[4].field?.id).toBe('name');
    expect(blocks[5].type).toBe('field');
    expect(blocks[5].field?.id).toBe('dob');
    expect(blocks[6].type).toBe('text');
    expect(blocks[6].isQuote).toBe(true);
    expect(blocks[7].type).toBe('field');
    expect(blocks[7].field?.id).toBe('sig');
  });

  test('converts visual blocks back to valid markdown template with field tokens', () => {
    const blocks = [
      { id: '1', type: 'heading' as const, level: 1 as const, headingText: 'Job Survey' },
      { id: '2', type: 'text' as const, content: 'Welcome to the survey.' },
      {
        id: '3',
        type: 'field' as const,
        field: {
          id: 'rating',
          type: 'rating' as const,
          label: 'Satisfaction Score',
          max: 5,
        },
      },
    ];

    const md = visualBlocksToMarkdown(blocks);
    expect(md).toContain('# Job Survey');
    expect(md).toContain('Welcome to the survey.');
    expect(md).toContain('{{rating:rating');
    expect(md).toContain('label="Satisfaction Score"');
  });
});
