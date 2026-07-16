
CREATE TABLE public.wishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Heart',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.wishes TO anon, authenticated;
GRANT ALL ON public.wishes TO service_role;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read wishes" ON public.wishes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add a wish" ON public.wishes FOR INSERT TO anon, authenticated WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 80 AND length(trim(message)) BETWEEN 1 AND 500
);
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishes;

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read chat" ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can send chat" ON public.chat_messages FOR INSERT TO anon, authenticated WITH CHECK (
  length(trim(user_name)) BETWEEN 1 AND 60 AND length(trim(text)) BETWEEN 1 AND 500
);
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

CREATE TABLE public.rsvp_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  guests TEXT NOT NULL DEFAULT '1',
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('attending', 'declined')),
  can_attend TEXT NOT NULL DEFAULT '',
  cant_attend TEXT NOT NULL DEFAULT '',
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rsvp_submissions TO anon, authenticated;
GRANT ALL ON public.rsvp_submissions TO service_role;
ALTER TABLE public.rsvp_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read RSVP submissions" ON public.rsvp_submissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add RSVP submissions" ON public.rsvp_submissions FOR INSERT TO anon, authenticated WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 80 AND length(trim(message)) <= 500 AND status IN ('attending', 'declined')
);
CREATE POLICY "Anyone can update RSVP submissions" ON public.rsvp_submissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 80 AND length(trim(message)) <= 500 AND status IN ('attending', 'declined')
);
CREATE POLICY "Anyone can delete RSVP submissions" ON public.rsvp_submissions FOR DELETE TO anon, authenticated USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.rsvp_submissions;
