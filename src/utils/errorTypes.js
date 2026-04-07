export const ERROR_TYPES = [
  { value: 'wrong_word', label: 'Wrong Word', labelAr: 'كلمة خاطئة', color: 'bg-red-900/40 text-red-300' },
  { value: 'tashkeel', label: 'Tashkeel (Vowels)', labelAr: 'تشكيل خاطئ', color: 'bg-orange-900/40 text-orange-300' },
  { value: 'tajweed', label: 'Tajweed Rule', labelAr: 'حكم تجويد', color: 'bg-purple-900/40 text-purple-300' },
  { value: 'added_word', label: 'Added Word', labelAr: 'زيادة كلمة', color: 'bg-yellow-900/40 text-yellow-300' },
  { value: 'skipped_word', label: 'Skipped Word', labelAr: 'حذف كلمة', color: 'bg-pink-900/40 text-pink-300' },
  { value: 'nasya', label: 'Forgot (Nasya)', labelAr: 'نسيان', color: 'bg-gray-700/60 text-gray-300' },
  { value: 'wrong_transition', label: 'Wrong Transition', labelAr: 'انتقال خاطئ', color: 'bg-blue-900/40 text-blue-300' },
  { value: 'mutashabih', label: 'Mutashabih', labelAr: 'متشابه', color: 'bg-teal-900/40 text-teal-300' },
  { value: 'other', label: 'Other', labelAr: 'أخرى', color: 'bg-slate-700/60 text-slate-300' },
];

export const getErrorTypeMeta = (value) =>
  ERROR_TYPES.find((type) => type.value === value) || ERROR_TYPES[ERROR_TYPES.length - 1];
