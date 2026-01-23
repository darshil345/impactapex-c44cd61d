-- Rename academic_excellence columns back to global_awareness
ALTER TABLE public.schools RENAME COLUMN academic_excellence_score TO global_awareness_score;
ALTER TABLE public.schools RENAME COLUMN academic_excellence_problem TO global_awareness_problem;
ALTER TABLE public.schools RENAME COLUMN academic_excellence_solution TO global_awareness_solution;