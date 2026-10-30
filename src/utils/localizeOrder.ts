import { TFunction } from 'i18next';
import { OrderItem } from '../types/order';

export function getLocalizedItemName(item: OrderItem, t: TFunction): string {
  const translated = t(`orders:mockData.items.${item.id}`);
  return translated && !translated.startsWith('orders:mockData.items.') ? translated : item.name;
}

export function getLocalizedStudentName(name: string, t: TFunction): string {
  const translated = t(`orders:mockData.students.${name}`);
  return translated && !translated.startsWith('orders:mockData.students.') ? translated : name;
}

export function getLocalizedStudentNote(note: string | undefined, t: TFunction): string {
  if (!note) return '';
  const translated = t(`orders:mockData.notes.${note}`);
  return translated && !translated.startsWith('orders:mockData.notes.') ? translated : note;
}

