-- Seed data for LMS
-- Note: This file should be run after the initial migration

-- Insert sample categories
INSERT INTO categories (id, name, description, slug) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Lập trình Web', 'Các khóa học về phát triển web hiện đại', 'lap-trinh-web'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Mobile Development', 'Phát triển ứng dụng di động', 'mobile-development'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Data Science', 'Khoa học dữ liệu và phân tích', 'data-science'),
    ('550e8400-e29b-41d4-a716-446655440004', 'DevOps', 'Quản lý hệ thống và triển khai', 'devops'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Design', 'Thiết kế giao diện và trải nghiệm người dùng', 'design');

-- Note: User profiles will be created automatically when users sign up
-- via the on_auth_user_created trigger. The following users can be created manually:
-- 
-- Admin user: admin@lms.com (will need to be manually promoted to admin role after signup)
-- Student users: student1@lms.com, student2@lms.com, etc.

-- Insert sample courses
INSERT INTO courses (id, title, description, objectives, thumbnail_url, slug, category_id, is_published) VALUES
    (
        '660e8400-e29b-41d4-a716-446655440001',
        'React.js Cơ Bản đến Nâng Cao',
        'Học React.js từ những kiến thức cơ bản nhất đến các kỹ thuật nâng cao. Khóa học bao gồm React Hooks, Context API, và các best practices.',
        'Sau khóa học này, bạn sẽ có thể: 1) Xây dựng ứng dụng React từ đầu, 2) Sử dụng thành thạo React Hooks, 3) Quản lý state với Context API, 4) Áp dụng các pattern phổ biến',
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop&crop=center',
        'react-js-co-ban-den-nang-cao',
        '550e8400-e29b-41d4-a716-446655440001',
        true
    ),
    (
        '660e8400-e29b-41d4-a716-446655440002',
        'Node.js Backend Development',
        'Khóa học phát triển backend với Node.js, Express.js và MongoDB. Học cách xây dựng RESTful API và authentication.',
        'Xây dựng được API server hoàn chỉnh với Node.js, Express, JWT authentication, và database integration',
        'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop&crop=center',
        'nodejs-backend-development',
        '550e8400-e29b-41d4-a716-446655440001',
        true
    ),
    (
        '660e8400-e29b-41d4-a716-446655440003',
        'Flutter Mobile App Development',
        'Phát triển ứng dụng di động đa nền tảng với Flutter. Từ cơ bản đến nâng cao với state management và API integration.',
        'Tạo được ứng dụng mobile hoàn chỉnh trên cả iOS và Android với Flutter framework',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop&crop=center',
        'flutter-mobile-app-development',
        '550e8400-e29b-41d4-a716-446655440002',
        true
    ),
    (
        '660e8400-e29b-41d4-a716-446655440004',
        'Python Data Analysis',
        'Phân tích dữ liệu với Python, Pandas, NumPy và visualization với Matplotlib, Seaborn.',
        'Thành thạo các công cụ phân tích dữ liệu Python và có thể thực hiện data analysis projects',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&crop=center',
        'python-data-analysis',
        '550e8400-e29b-41d4-a716-446655440003',
        true
    ),
    (
        '660e8400-e29b-41d4-a716-446655440005',
        'Docker & Kubernetes Fundamentals',
        'Học containerization với Docker và orchestration với Kubernetes cho việc deploy applications.',
        'Hiểu và áp dụng được Docker containers và Kubernetes để deploy scalable applications',
        'https://images.unsplash.com/photo-1605745341112-85968b19335a?w=800&h=450&fit=crop&crop=center',
        'docker-kubernetes-fundamentals',
        '550e8400-e29b-41d4-a716-446655440004',
        false
    );

-- Insert sample lessons for React course
INSERT INTO lessons (id, course_id, title, description, lesson_type, video_url, duration_seconds, order_index, is_published) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Giới thiệu về React', 'Tổng quan về React.js và ecosystem', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 1200, 1, true),
    ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'JSX và Components', 'Học cách viết JSX và tạo components', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 1800, 2, true),
    ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Props và State', 'Quản lý dữ liệu trong React components', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 2100, 3, true),
    ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Event Handling', 'Xử lý sự kiện trong React', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 1500, 4, true),
    ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'React Hooks - useState', 'Hook cơ bản để quản lý state', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 1900, 5, true),
    ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 'React Hooks - useEffect', 'Side effects và lifecycle với useEffect', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 2400, 6, true),
    ('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', 'Context API', 'Quản lý global state với Context', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 2200, 7, true),
    ('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440001', 'React Router', 'Navigation trong React applications', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 2000, 8, true);

-- Insert sample lessons for Node.js course
INSERT INTO lessons (id, course_id, title, description, lesson_type, video_url, duration_seconds, order_index, is_published) VALUES
    ('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'Node.js Fundamentals', 'Giới thiệu Node.js và npm', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 1400, 1, true),
    ('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', 'Express.js Setup', 'Thiết lập server với Express', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 1600, 2, true),
    ('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440002', 'RESTful API Design', 'Thiết kế API theo chuẩn REST', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 2100, 3, true),
    ('770e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440002', 'Database Integration', 'Kết nối và thao tác với MongoDB', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', 2500, 4, true),
    ('770e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440002', 'Authentication & JWT', 'Xác thực người dùng với JWT', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', 2800, 5, true);

-- Insert sample lessons for Flutter course
INSERT INTO lessons (id, course_id, title, description, lesson_type, video_url, duration_seconds, order_index, is_published) VALUES
    ('770e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440003', 'Flutter Introduction', 'Giới thiệu Flutter framework', 'video', 'https://sample-videos.com/zip/10/mp4/480/SampleVideo_1280x720_1mb.mp4', 1300, 1, true),
    ('770e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440003', 'Dart Programming Basics', 'Ngôn ngữ Dart cơ bản', 'video', 'https://sample-videos.com/zip/10/mp4/480/SampleVideo_1280x720_2mb.mp4', 2000, 2, true),
    ('770e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440003', 'Flutter Widgets', 'Các widget cơ bản trong Flutter', 'video', 'https://sample-videos.com/zip/10/mp4/480/SampleVideo_1280x720_5mb.mp4', 2400, 3, true),
    ('770e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440003', 'Layouts and Navigation', 'Bố cục và điều hướng', 'video', 'https://sample-videos.com/zip/10/mp4/480/SampleVideo_1280x720_10mb.mp4', 2200, 4, true);

-- Insert sample lessons for Python Data Analysis course
INSERT INTO lessons (id, course_id, title, description, lesson_type, video_url, duration_seconds, order_index, is_published) VALUES
    ('770e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440004', 'Python for Data Science', 'Python cơ bản cho data science', 'video', 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', 1500, 1, true),
    ('770e8400-e29b-41d4-a716-446655440032', '660e8400-e29b-41d4-a716-446655440004', 'NumPy Arrays', 'Thao tác với mảng NumPy', 'video', 'https://filesamples.com/samples/video/mp4/480/sample_960x400_ocean_with_audio.mp4', 1800, 2, true),
    ('770e8400-e29b-41d4-a716-446655440033', '660e8400-e29b-41d4-a716-446655440004', 'Pandas DataFrames', 'Xử lý dữ liệu với Pandas', 'video', 'https://filesamples.com/samples/video/mp4/720/sample_1280x720_surfing_with_audio.mp4', 2600, 3, true),
    ('770e8400-e29b-41d4-a716-446655440034', '660e8400-e29b-41d4-a716-446655440004', 'Data Visualization', 'Trực quan hóa dữ liệu', 'video', 'https://filesamples.com/samples/video/mp4/1080/sample_1920x1080.mp4', 2300, 4, true);

