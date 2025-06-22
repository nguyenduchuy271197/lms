'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { getStudentLearningPathSchema, type GetStudentLearningPathInput } from '@/lib/validations/admin-student-management'
import { AUTH_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'

interface CourseRecommendation {
  course_id: string
  course_title: string
  course_description: string | null
  category_name: string | null
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null
  estimated_duration: number
  prerequisite_courses: string[]
  recommendation_score: number
  recommendation_reason: string
  is_enrolled: boolean
  enrollment_status?: 'active' | 'completed' | 'dropped'
  current_progress?: number
}

interface LearningPathResult {
  student_id: string
  student_name: string | null
  current_level: 'beginner' | 'intermediate' | 'advanced'
  learning_preferences: {
    preferred_categories: string[]
    average_session_duration: number
    learning_pace: 'slow' | 'normal' | 'fast'
    completion_rate: number
  }
  current_courses: CourseRecommendation[]
  recommended_next_courses: CourseRecommendation[]
  suggested_path: {
    short_term: CourseRecommendation[]
    medium_term: CourseRecommendation[]
    long_term: CourseRecommendation[]
  }
  skills_gap_analysis: {
    missing_skills: string[]
    weak_areas: string[]
    strong_areas: string[]
  }
}

type Result = 
  | { success: true; data: LearningPathResult }
  | { success: false; error: string }

export async function getLearningPath(params: GetStudentLearningPathInput): Promise<Result> {
  try {
    // Validate input
    const validatedParams = getStudentLearningPathSchema.parse(params)
    const { student_id } = validatedParams
    const max_recommendations = 10 // Default value

    // Check admin permissions
    await requireAdmin()

    const supabase = await createClient()

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', student_id)
      .single()

    if (studentError || !student) {
      console.error('Error fetching student:', studentError)
      return { success: false, error: 'Không tìm thấy học viên' }
    }

    // Get enrollments with course details
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses!inner(
          id,
          title,
          description,
          categories(id, name)
        )
      `)
      .eq('student_id', student_id)

    // Get all lesson progress for analysis
    const { data: allProgress } = await supabase
      .from('lesson_progress')
      .select(`
        watched_seconds,
        completed_at,
        last_watched_at,
        lessons!inner(
          course_id,
          courses!inner(
            categories!inner(id, name)
          )
        )
      `)
      .eq('student_id', student_id)

    // Analyze learning preferences
    const learningPreferences = analyzeLearningPreferences(enrollments || [], allProgress || [])

    // Determine current level
    const currentLevel = determineCurrentLevel(enrollments || [], allProgress || [])

    // Get current courses (active enrollments)
    const currentCourses: CourseRecommendation[] = []
    if (enrollments) {
      for (const enrollment of enrollments.filter(e => e.status === 'active')) {
        const { data: progress } = await supabase
          .rpc('calculate_course_progress', {
            p_student_id: student_id,
            p_course_id: enrollment.course_id
          })

        currentCourses.push({
          course_id: enrollment.course_id,
          course_title: enrollment.courses.title,
          course_description: enrollment.courses.description,
          category_name: enrollment.courses.categories?.name || null,
          difficulty_level: null, // Not available in current schema
          estimated_duration: 3600, // Default 1 hour
          prerequisite_courses: [], // Would need to be stored in course metadata
          recommendation_score: 0,
          recommendation_reason: 'Khóa học đang theo học',
          is_enrolled: true,
          enrollment_status: enrollment.status,
          current_progress: Math.round((progress || 0) * 100) / 100
        })
      }
    }

    // Get all available courses for recommendations
    const { data: allCourses } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        categories(id, name),
        is_published
      `)
      .eq('is_published', true)

    // Filter out already enrolled courses
    const enrolledCourseIds = new Set(enrollments?.map(e => e.course_id) || [])
    const availableCourses = allCourses?.filter(course => !enrolledCourseIds.has(course.id)) || []

    // Generate recommendations
    const recommendations = await generateRecommendations(
      student_id,
      availableCourses,
      learningPreferences,
      currentLevel,
      enrollments || [],
      allProgress || [],
      max_recommendations
    )

    // Categorize recommendations into time periods
    const suggestedPath = categorizePath(recommendations)

    // Analyze skills gaps
    const skillsGapAnalysis = analyzeSkillsGap(enrollments || [], allProgress || [], allCourses || [])

    return {
      success: true,
      data: {
        student_id,
        student_name: student.full_name,
        current_level: currentLevel,
        learning_preferences: learningPreferences,
        current_courses: currentCourses,
        recommended_next_courses: recommendations,
        suggested_path: suggestedPath,
        skills_gap_analysis: skillsGapAnalysis
      }
    }

  } catch (error) {
    console.error('Error in getLearningPath:', error)
    
    if (error instanceof Error && error.message === AUTH_ERRORS.ADMIN_REQUIRED) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
}

function analyzeLearningPreferences(enrollments: Array<{
  status: 'active' | 'completed' | 'dropped';
  courses?: {
    categories?: {
      name: string;
    } | null;
  };
}>, progress: Array<{
  watched_seconds: number;
  completed_at: string | null;
  last_watched_at: string;
  lessons: {
    courses: {
      categories?: {
        name: string;
      } | null;
    };
  };
}>) {
  // Analyze preferred categories
  const categoryActivity: Record<string, number> = {}
  progress.forEach(p => {
    const categoryName = p.lessons.courses.categories?.name
    if (categoryName) {
      categoryActivity[categoryName] = (categoryActivity[categoryName] || 0) + (p.watched_seconds || 0)
    }
  })

  const preferredCategories = Object.entries(categoryActivity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category)

  // Calculate average session duration
  const sessionDurations = progress
    .filter(p => p.watched_seconds > 0)
    .map(p => p.watched_seconds)
  
  const averageSessionDuration = sessionDurations.length > 0
    ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length
    : 0

  // Determine learning pace
  const totalEnrollments = enrollments.length
  const completedCourses = enrollments.filter(e => e.status === 'completed').length
  const completionRate = totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0

  let learningPace: 'slow' | 'normal' | 'fast' = 'normal'
  if (completionRate > 70) {
    learningPace = 'fast'
  } else if (completionRate < 30) {
    learningPace = 'slow'
  }

  return {
    preferred_categories: preferredCategories,
    average_session_duration: Math.round(averageSessionDuration),
    learning_pace: learningPace,
    completion_rate: Math.round(completionRate * 100) / 100
  }
}

function determineCurrentLevel(enrollments: Array<{
  status: 'active' | 'completed' | 'dropped';
}>, progress: Array<{
  watched_seconds: number;
}>): 'beginner' | 'intermediate' | 'advanced' {
  const completedCourses = enrollments.filter(e => e.status === 'completed').length
  const totalWatchTime = progress.reduce((sum, p) => sum + (p.watched_seconds || 0), 0)
  const hoursWatched = totalWatchTime / 3600

  if (completedCourses >= 10 && hoursWatched >= 100) {
    return 'advanced'
  } else if (completedCourses >= 3 && hoursWatched >= 30) {
    return 'intermediate'
  } else {
    return 'beginner'
  }
}

async function generateRecommendations(
  studentId: string,
  availableCourses: Array<{
    id: string;
    title: string;
    description: string | null;
    categories: {
      id: string;
      name: string;
    } | null;
    is_published: boolean;
  }>,
  preferences: {
    preferred_categories: string[];
    average_session_duration: number;
    learning_pace: 'slow' | 'normal' | 'fast';
    completion_rate: number;
  },
  currentLevel: string,
  enrollments: Array<{
    status: 'active' | 'completed' | 'dropped';
  }>,
  progress: Array<{
    watched_seconds: number;
  }>,
  maxRecommendations: number
): Promise<CourseRecommendation[]> {
  
  const recommendations: CourseRecommendation[] = []

  for (const course of availableCourses) {
    let score = 0
    let reason = ''

    // Category preference bonus
    if (course.categories?.name && preferences.preferred_categories.includes(course.categories.name)) {
      score += 30
      reason += 'Phù hợp với sở thích học tập. '
    }

    // Level appropriateness (simplified since we don't have difficulty_level)
    score += 15 // Base score for level appropriateness

    // Popularity/engagement bonus (simplified)
    score += Math.random() * 20 // Simulated popularity score

    // Duration appropriateness (using default duration)
    const estimatedDuration = 3600 // Default 1 hour
    if (estimatedDuration <= preferences.average_session_duration * 2) {
      score += 10
      reason += 'Thời lượng phù hợp. '
    }

    if (score > 20) { // Minimum threshold
      recommendations.push({
        course_id: course.id,
        course_title: course.title,
        course_description: course.description,
        category_name: course.categories?.name || null,
        difficulty_level: null, // Not available in current schema
        estimated_duration: estimatedDuration,
        prerequisite_courses: [],
        recommendation_score: Math.round(score),
        recommendation_reason: reason.trim(),
        is_enrolled: false
      })
    }
  }

  // Sort by score and return top recommendations
  return recommendations
    .sort((a, b) => b.recommendation_score - a.recommendation_score)
    .slice(0, maxRecommendations)
}

function categorizePath(recommendations: CourseRecommendation[]) {
  const shortTerm = recommendations.slice(0, 2)
  const mediumTerm = recommendations.slice(2, 5)
  const longTerm = recommendations.slice(5, 8)

  return {
    short_term: shortTerm,
    medium_term: mediumTerm,
    long_term: longTerm
  }
}

function analyzeSkillsGap(enrollments: Array<{
  status: 'active' | 'completed' | 'dropped';
  courses?: {
    categories?: {
      name: string;
    } | null;
  };
}>, progress: Array<{
  watched_seconds: number;
}>, allCourses: Array<{
  id: string;
  title: string;
  description: string | null;
  categories: {
    id: string;
    name: string;
  } | null;
  is_published: boolean;
}>) {
  // Simplified skills analysis
  const studiedCategories = new Set(
    enrollments.map(e => e.courses?.categories?.name).filter(Boolean)
  )

  const allCategories = new Set(
    allCourses.map(c => c.categories?.name).filter((name): name is string => Boolean(name))
  )

  const missingSkills = Array.from(allCategories).filter(cat => !studiedCategories.has(cat))

  // Analyze performance in studied areas
  const categoryPerformance: Record<string, number> = {}
  enrollments.forEach(enrollment => {
    const categoryName = enrollment.courses?.categories?.name
    if (categoryName) {
      const isCompleted = enrollment.status === 'completed'
      categoryPerformance[categoryName] = (categoryPerformance[categoryName] || 0) + (isCompleted ? 1 : 0.5)
    }
  })

  const sortedPerformance = Object.entries(categoryPerformance).sort(([, a], [, b]) => b - a)
  const strongAreas = sortedPerformance.slice(0, 3).map(([category]) => category)
  const weakAreas = sortedPerformance.slice(-2).map(([category]) => category)

  return {
    missing_skills: missingSkills.slice(0, 5),
    weak_areas: weakAreas,
    strong_areas: strongAreas
  }
} 