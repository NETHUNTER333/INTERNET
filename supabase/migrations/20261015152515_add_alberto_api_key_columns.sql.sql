ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS alberto_api_key text,
  ADD COLUMN IF NOT EXISTS alberto_model text DEFAULT 'poolside/laguna-s-2.1:free';

UPDATE public.settings SET
  alberto_api_key = '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',
  alberto_model = 'poolside/laguna-s-2.1:free'
WHERE id = 1;