'use server';

import mammoth from 'mammoth';

export async function parseDocumentToText(formData: FormData): Promise<{ text: string, error?: string }> {
  const file = formData.get('file') as File;
  if (!file) {
    return { text: '', error: 'No file provided' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return { text: data.text };
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      return { text: result.value };
    } else if (fileName.endsWith('.txt')) {
      const text = buffer.toString('utf-8');
      return { text };
    } else {
      return { text: '', error: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' };
    }
  } catch (error) {
    console.error('Document parsing error:', error);
    return { text: '', error: 'Failed to parse document' };
  }
}
