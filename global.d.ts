export {};

declare global {
  interface Window {
    responsiveVoice: {
      speak: (
        text: string,
        voice?: string,
        parameters?: {
          pitch?: number;
          rate?: number;
          volume?: number;
          onend?: () => void;
        }
      ) => void;
      getVoices: () => Array<{ name: string; gender: string }>;
    };
  }
}
