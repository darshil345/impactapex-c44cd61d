-- Rename global_awareness columns to academic_excellence
ALTER TABLE public.schools RENAME COLUMN global_awareness_score TO academic_excellence_score;
ALTER TABLE public.schools RENAME COLUMN global_awareness_problem TO academic_excellence_problem;
ALTER TABLE public.schools RENAME COLUMN global_awareness_solution TO academic_excellence_solution;