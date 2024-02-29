const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isSignedIn, isAdmin, isRoot } = require('../middleware');
const admin = require('../controllers/admin');




router.get('/', isSignedIn, isAdmin, admin.renderReportPage);
router.get('/report-post', isSignedIn, isAdmin, catchAsync(admin.renderReportPostPage));
router.get('/report-comment', isSignedIn, isAdmin, catchAsync(admin.renderReportCommentPage));
router.delete('/delete-post', isSignedIn, isAdmin, catchAsync(admin.deletePost));
router.delete('/delete-comment', isSignedIn, isAdmin, catchAsync(admin.deleteComment));
router.get('/admin-list', isSignedIn, isRoot, catchAsync(admin.renderAdminListPage));
router.post('/admin-list/change-role', isSignedIn, isRoot, catchAsync(admin.changeToUserRole));
router.get('/search-user', isSignedIn, isRoot, catchAsync(admin.renderSearchUserPage));
router.post('/search-user/change-role', isSignedIn, isRoot, catchAsync(admin.changeToMasterRole));

module.exports = router;