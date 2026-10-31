import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/** Makes a safe file name from a project name, e.g. "Villa Maadi" -> "Villa-Maadi". */
export function fileSafe(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|\s]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return cleaned.slice(0, 60) || 'BUILD';
}

/** Turns HTML into a PDF and opens the phone's share menu (WhatsApp, email, Files). */
export async function sharePdf(html: string, fileName: string): Promise<void> {
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  const file = new File(Paths.cache, `${fileName}.pdf`);
  if (file.exists) file.delete();
  await new File(uri).move(file);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: fileName });
}

/** Saves CSV text as a file and opens the share menu. */
export async function shareCsv(csv: string, fileName: string): Promise<void> {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const file = new File(Paths.cache, `${fileName}.csv`);
  file.create({ overwrite: true });
  await file.write(csv);
  await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text', dialogTitle: fileName });
}
