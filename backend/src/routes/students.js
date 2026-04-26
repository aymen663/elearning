import express from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('enrolledCourses', 'title thumbnail category level')
            .lean();

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

router.put('/me', protect, async (req, res) => {
    try {
        const { name, avatar, bio } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { ...(name && { name }), ...(avatar && { avatar }), ...(bio !== undefined && { bio }) },
            { new: true }
        ).select('-password');

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});


router.get('/me/stats', protect, async (req, res) => {
    try {
        // Single aggregation: join course lesson count without loading lesson content
        const progressList = await Progress.aggregate([
            { $match: { student: req.user._id } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseData',
                    pipeline: [{ $project: { title: 1, lessonCount: { $size: '$lessons' } } }],
                },
            },
            { $unwind: { path: '$courseData', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    totalLessons: { $ifNull: ['$courseData.lessonCount', 0] },
                    completionPercentage: {
                        $cond: [
                            { $gt: [{ $ifNull: ['$courseData.lessonCount', 0] }, 0] },
                            {
                                $round: [
                                    { $multiply: [{ $divide: [{ $size: '$completedLessons' }, '$courseData.lessonCount'] }, 100] },
                                    0,
                                ],
                            },
                            0,
                        ],
                    },
                },
            },
        ]);

        const allScores = progressList.flatMap((p) => (p.quizScores || []).map((q) => q.score));
        const bestScore = allScores.length ? Math.max(...allScores) : 0;
        const avgScore = allScores.length
            ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
            : 0;

        const stats = {
            totalCourses: progressList.length,
            completedCourses: progressList.filter((p) => p.completionPercentage === 100).length,
            inProgressCourses: progressList.filter(
                (p) => p.completionPercentage > 0 && p.completionPercentage < 100
            ).length,
            averageCompletion:
                progressList.length > 0
                    ? Math.round(progressList.reduce((s, p) => s + p.completionPercentage, 0) / progressList.length)
                    : 0,
            totalLessonsCompleted: progressList.reduce((s, p) => s + p.completedLessons.length, 0),
            totalQuizAttempts: progressList.reduce((s, p) => s + (p.quizScores?.length || 0), 0),
            bestScore,
            avgScore,
        };

        res.json({ stats, recentActivity: progressList.slice(0, 5) });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});


export default router;
