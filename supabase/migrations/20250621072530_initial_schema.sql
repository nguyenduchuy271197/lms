-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'dropped');
CREATE TYPE lesson_type AS ENUM ('video');

-- Create tables

-- Users table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    objectives TEXT,
    thumbnail_url TEXT,
    slug TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    lesson_type lesson_type NOT NULL DEFAULT 'video',
    video_url TEXT,
    duration_seconds INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_id, order_index)
);

-- Enrollments table
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status enrollment_status NOT NULL DEFAULT 'active',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(student_id, course_id)
);

-- Lesson progress table
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    watched_seconds INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, lesson_id)
);

-- Create indexes for performance optimization
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_published ON courses(is_published);

CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, order_index);
CREATE INDEX idx_lessons_published ON lessons(is_published);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

CREATE INDEX idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_completed ON lesson_progress(completed_at);

-- Create updated_at trigger function
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

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate course progress
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

-- Function to auto-complete enrollment when all lessons are done
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

CREATE TRIGGER trigger_check_enrollment_completion
    AFTER INSERT OR UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE FUNCTION check_enrollment_completion();

-- Function to automatically create profile when user signs up
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

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Helper functions to avoid recursive policies

-- Function to check user role directly (bypassing RLS)
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

-- Function to check if current user is admin (bypassing RLS)
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

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (current_user_is_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (current_user_is_admin());

CREATE POLICY "Enable insert for authenticated users during signup" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON categories
    FOR ALL USING (current_user_is_admin());

-- Courses policies
CREATE POLICY "Anyone can view published courses" ON courses
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can view all courses" ON courses
    FOR SELECT USING (current_user_is_admin());

CREATE POLICY "Only admins can manage courses" ON courses
    FOR ALL USING (current_user_is_admin());

-- Lessons policies
CREATE POLICY "Anyone can view published lessons" ON lessons
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can view all lessons" ON lessons
    FOR SELECT USING (current_user_is_admin());

CREATE POLICY "Only admins can manage lessons" ON lessons
    FOR ALL USING (current_user_is_admin());

-- Enrollments policies
CREATE POLICY "Students can view their own enrollments" ON enrollments
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create their own enrollments" ON enrollments
    FOR INSERT WITH CHECK (
        student_id = auth.uid() AND
        check_user_role(auth.uid()) = 'student'
    );

CREATE POLICY "Students can update their own enrollment status" ON enrollments
    FOR UPDATE USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can view all enrollments" ON enrollments
    FOR SELECT USING (current_user_is_admin());

CREATE POLICY "Admins can manage all enrollments" ON enrollments
    FOR ALL USING (current_user_is_admin());

-- Lesson progress policies
CREATE POLICY "Students can view their own progress" ON lesson_progress
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update their own progress" ON lesson_progress
    FOR ALL USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can view all progress" ON lesson_progress
    FOR SELECT USING (current_user_is_admin());

-- Create storage bucket for course materials
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-videos', 'course-videos', false);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-thumbnails', 'course-thumbnails', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-avatars', 'user-avatars', true);

-- Storage policies for course videos (private)
CREATE POLICY "Enrolled students can view course videos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'course-videos' AND (
            -- Check if user is enrolled in the course that owns this video
            EXISTS (
                SELECT 1 FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                JOIN lessons l ON c.id = l.course_id
                WHERE e.student_id = auth.uid()
                    AND e.status IN ('active', 'completed')
                    AND storage.filename(name) LIKE '%' || l.id::text || '%'
            )
        )
    );

CREATE POLICY "Admins can manage course videos" ON storage.objects
    FOR ALL USING (
        bucket_id = 'course-videos' AND current_user_is_admin()
    );

-- Storage policies for course thumbnails (public)
CREATE POLICY "Anyone can view course thumbnails" ON storage.objects
    FOR SELECT USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Admins can manage course thumbnails" ON storage.objects
    FOR ALL USING (
        bucket_id = 'course-thumbnails' AND current_user_is_admin()
    );

-- Storage policies for user avatars (public read, own write)
CREATE POLICY "Anyone can view user avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create views for commonly used queries

-- Course with progress view for students
CREATE VIEW student_course_progress AS
SELECT 
    c.id as course_id,
    c.title,
    c.description,
    c.thumbnail_url,
    cat.name as category_name,
    e.student_id,
    e.status as enrollment_status,
    e.enrolled_at,
    e.completed_at,
    calculate_course_progress(e.student_id, c.id) as progress_percentage,
    COUNT(l.id) as total_lessons,
    COUNT(lp.completed_at) as completed_lessons
FROM courses c
LEFT JOIN categories cat ON c.category_id = cat.id
JOIN enrollments e ON c.id = e.course_id
JOIN lessons l ON c.id = l.course_id AND l.is_published = true
LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = e.student_id AND lp.completed_at IS NOT NULL
WHERE c.is_published = true
GROUP BY c.id, c.title, c.description, c.thumbnail_url, cat.name, e.student_id, e.status, e.enrolled_at, e.completed_at;

-- Course statistics view for admins
CREATE VIEW course_statistics AS
SELECT 
    c.id as course_id,
    c.title,
    c.slug,
    COUNT(DISTINCT e.student_id) as total_students,
    COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.student_id END) as active_students,
    COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.student_id END) as completed_students,
    COUNT(DISTINCT l.id) as total_lessons,
    AVG(calculate_course_progress(e.student_id, c.id)) as average_progress
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN lessons l ON c.id = l.course_id AND l.is_published = true
GROUP BY c.id, c.title, c.slug;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
