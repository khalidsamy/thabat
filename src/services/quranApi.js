import axios from 'axios';

const quranApi = axios.create({
  baseURL: 'https://api.alquran.cloud/v1',
  timeout: 10000,
});

const extractPayload = (response) => {
  if (response.data?.code !== 200) {
    throw new Error('Quran data is temporarily unavailable.');
  }

  return response.data.data;
};

export const isAbortedRequest = (error) =>
  axios.isCancel(error) ||
  error?.name === 'CanceledError' ||
  error?.name === 'AbortError' ||
  error?.code === 'ERR_CANCELED';

export const fetchSurahList = async (options = {}) => {
  const response = await quranApi.get('/surah', options);
  return extractPayload(response);
};

export const fetchSurahMetadata = async (surahNumber, options = {}) => {
  const response = await quranApi.get(`/surah/${surahNumber}`, options);
  return extractPayload(response);
};

export const fetchAyah = async (surahNumber, ayahNumber, edition = 'quran-uthmani', options = {}) => {
  const response = await quranApi.get(`/ayah/${surahNumber}:${ayahNumber}/${edition}`, options);
  return extractPayload(response);
};

export const fetchAyahText = async (surahNumber, ayahNumber, options = {}) => {
  const data = await fetchAyah(surahNumber, ayahNumber, undefined, options);

  return {
    text: data.text,
    surahName: data.surah.name,
    surahEnglishName: data.surah.englishName,
  };
};
