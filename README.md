# Netflix Clone (Next.js + Express API + OMDb API Integration)

Ek modern full-stack Netflix Clone jisme:
- **Frontend**: **Next.js 14 (App Router)** aur React me built.
- **OMDb API Integration**: Aapki provided API (`http://www.omdbapi.com/?apikey=d590655a`) se real movie data (High-Res Posters, IMDb Ratings, Full Story Plots, Directors, Actors, etc.) dynamically fetch hota hai.
- **Real Video Player**: Har movie aur banner ke sath working video streaming (`NetflixVideoPlayer.js`) jisme Play/Pause, 10s Skip, Scrubber, Volume, aur Fullscreen controls hain.
- **Action Shows & Movies Section**: Blockbuster action titles (*Guardians of the Galaxy Vol. 2*, *Extraction 2*, *John Wick 4*, *Red Notice*, *The Gray Man*, *Fighter*) jisme click karke seedhe video watch kar sakte hain.
- **Trending Top 10**: Left/Right smooth navigation controls ke sath **Top 10 rank numbers (1, 2, 3.. 10) properly Netflix style me overlay** kiye gaye hain.
- **Authentication**: Sign In, Sign Up, Password Hashing (`bcryptjs`), JWT Session, dynamic Navbar (Avatar + Sign Out), aur Hero/FAQ email auto-fill.

---

## 🍿 OMDb API Integration (`d590655a`)

1. **Configured in `backend/.env`**:
   ```env
   OMDB_API_KEY=d590655a
   OMDB_API_URL=http://www.omdbapi.com/
   ```
2. **Backend Service (`backend/services/omdbService.js`)**:
   - `getMovieByImdbId(imdbId)`: IMDb ID (jaise user ki di hui `tt3896198` - Guardians of the Galaxy Vol. 2) se real details lata hai.
   - High-Resolution Poster conversion (`_V1_SX1200.jpg`) se crystal-clear 1200px posters display hote hain.
   - Automatic caching taaki baar-baar API request na bhejni pade aur page instantaneous load ho.
3. **Dedicated OMDb Endpoints**:
   - `GET /api/movies/banner`: OMDb se real banner poster, plot, rating lata hai.
   - `GET /api/movies/banner/all`: Saare featured titles (Guardians of the Galaxy, Stranger Things, Animal, Squid Game, Extraction 2, Wednesday) ko OMDb se enrich karta hai.
   - `GET /api/movies/omdb/:id`: Kisi bhi IMDb ID (e.g. `/api/movies/omdb/tt3896198`) ka real data video link ke sath return karta hai.
   - `GET /api/movies/action`: OMDb real posters ke sath action movies deta hai.

---

## 📁 Project Structure

```text
NetFlix/
├── backend/                      # Node.js + Express REST API
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Me, Logout
│   │   └── movieController.js    # Banner, Trending, Action & OMDb API
│   ├── services/
│   │   └── omdbService.js        # OMDb API client with high-res poster & caching
│   ├── data/
│   │   ├── movies.json           # Movie database with video streaming links
│   │   └── users.json            # Local user store
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   └── movieRoutes.js        # /api/movies routes (/banner, /trending, /action, /omdb/:id)
│   ├── .env                      # OMDB_API_KEY=d590655a, JWT_SECRET, PORT
│   ├── package.json
│   └── server.js                 # API server on port 5000
│
├── frontend/                     # Next.js 14 Frontend
│   ├── app/
│   │   ├── components/
│   │   │   ├── Navbar.js             # Navigation header & User Profile / Sign In
│   │   │   ├── Hero.js               # OMDb Hero Banner with Floating Real Poster Card
│   │   │   ├── TrendingSlider.js     # Top 10 with Left/Right icons & Click-to-Play
│   │   │   ├── ActionShows.js        # Action Movies with OMDb real posters
│   │   │   ├── NetflixVideoPlayer.js # Fullscreen Netflix Video Player UI
│   │   │   ├── FeatureBoxes.js       # "More Reasons to Join" feature grid
│   │   │   ├── Faq.js                # Interactive FAQ accordion + Bottom email form
│   │   │   ├── Footer.js             # Netflix footer links
│   │   │   ├── AuthModal.js          # Sign In & Sign Up dark modal
│   │   │   └── Toast.js              # Feedback notifications
│   │   ├── globals.css               # Authentic Netflix theme styling
│   │   ├── layout.js                 # Root layout with Montserrat & FontAwesome
│   │   └── page.js                   # Main landing page
│   ├── public/                       # Static images
│   ├── package.json
│   └── next.config.mjs
│
├── .gitignore
└── README.md
```

---

## 🚀 How to Run (Local Par Kaise Chalayein)

### Step 1: Backend API Start Karein
Terminal 1 me:
```bash
cd backend
npm start
```
*Backend `http://localhost:5000` par start hoga aur OMDb API se data connect karega.*

### Step 2: Next.js Frontend Start Karein
Terminal 2 me:
```bash
cd frontend
npm run dev
```
*Frontend **`http://localhost:3000`** par start hoga.*

Browser me **`http://localhost:3000`** open karein:
- **Guardians of the Galaxy: Vol. 2 (`tt3896198`)** ka real high-res poster, IMDb rating (⭐ 7.6), real plot OMDb se live aayega.
- **Watch Now** ya kisi bhi movie card par click karte hi real video stream chalegi!
