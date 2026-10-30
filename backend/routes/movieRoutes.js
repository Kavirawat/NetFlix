const express = require('express');
const router = express.Router();
const {
  getBanner,
  getAllBanners,
  getMovieFromOmdb,
  getTrending,
  getActionShows,
  getWatchDetails,
  searchYouTubeVideos,
} = require('../controllers/movieController');

router.get('/banner', getBanner);
router.get('/banner/all', getAllBanners);
router.get('/omdb/:id', getMovieFromOmdb);
router.get('/trending', getTrending);
router.get('/action', getActionShows);
router.get('/watch/:id', getWatchDetails);
router.get('/youtube-search', searchYouTubeVideos);

module.exports = router;
