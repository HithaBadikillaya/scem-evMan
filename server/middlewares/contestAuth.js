const Contest = require('../models/Contest');
const User = require('../models/User');

// Custom middleware to check if user is authenticated and authorized to take a contest
const isContestActive = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.user?.id || req.auth?.userId; // Get user ID from decoded token
        const contestId = req.body.contestId || req.params.contestId; // Get contest ID from request

        if (!contestId) {
            return res.status(400).json({
                success: false,
                message: 'Contest ID is required'
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Find the contest
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found in system'
            });
        }

        // Check if contest is within time bounds
        const currentTime = new Date();
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);

        if (currentTime < startTime) {
            return res.status(403).json({
                success: false,
                message: 'Contest has not started yet',
                startTime: contest.startTime
            });
        }

        if (currentTime > endTime) {
            return res.status(403).json({
                success: false,
                message: 'Contest has ended',
                endTime: contest.endTime
            });
        }

        // Check if contest is active (allow 'ongoing' or 'waiting' status for testing)
        if (contest.status !== 'ongoing' && contest.status !== 'waiting') {
            return res.status(403).json({
                success: false,
                message: 'Contest is not currently active',
                contestStatus: contest.status
            });
        }

        // Check if contest is public or if user is registered
        if (contest.visibility === 'private') {
            const isRegistered = user.registeredContests && user.registeredContests.includes(contestId);
            if (!isRegistered) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not registered for this private contest'
                });
            }
        }

        // Check if user has any violations that might restrict access
        if (contest.violations && contest.violations.length > 0) {
            const userViolations = contest.violations.filter(
                violation => violation.user.toString() === user._id.toString()
            );

            // If user has more than 3 violations, deny access
            if (userViolations.length >= 3) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied due to multiple violations'
                });
            }
        }

        // Add contest and user info to request object for use in next middleware/route
        req.contest = contest;
        req.user = user;

        next();

    } catch (error) {
        console.error('Error in isContestActive middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during contest authorization',
            error: error.message
        });
    }
};

module.exports = { isContestActive };
