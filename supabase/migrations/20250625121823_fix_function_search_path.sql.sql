-- Fix function search path security warnings
-- This migration addresses Supabase database linter warnings about mutable search_path

-- 1. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 2. Fix calculate_course_progress function
CREATE OR REPLACE FUNCTION calculate_course_progress(p_student_id UUID, p_course_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
BEGIN
    -- Get total published lessons in course
    SELECT COUNT(*) INTO total_lessons
    FROM public.lessons
    WHERE course_id = p_course_id AND is_published = true;
    
    -- Get completed lessons for student
    SELECT COUNT(*) INTO completed_lessons
    FROM public.lesson_progress lp
    JOIN public.lessons l ON lp.lesson_id = l.id
    WHERE lp.student_id = p_student_id 
        AND l.course_id = p_course_id 
        AND lp.completed_at IS NOT NULL
        AND l.is_published = true;
    
    -- Return progress percentage
    IF total_lessons = 0 THEN
        RETURN 0;
    ELSE
        RETURN ROUND((completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100, 2);
    END IF;
END;
$$;

-- 3. Fix check_enrollment_completion function
CREATE OR REPLACE FUNCTION check_enrollment_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    progress_percentage DECIMAL;
    enrollment_record RECORD;
BEGIN
    -- Get enrollment record
    SELECT * INTO enrollment_record
    FROM public.enrollments e
    JOIN public.lessons l ON NEW.lesson_id = l.id
    WHERE e.student_id = NEW.student_id 
        AND e.course_id = l.course_id
        AND e.status = 'active';
    
    IF enrollment_record.id IS NOT NULL AND NEW.completed_at IS NOT NULL THEN
        -- Calculate progress
        SELECT public.calculate_course_progress(NEW.student_id, enrollment_record.course_id) 
        INTO progress_percentage;
        
        -- If 100% complete, mark enrollment as completed
        IF progress_percentage >= 100 THEN
            UPDATE public.enrollments 
            SET status = 'completed', completed_at = NOW()
            WHERE id = enrollment_record.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'student'
    );
    RETURN NEW;
END;
$$;

-- 5. Fix check_user_role function
CREATE OR REPLACE FUNCTION check_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'student');
END;
$$;

-- 6. Fix current_user_is_admin function
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN public.check_user_role(auth.uid()) = 'admin';
END;
$$; 