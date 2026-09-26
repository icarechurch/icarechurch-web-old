UPDATE public.church_info
SET email = 'icarecenter.media@gmail.com',
    pastor_email = CASE
      WHEN pastor_email = 'pastor@icarerefuge.org'
        THEN 'icarecenter.media@gmail.com'
      ELSE pastor_email
    END,
    updated_at = now()
WHERE email IS DISTINCT FROM 'icarecenter.media@gmail.com'
   OR pastor_email = 'pastor@icarerefuge.org';

UPDATE public.pastors
SET email = 'icarecenter.media@gmail.com', updated_at = now()
WHERE email = 'pastor@icarerefuge.org';
