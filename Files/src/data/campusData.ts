import { CampusBuilding, NavigationRoute, NavigationStep, Waypoint } from "../types";

export type { CampusBuilding };
// Establish all buildings present on the reference picture.
// =============================================================================
// 🏛️ USLS CAMPUS BUILDINGS & LANDMARKS
// =============================================================================
export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  // --- USER LIVE LOCATION ---
  {
    id: "user-current-location",
    name: "Your Live Location (User Pointer)",
    shortName: "Your Location",
    category: "amenity",
    x: 33,
    y: 14,
    width: 4,
    height: 4,
    description: "Live GPS pinpoint and user orientation pointer on campus.",
    floors: 1,
    departments: ["Live GPS Location"],
    amenities: ["GPS Tracked", "Orientation Compass"],
    popularFor: "Starting navigation directly from where you are standing right now.",
    operatingHours: "Always Active",
    color: "#2563EB",
  },

  // --- GATES ---
  {
    id: "gate-1",
    name: "Gate 1 (La Salle Avenue Entrance)",
    shortName: "Gate 1",
    category: "gates",
    x: 20,
    y: 14,
    width: 5.5,
    height: 3,
    description: "North-West pedestrian & vehicle gate near Bookshop, ELC, and Parking 2.",
    floors: 1,
    departments: ["Campus Security", "Visitor Checkpoint"],
    amenities: ["Pedestrian Lane", "Drop-off Bay"],
    popularFor: "Entrance for public transit and bookshop access.",
    operatingHours: "05:30 AM - 09:30 PM",
    color: "#F97316",
  },
  {
    id: "gate-2",
    name: "Gate 2 (Main Administration Gate)",
    shortName: "Gate 2",
    category: "gates",
    x: 33,
    y: 14,
    width: 6,
    height: 3,
    description: "Main campus gate leading to Gathering Point C, Yanson Hall, Chapel, and Admin.",
    floors: 1,
    departments: ["Main Guardhouse", "Visitor Registration"],
    amenities: ["Covered Walkway Entry", "Wheelchair Access Ramp"],
    popularFor: "Primary entrance for events, summits, and central campus access.",
    operatingHours: "06:00 AM - 09:00 PM",
    color: "#F97316",
  },
  {
    id: "gate-3",
    name: "Gate 3 (Integrated School Gate)",
    shortName: "Gate 3",
    category: "gates",
    x: 67,
    y: 17,
    width: 5,
    height: 3,
    description: "North-East gate near Steel Parking, Grade School, and Gallaga Theater.",
    floors: 1,
    departments: ["IS Security Desk"],
    amenities: ["Drop-off Area"],
    popularFor: "Grade School & Theater drop-off.",
    operatingHours: "06:00 AM - 07:00 PM",
    color: "#F97316",
  },
  {
    id: "gate-4",
    name: "Gate 4 (Gallaga Theater Gate)",
    shortName: "Gate 4",
    category: "gates",
    x: 75,
    y: 20,
    width: 5,
    height: 3,
    description: "Gate adjacent to Gallaga Theater, IS Admin, and Prep School.",
    floors: 1,
    departments: ["Theater Security"],
    amenities: ["Pedestrian Access"],
    popularFor: "Direct access to Gallaga Theater events.",
    operatingHours: "06:00 AM - 09:00 PM",
    color: "#F97316",
  },
  {
    id: "gate-5",
    name: "Gate 5 (New IS Building Gate)",
    shortName: "Gate 5",
    category: "gates",
    x: 83,
    y: 24,
    width: 5,
    height: 3,
    description: "Gate opening to the New Integrated School Building complex.",
    floors: 1,
    departments: ["IS Security"],
    amenities: ["Student Turnstiles"],
    popularFor: "Integrated School students and faculty access.",
    operatingHours: "06:00 AM - 06:30 PM",
    color: "#F97316",
  },
  {
    id: "gate-6",
    name: "Gate 6 (Professional School & Sports Gate)",
    shortName: "Gate 6",
    category: "gates",
    x: 92,
    y: 28,
    width: 5,
    height: 3,
    description: "East gate accessing Professional School Building and High School Basketball Covered Court.",
    floors: 1,
    departments: ["Security Post"],
    amenities: ["Gate Turnstiles", "Vehicle Lane"],
    popularFor: "Graduate/Law students & High School Covered Court access.",
    operatingHours: "06:00 AM - 09:30 PM",
    color: "#F97316",
  },
  {
    id: "gate-7",
    name: "Gate 7 (Balay Kalinungan Gate)",
    shortName: "Gate 7",
    category: "gates",
    x: 67,
    y: 70,
    width: 5,
    height: 3,
    description: "South-East gate accessing Balay Kalinungan, Dormitories, and Bus Garage.",
    floors: 1,
    departments: ["BK Security"],
    amenities: ["Parking & Bus Bay"],
    popularFor: "Retreatants, hotel guests, and dorm residents.",
    operatingHours: "05:30 AM - 10:00 PM",
    color: "#F97316",
  },
  {
    id: "gate-8",
    name: "Gate 8 (Santuario de La Salle Gate)",
    shortName: "Gate 8",
    category: "gates",
    x: 57,
    y: 84,
    width: 5,
    height: 3,
    description: "Direct south gate for Santuario de La Salle and Maison Parmenie.",
    floors: 1,
    departments: ["Santuario Security"],
    amenities: ["Processional Gate", "Wheelchair Access"],
    popularFor: "Direct entrance to Santuario de La Salle for masses & major summits.",
    operatingHours: "05:30 AM - 09:00 PM",
    color: "#F97316",
  },
  {
    id: "gate-9",
    name: "Gate 9 (Carpentry & Technical Gate)",
    shortName: "Gate 9",
    category: "gates",
    x: 19,
    y: 70,
    width: 5,
    height: 3,
    description: "South-West service gate near MRF Power House, TES, and Carpentry.",
    floors: 1,
    departments: ["Facilities Security"],
    amenities: ["Service Vehicle Ingress"],
    popularFor: "Campus physical plant and technical services.",
    operatingHours: "06:00 AM - 07:00 PM",
    color: "#F97316",
  },

  // --- DESTINATION / HIGHLIGHT ---
  {
    id: "santuario-de-la-salle",
    name: "Santuario de La Salle (Your Destination)",
    shortName: "Santuario de La Salle",
    category: "religious",
    x: 46.5,
    y: 80,
    width: 8.5,
    height: 5.5,
    description: "The grand university sanctuary, chapel, and event center for summits and liturgical celebrations.",
    floors: 2,
    departments: ["University Ministry", "Santuario Administration", "Altar & Choir Gallery"],
    amenities: ["Air-conditioned Sanctuary", "Main Plaza", "Ramp Access", "Restrooms"],
    popularFor: "Negros Mental Health Summit, Sunday Masses, Baccalaureate ceremonies.",
    operatingHours: "06:00 AM - 08:00 PM",
    color: "#EF4444",
  },

  // --- TOP-LEFT SECTOR ---
  {
    id: "universal-bookshop",
    name: "Universal Bookshop",
    shortName: "Universal Bookshop",
    category: "amenity",
    x: 19,
    y: 20,
    width: 5,
    height: 4,
    description: "Campus bookstore providing textbooks, school supplies, USLS merchandise, and Lasallian uniforms.",
    floors: 1,
    departments: ["Bookstore Sales", "Uniform Fitting Desk"],
    amenities: ["Air-conditioned Shop", "Cashier Counter"],
    popularFor: "Books, notebooks, pens, school merchandise.",
    operatingHours: "08:00 AM - 05:00 PM",
    color: "#059669",
  },
  {
    id: "elc-llc",
    name: "ELC / LLC Building",
    shortName: "ELC / LLC",
    category: "academic",
    x: 19,
    y: 26,
    width: 5,
    height: 4.5,
    description: "English Language Center and Language Learning Complex for speech labs and international student programs.",
    floors: 2,
    departments: ["Language Laboratories", "Speech Center", "ESL Program"],
    amenities: ["Audio-Visual Rooms", "Multimedia Lab"],
    popularFor: "Language training and speech diagnostic classes.",
    operatingHours: "07:30 AM - 05:30 PM",
    color: "#0D9488",
  },
  {
    id: "parking-space-2",
    name: "Parking Space - 2",
    shortName: "Parking Space-2",
    category: "amenity",
    x: 25.5,
    y: 22,
    width: 5.5,
    height: 4,
    description: "North-West paved parking lot with green trees.",
    floors: 1,
    departments: ["Parking Attendants"],
    amenities: ["Vehicle Slots", "Bicycle Racks"],
    popularFor: "Faculty & visitor parking near Gate 1.",
    operatingHours: "24 Hours",
    color: "#475569",
  },
  {
    id: "university-chapel",
    name: "University Chapel",
    shortName: "University Chapel",
    category: "religious",
    x: 32,
    y: 24.5,
    width: 5,
    height: 5.5,
    description: "Peaceful sacred chapel for quiet prayer, daily masses, and spiritual recollections.",
    floors: 1,
    departments: ["Campus Ministry", "Liturgical Sacristy"],
    amenities: ["Altar", "Confessional", "Quiet Prayer Pews"],
    popularFor: "Mid-day mass, personal prayer, and choir practice.",
    operatingHours: "06:00 AM - 07:00 PM",
    color: "#8B5CF6",
  },
  {
    id: "yanson-hall",
    name: "Yanson Hall (Integrated School)",
    shortName: "Yanson Hall",
    category: "academic",
    x: 33,
    y: 18.5,
    width: 6.5,
    height: 3.5,
    description: "Integrated school academic building with modern classrooms and activity centers.",
    floors: 3,
    departments: ["IS Faculty Offices", "Classrooms", "Guidance Office"],
    amenities: ["Student Lockers", "Smart Classrooms"],
    popularFor: "Junior high school classes and student council.",
    operatingHours: "07:00 AM - 05:30 PM",
    color: "#0D9488",
  },
  {
    id: "admin-bldg-is",
    name: "Admin Bldg (Integrated School)",
    shortName: "IS Admin Bldg",
    category: "admin",
    x: 41.5,
    y: 18.5,
    width: 6.5,
    height: 3.5,
    description: "Administrative headquarters for Integrated School principals, records, and admissions.",
    floors: 2,
    departments: ["IS Principal's Office", "IS Admissions", "IS Records"],
    amenities: ["Conference Rooms", "Waiting Lounge"],
    popularFor: "Integrated school enrollment and parent conferences.",
    operatingHours: "08:00 AM - 05:00 PM",
    color: "#047857",
  },
  {
    id: "business-office-bldg",
    name: "Business Office Bldg / Clinic / Procurement",
    shortName: "Business Office / Clinic",
    category: "admin",
    x: 47.5,
    y: 24,
    width: 4.5,
    height: 6,
    description: "Central administrative building housing University Health Clinic, Business Office, and Procurement.",
    floors: 2,
    departments: ["University Medical Clinic", "Procurement Office", "Business Operations"],
    amenities: ["First Aid & Triage", "Doctor's Clinic", "Pharmacy Dispensary"],
    popularFor: "Medical consultations, sick bay, student insurance, procurement.",
    operatingHours: "07:30 AM - 05:30 PM",
    color: "#047857",
  },

  // --- TOP-RIGHT SECTOR ---
  {
    id: "steel-parking",
    name: "Steel Parking",
    shortName: "Steel Parking",
    category: "amenity",
    x: 50,
    y: 14.5,
    width: 8,
    height: 3.5,
    description: "Multi-level steel parking structure near Gate 2 & Gate 3.",
    floors: 2,
    departments: ["Parking Management"],
    amenities: ["Covered Parking", "Security Surveillance"],
    popularFor: "Multi-tier vehicle parking.",
    operatingHours: "06:00 AM - 09:00 PM",
    color: "#475569",
  },
  {
    id: "grade-1-bldg",
    name: "Grade - 1 Building",
    shortName: "Grade - 1 Bldg",
    category: "academic",
    x: 53,
    y: 19,
    width: 6.5,
    height: 3.2,
    description: "Classrooms and activity rooms dedicated to Grade 1 students.",
    floors: 2,
    departments: ["Grade 1 Faculty", "Primary Classrooms"],
    amenities: ["Play Area", "Primary Restrooms"],
    popularFor: "Grade 1 elementary instruction.",
    operatingHours: "07:00 AM - 04:30 PM",
    color: "#0D9488",
  },
  {
    id: "grade-school-bldg",
    name: "Grade School Building & IS Garden",
    shortName: "Grade School Bldg",
    category: "academic",
    x: 54,
    y: 23.5,
    width: 7.5,
    height: 3.8,
    description: "Primary elementary complex with adjacent Integrated School botanical garden.",
    floors: 3,
    departments: ["Elementary Faculty", "Science Discovery Rooms"],
    amenities: ["Integrated School Garden", "Courtyard"],
    popularFor: "Elementary education & school gardening.",
    operatingHours: "07:00 AM - 05:00 PM",
    color: "#0D9488",
  },
  {
    id: "is-admin-gs-comp",
    name: "IS Admin & GS Computer Center",
    shortName: "GS Computer Center",
    category: "academic",
    x: 62.5,
    y: 23.5,
    width: 5.5,
    height: 4.5,
    description: "Elementary computing center and IS administration offices.",
    floors: 2,
    departments: ["GS Computer Labs", "IS IT Helpdesk"],
    amenities: ["Computer Stations", "High-speed Internet"],
    popularFor: "Elementary IT & programming classes.",
    operatingHours: "07:30 AM - 05:00 PM",
    color: "#0D9488",
  },
  {
    id: "gallaga-theater",
    name: "Gallaga Theater",
    shortName: "Gallaga Theater",
    category: "amenity",
    x: 69.5,
    y: 23.5,
    width: 5.5,
    height: 4.5,
    description: "Prestigious university performing arts theater named after visionary filmmaker Peque Gallaga.",
    floors: 2,
    departments: ["Performing Arts Center", "Theater Production Desk", "Thespian Society"],
    amenities: ["Proscenium Stage", "Acoustic Seating", "Lighting & Sound Control Booth"],
    popularFor: "Stage plays, theatrical productions, film showings, recitals.",
    operatingHours: "08:00 AM - 09:00 PM",
    color: "#D97706",
  },
  {
    id: "prep-school-bldg",
    name: "Prep School Building & Power House",
    shortName: "Prep School Bldg",
    category: "academic",
    x: 76,
    y: 24.5,
    width: 4.5,
    height: 4,
    description: "Early childhood preparatory classrooms and facility sub-station.",
    floors: 1,
    departments: ["Kindergarten Classrooms", "Substation Support"],
    amenities: ["Playground", "Activity Center"],
    popularFor: "Kindergarten and preparatory pupils.",
    operatingHours: "07:30 AM - 03:30 PM",
    color: "#0D9488",
  },
  {
    id: "new-is-bldg",
    name: "New Integrated School Building",
    shortName: "New IS Building",
    category: "academic",
    x: 64,
    y: 29.5,
    width: 22,
    height: 3.8,
    description: "Expansive modern facility accommodating senior and junior high school classrooms and science laboratories.",
    floors: 4,
    departments: ["Senior High STEM/ABM/HUMSS", "IS Laboratories", "Student Lounges"],
    amenities: ["Elevator", "Rooftop Deck", "Modern Lecture Rooms"],
    popularFor: "High school academic classes and research projects.",
    operatingHours: "07:00 AM - 06:00 PM",
    color: "#0D9488",
  },

  // --- MIDDLE-LEFT SECTOR (Coliseum & Academic Spine) ---
  {
    id: "coliseum",
    name: "USLS Coliseum",
    shortName: "Coliseum",
    category: "sports",
    x: 20.5,
    y: 39,
    width: 7.5,
    height: 14,
    description: "Multi-purpose 8,000-seat university arena for sports tournaments, varsity games, concerts, and commencement.",
    floors: 3,
    departments: ["Athletics Department", "Varsity Training Center", "Physical Education Faculty"],
    amenities: ["Hardwood Basketball Court", "Locker Rooms", "VIP Lounge", "Concession Stands"],
    popularFor: "UAAP / NOPSSCEA games, university assemblies, concerts, graduations.",
    operatingHours: "06:00 AM - 10:00 PM",
    color: "#1E3A8A",
    shape: "oval",
  },
  {
    id: "room-10-bldg",
    name: "Room 10 Building",
    shortName: "Room 10",
    category: "academic",
    x: 29.5,
    y: 34,
    width: 4,
    height: 4.5,
    description: "Historic classroom hall providing lecture spaces for general academic subjects.",
    floors: 2,
    departments: ["General Education Classrooms"],
    amenities: ["Ceiling Fans", "Smart Board"],
    popularFor: "College lectures and student group meetings.",
    operatingHours: "07:30 AM - 06:00 PM",
    color: "#0D9488",
  },
  {
    id: "small-library",
    name: "Library Wing",
    shortName: "Library",
    category: "academic",
    x: 34.5,
    y: 34,
    width: 4,
    height: 4.5,
    description: "Study rooms and specialized reference library.",
    floors: 2,
    departments: ["Periodicals", "Silent Study Area"],
    amenities: ["Reading Desks", "Reference Stacks"],
    popularFor: "Quiet reading and reference research.",
    operatingHours: "08:00 AM - 06:00 PM",
    color: "#059669",
  },
  {
    id: "st-miguel",
    name: "St. Miguel (GSM/Law, Col of Med, Office Bldg)",
    shortName: "St. Miguel",
    category: "academic",
    x: 40.5,
    y: 34,
    width: 6.5,
    height: 4.5,
    description: "Graduate School of Management, College of Law, College of Medicine, and University Administration Offices.",
    floors: 4,
    departments: ["College of Law", "Graduate School (GSM)", "College of Medicine", "Registrar & Accounting"],
    amenities: ["Moot Court", "Medical Simulation Labs", "Executive Boardroom"],
    popularFor: "Law classes, medical studies, MBA lectures, registrar inquiries.",
    operatingHours: "07:30 AM - 08:30 PM",
    color: "#047857",
  },
  {
    id: "solomon-building",
    name: "Solomon Building (College of Business & Accountancy)",
    shortName: "Solomon Building",
    category: "academic",
    x: 35,
    y: 40,
    width: 14,
    height: 4,
    description: "Flagship building of the Dr. Lucio C. Tan College of Business and Accountancy (CBA).",
    floors: 3,
    departments: ["Accountancy Department", "Business Administration", "Marketing & Finance", "CBA Faculty Room"],
    amenities: ["Case Study Rooms", "Business Simulation Lab", "Air-conditioned Classrooms"],
    popularFor: "Accountancy board prep, marketing presentations, and business seminars.",
    operatingHours: "07:00 AM - 08:00 PM",
    color: "#0D9488",
  },
  {
    id: "st-benilde",
    name: "St. Benilde Hall",
    shortName: "St. Benilde",
    category: "academic",
    x: 48,
    y: 33.5,
    width: 5.5,
    height: 4,
    description: "Academic building providing classrooms for humanities and liberal arts.",
    floors: 2,
    departments: ["Liberal Arts Classrooms", "Faculty Lounge"],
    amenities: ["Lecture Halls", "Restrooms"],
    popularFor: "Philosophy, history, and social sciences lectures.",
    operatingHours: "07:30 AM - 06:30 PM",
    color: "#0D9488",
  },
  {
    id: "st-mutien-marie-annex",
    name: "St. Mutien Marie Annex",
    shortName: "MM Annex",
    category: "academic",
    x: 48,
    y: 39,
    width: 4.5,
    height: 5,
    description: "Education laboratories and pedagogy training center.",
    floors: 3,
    departments: ["Teacher Education", "Child Development Lab"],
    amenities: ["Observation Rooms", "Instructional Materials Center"],
    popularFor: "Education practicum and teaching demonstrations.",
    operatingHours: "07:30 AM - 06:30 PM",
    color: "#0D9488",
  },
  {
    id: "mutien-marie-hall",
    name: "MM Hall (Mutien Marie Hall)",
    shortName: "MM Hall",
    category: "academic",
    x: 46.5,
    y: 45,
    width: 6.5,
    height: 4,
    description: "College of Education & College of Arts & Sciences headquarters.",
    floors: 3,
    departments: ["College of Education", "College of Arts & Sciences", "Psychology Laboratories"],
    amenities: ["Testing Center", "Psychological Assessment Lab"],
    popularFor: "Psychology research, education classes, teacher board reviews.",
    operatingHours: "07:00 AM - 07:00 PM",
    color: "#0D9488",
  },

  // --- MIDDLE & SPORTS SECTOR ---
  {
    id: "tennis-court",
    name: "Tennis Court",
    shortName: "Tennis Court",
    category: "sports",
    x: 55,
    y: 33.5,
    width: 5.5,
    height: 4,
    description: "Regulation outdoor tennis court with tournament fencing.",
    floors: 1,
    departments: ["Varsity Tennis Team"],
    amenities: ["Hardcourt Surface", "Bleachers"],
    popularFor: "Tennis training, tournaments, PE classes.",
    operatingHours: "06:00 AM - 07:00 PM",
    color: "#15803D",
  },
  {
    id: "covered-court",
    name: "Covered Court & Open Court",
    shortName: "Covered Court",
    category: "sports",
    x: 55,
    y: 39.5,
    width: 6,
    height: 5.5,
    description: "Multi-purpose covered sports court for volleyball, badminton, and student assemblies.",
    floors: 1,
    departments: ["Physical Education"],
    amenities: ["Covered Roof", "Volleyball & Badminton Courts"],
    popularFor: "Intramurals, PE sports classes, student council fairs.",
    operatingHours: "06:00 AM - 09:00 PM",
    color: "#15803D",
  },
  {
    id: "swimming-pool-grandstand",
    name: "Grandstand & Swimming Pool Complex",
    shortName: "Swimming Pool",
    category: "sports",
    x: 64,
    y: 34,
    width: 9,
    height: 5.5,
    description: "Olympic-sized swimming pool complex with spectator grandstand overlooking the pool and football oval.",
    floors: 2,
    departments: ["Aquatics Department", "Varsity Swim Team"],
    amenities: ["50m Olympic Pool", "Spectator Grandstand", "Shower & Locker Rooms"],
    popularFor: "Swimming meets, water polo, life-saving courses.",
    operatingHours: "06:00 AM - 08:00 PM",
    color: "#0284C7",
  },
  {
    id: "track-oval",
    name: "Track & Field Oval (Gathering Point A)",
    shortName: "Track & Field Oval",
    category: "sports",
    x: 69,
    y: 44,
    width: 18,
    height: 14,
    description: "Full 400m synthetic running track oval and central green football pitch housing designated Gathering Point A.",
    floors: 1,
    departments: ["Athletics Track & Field", "Soccer Program"],
    amenities: ["400m All-Weather Track", "Grass Football Pitch", "Gathering Point A Marker"],
    popularFor: "Jogging, track competitions, soccer matches, summit rally area.",
    operatingHours: "05:00 AM - 09:00 PM",
    color: "#991B1B",
    shape: "oval",
  },
  {
    id: "prof-school-bldg",
    name: "Professional School Building",
    shortName: "Professional School",
    category: "academic",
    x: 83,
    y: 32,
    width: 7.5,
    height: 4,
    description: "Post-graduate research building near Gate 6.",
    floors: 3,
    departments: ["Doctoral Studies", "Executive Education"],
    amenities: ["Seminar Rooms", "Research Cubicles"],
    popularFor: "Graduate thesis defense and executive masterclasses.",
    operatingHours: "08:00 AM - 09:00 PM",
    color: "#047857",
  },
  {
    id: "hs-covered-court",
    name: "High School Basketball Covered Court",
    shortName: "HS Covered Court",
    category: "sports",
    x: 84,
    y: 37,
    width: 6,
    height: 4.5,
    description: "Covered basketball facility for Integrated and High School athletics.",
    floors: 1,
    departments: ["High School Athletics"],
    amenities: ["Full Basketball Court", "Bleachers"],
    popularFor: "High school intramurals and basketball games.",
    operatingHours: "06:30 AM - 07:00 PM",
    color: "#15803D",
  },

  // --- LOWER-MIDDLE SECTOR (Cody, Library, Wester, Engineering) ---
  {
    id: "br-cody-hall",
    name: "Br. Francis Cody FSC Hall",
    shortName: "Br. Cody Hall",
    category: "academic",
    x: 34.5,
    y: 46.5,
    width: 14,
    height: 4,
    description: "College of Nursing & Allied Health Sciences with state-of-the-art virtual hospital simulation wards.",
    floors: 3,
    departments: ["College of Nursing", "Allied Health Sciences", "Medical Simulation Center"],
    amenities: ["Hospital Simulation Wards", "Anatomy & Physiology Lab", "Skills Labs"],
    popularFor: "Nursing skills training, OSCE examinations, health sciences lectures.",
    operatingHours: "07:00 AM - 08:00 PM",
    color: "#0D9488",
  },
  {
    id: "college-library",
    name: "College Library (Main LRC)",
    shortName: "College Library",
    category: "academic",
    x: 44,
    y: 52.5,
    width: 4.5,
    height: 6.5,
    description: "Main University College Library housing digital commons, thesis archives, and research databases.",
    floors: 3,
    departments: ["Main Book Stacks", "Digital Commons", "University Archives", "Periodicals"],
    amenities: ["High-speed Wi-Fi", "Group Study Rooms", "Print & Scan Center", "Quiet Carrels"],
    popularFor: "Comprehensive research, digital thesis access, study sessions.",
    operatingHours: "07:30 AM - 07:00 PM",
    color: "#059669",
  },
  {
    id: "br-hugh-wester-hall",
    name: "Br. Hugh Wester FSC Hall",
    shortName: "Br. Hugh Wester Hall",
    category: "academic",
    x: 34.5,
    y: 53.5,
    width: 13,
    height: 4,
    description: "Engineering and technology lecture rooms and testing workshops.",
    floors: 3,
    departments: ["Engineering Faculty", "Design Studios", "Civil/Mechanical Classrooms"],
    amenities: ["Drafting Tables", "CAD Workstations"],
    popularFor: "Engineering lectures and capstone presentations.",
    operatingHours: "07:00 AM - 08:00 PM",
    color: "#0D9488",
  },
  {
    id: "computer-center",
    name: "Computer Center",
    shortName: "Computer Center",
    category: "academic",
    x: 34.5,
    y: 59,
    width: 6,
    height: 3.8,
    description: "University IT datacenter, coding labs, AI / Data Science workstations.",
    floors: 2,
    departments: ["Computer Science", "Information Technology", "AI Research Lab"],
    amenities: ["High-Performance GPU Labs", "Network Simulator Room"],
    popularFor: "Programming classes, cybersecurity lab exercises, software capstones.",
    operatingHours: "07:30 AM - 08:00 PM",
    color: "#0D9488",
  },
  {
    id: "science-eng-bldg",
    name: "Science & Eng'g Building",
    shortName: "Science & Eng'g Bldg",
    category: "academic",
    x: 44,
    y: 60,
    width: 4.5,
    height: 6.5,
    description: "Advanced engineering laboratories, chemistry research, and physics testing facilities.",
    floors: 3,
    departments: ["Chemical Engineering", "Electronics Engineering", "Materials Science"],
    amenities: ["Heavy Engineering Labs", "Robotics Workshop"],
    popularFor: "Science experiments and hardware prototyping.",
    operatingHours: "07:30 AM - 07:30 PM",
    color: "#0D9488",
  },
  {
    id: "chem-ece-lab",
    name: "Chem / ECE Lab",
    shortName: "Chem / ECE Lab",
    category: "academic",
    x: 34.5,
    y: 64,
    width: 7,
    height: 3.8,
    description: "Chemistry wet labs, circuits testing benches, and electronics fabrication equipment.",
    floors: 2,
    departments: ["Chemistry Department", "ECE Laboratories"],
    amenities: ["Fume Hoods", "Oscilloscopes & Solder Stations"],
    popularFor: "Chemistry titration and electronics circuit testing.",
    operatingHours: "07:30 AM - 06:30 PM",
    color: "#0D9488",
  },

  // --- LOWER-LEFT SECTOR (Technical & Services) ---
  {
    id: "parking-area-3",
    name: "Parking Area - 3",
    shortName: "Parking Area-3",
    category: "amenity",
    x: 21,
    y: 49,
    width: 5.5,
    height: 3.5,
    description: "South-West campus parking lot near Coliseum and ICA.",
    floors: 1,
    departments: ["Parking Security"],
    amenities: ["Parking Slots"],
    popularFor: "Vehicle parking for athletics and technical facilities.",
    operatingHours: "24 Hours",
    color: "#475569",
  },
  {
    id: "ica-bldg",
    name: "ICA (Institute of Culinary Arts)",
    shortName: "ICA",
    category: "academic",
    x: 24,
    y: 54,
    width: 4,
    height: 4,
    description: "Culinary arts kitchens, baking laboratories, and commercial training restaurant.",
    floors: 2,
    departments: ["Culinary Arts", "Hospitality Management"],
    amenities: ["Commercial Kitchens", "Demo Kitchen", "Dining Room"],
    popularFor: "Culinary competitions, pastry baking, hospitality events.",
    operatingHours: "07:30 AM - 06:00 PM",
    color: "#0D9488",
  },
  {
    id: "carpentry-area",
    name: "Carpentry Work Area",
    shortName: "Carpentry Area",
    category: "amenity",
    x: 18,
    y: 54,
    width: 4,
    height: 4,
    description: "University physical plant woodshop and furniture maintenance facility.",
    floors: 1,
    departments: ["Physical Plant Office", "Carpentry Services"],
    amenities: ["Woodworking Machinery"],
    popularFor: "Campus repair and event staging fabrication.",
    operatingHours: "07:30 AM - 05:00 PM",
    color: "#475569",
  },
  {
    id: "dison-hall",
    name: "Dison Hall",
    shortName: "Dison Hall",
    category: "academic",
    x: 12.5,
    y: 51,
    width: 4,
    height: 5.5,
    description: "Vocational and technical education classrooms and staff offices.",
    floors: 2,
    departments: ["Technical Vocations", "Maintenance Staff"],
    amenities: ["Workshops"],
    popularFor: "Skills training and specialized workshops.",
    operatingHours: "07:30 AM - 05:00 PM",
    color: "#0D9488",
  },
  {
    id: "tes-bldg",
    name: "TES (Technical Education Services)",
    shortName: "TES",
    category: "academic",
    x: 18,
    y: 59.5,
    width: 4.5,
    height: 4,
    description: "Technical education services building and community extension office.",
    floors: 2,
    departments: ["TESDA Certified Programs", "Community Extension"],
    amenities: ["Tool Dispensary"],
    popularFor: "Vocational training and community outreach.",
    operatingHours: "08:00 AM - 05:00 PM",
    color: "#0D9488",
  },
  {
    id: "mrf-power-house",
    name: "MRF & Power House",
    shortName: "MRF Power House",
    category: "amenity",
    x: 23.5,
    y: 63.5,
    width: 5,
    height: 3.8,
    description: "Materials Recovery Facility (MRF) and campus electrical powerhouse near Gate 9.",
    floors: 1,
    departments: ["Campus Sustainability", "Electrical Engineering Maintenance"],
    amenities: ["Waste Segregation Station", "Generators"],
    popularFor: "Campus recycling and emergency power distribution.",
    operatingHours: "24 Hours",
    color: "#475569",
  },

  // --- SOUTH / SANTUARIO SECTOR (Balay Kalinungan & Retreat Center) ---
  {
    id: "bk-parking-area",
    name: "Balay Kalinungan Parking Area",
    shortName: "BK Parking Area",
    category: "amenity",
    x: 51.5,
    y: 59.5,
    width: 6.5,
    height: 3.5,
    description: "Shaded parking lot for Balay Kalinungan retreatants and summit guests.",
    floors: 1,
    departments: ["BK Attendants"],
    amenities: ["Shaded Parking Slots"],
    popularFor: "Event parking near Balay Kalinungan.",
    operatingHours: "24 Hours",
    color: "#475569",
  },
  {
    id: "balay-kalinungan-2",
    name: "Balay Kalinungan Phase - 2",
    shortName: "Balay Kalinungan Ph-2",
    category: "amenity",
    x: 44,
    y: 68,
    width: 5.5,
    height: 4.5,
    description: "Modern retreat center wing with air-conditioned guest rooms and conference halls.",
    floors: 3,
    departments: ["Retreat Management", "Guest Lodging"],
    amenities: ["Guest Rooms", "Meeting Rooms", "Dining Hall"],
    popularFor: "Retreats, leadership seminars, visiting speakers.",
    operatingHours: "24 Hours (Front Desk)",
    color: "#10B981",
  },
  {
    id: "balay-kalinungan-1",
    name: "Balay Kalinungan Phase - 1",
    shortName: "Balay Kalinungan Ph-1",
    category: "amenity",
    x: 51,
    y: 68,
    width: 5.5,
    height: 4.5,
    description: "Original Lasallian retreat complex featuring serene garden courtyards and seminar rooms.",
    floors: 2,
    departments: ["BK Administration", "Spiritual Formation"],
    amenities: ["Prayer Garden", "Conference Pavilion"],
    popularFor: "Faculty retreats, spiritual recollections, seminars.",
    operatingHours: "24 Hours",
    color: "#10B981",
  },
  {
    id: "dormitory-1-2",
    name: "Dormitory #1 & #2",
    shortName: "Dormitory #1 & #2",
    category: "amenity",
    x: 57.5,
    y: 68,
    width: 5,
    height: 4,
    description: "On-campus student residence halls providing safe dormitory living.",
    floors: 3,
    departments: ["Housing & Residential Life"],
    amenities: ["Study Lounges", "Wi-Fi", "Laundry Area"],
    popularFor: "On-campus student accommodation.",
    operatingHours: "24 Hours",
    color: "#10B981",
  },
  {
    id: "bus-garage",
    name: "Bus Garage",
    shortName: "Bus Garage",
    category: "amenity",
    x: 59,
    y: 73.5,
    width: 5,
    height: 3.8,
    description: "University fleet depot housing the official USLS green Lasallian buses.",
    floors: 1,
    departments: ["Motorpool Operations"],
    amenities: ["Bus Maintenance Bay", "Driver Lounge"],
    popularFor: "University bus dispatch for field trips & athletic meets.",
    operatingHours: "06:00 AM - 08:00 PM",
    color: "#475569",
  },
  {
    id: "maison-parmenie",
    name: "Maison Parmenie",
    shortName: "Maison Parmenie",
    category: "religious",
    x: 53.5,
    y: 78,
    width: 5.5,
    height: 4.2,
    description: "Quiet Lasallian spiritual formation center and Brothers' retreat residence.",
    floors: 2,
    departments: ["Brothers Community", "Spiritual Direction"],
    amenities: ["Meditation Garden", "Library", "Private Chapel"],
    popularFor: "Spiritual direction and silent reflection.",
    operatingHours: "08:00 AM - 06:00 PM",
    color: "#8B5CF6",
  },
];

// =============================================================================
// 🧭 DETAILED GRAPH WAYPOINTS (Official Restructured Pathway Network)
// =============================================================================
export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label?: string;
  neighbors: string[]; // Adjacent waypoint IDs along restructured pathways
}

export const CAMPUS_GRAPH_NODES: Record<string, GraphNode> = {
  // GATES & PERIMETER ENTRANCES
  "node-gate1": { id: "node-gate1", x: 22, y: 16, label: "Gate 1 Concourse", neighbors: ["node-bookshop-n", "node-p2-w", "node-gate2"] },
  "node-gate2": { id: "node-gate2", x: 34, y: 14, label: "Gate 2 (Main Entrance)", neighbors: ["node-gate1", "node-pt-c", "node-yanson"] },
  "node-pt-c": { id: "node-pt-c", x: 37, y: 17, label: "Gathering Point C", neighbors: ["node-gate2", "node-roundabout", "node-is-admin", "node-yanson"] },
  "node-gate3": { id: "node-gate3", x: 68, y: 19, label: "Gate 3 Concourse", neighbors: ["node-is-east-spine-3", "node-gate4"] },
  "node-gate4": { id: "node-gate4", x: 76, y: 23, label: "Gate 4 Concourse", neighbors: ["node-gate3", "node-is-east-spine-4", "node-gate5"] },
  "node-gate5": { id: "node-gate5", x: 84, y: 27, label: "Gate 5 Concourse", neighbors: ["node-gate4", "node-is-east-spine-5", "node-gate6"] },
  "node-gate6": { id: "node-gate6", x: 93, y: 31, label: "Gate 6 Concourse", neighbors: ["node-gate5", "node-prof-school", "node-oval-ne"] },
  "node-gate7": { id: "node-gate7", x: 65, y: 70, label: "Gate 7 Concourse", neighbors: ["node-bus-garage", "node-bk-junction"] },
  "node-gate8": { id: "node-gate8", x: 56, y: 84, label: "Gate 8 Concourse", neighbors: ["node-santuario", "node-parmenie"] },
  "node-gate9": { id: "node-gate9", x: 19, y: 70, label: "Gate 9 Concourse", neighbors: ["node-mrf", "node-tes"] },

  // NORTH-WEST LOOP (Bookshop, Parking 2, ELC, Chapel)
  "node-bookshop-n": { id: "node-bookshop-n", x: 19, y: 20, label: "Universal Bookshop North", neighbors: ["node-gate1", "node-bookshop-w", "node-p2-w"] },
  "node-bookshop-w": { id: "node-bookshop-w", x: 16, y: 25, label: "Bookshop / LLC West Path", neighbors: ["node-bookshop-n", "node-elc-w", "node-p2-w"] },
  "node-elc-w": { id: "node-elc-w", x: 16, y: 31, label: "ELC West Pathway", neighbors: ["node-bookshop-w", "node-coliseum-nw", "node-coliseum-w"] },
  "node-p2-w": { id: "node-p2-w", x: 22, y: 23, label: "Parking Space 2 North", neighbors: ["node-gate1", "node-bookshop-n", "node-bookshop-w", "node-p2-e", "node-coliseum-nw"] },
  "node-p2-e": { id: "node-p2-e", x: 27, y: 23, label: "Parking Space 2 East / Chapel West", neighbors: ["node-p2-w", "node-chapel-n", "node-chapel-s", "node-roundabout"] },
  "node-chapel-n": { id: "node-chapel-n", x: 31, y: 20, label: "University Chapel North", neighbors: ["node-p2-e", "node-yanson", "node-roundabout"] },
  "node-chapel-s": { id: "node-chapel-s", x: 30, y: 28, label: "University Chapel South", neighbors: ["node-p2-e", "node-roundabout", "node-coliseum-ne", "node-room10-w"] },

  // CENTRAL ROUNDABOUT HUB (Gathering Point B)
  "node-yanson": { id: "node-yanson", x: 34, y: 18, label: "Yanson Hall Concourse", neighbors: ["node-gate2", "node-pt-c", "node-roundabout", "node-chapel-n"] },
  "node-roundabout": { id: "node-roundabout", x: 38, y: 24, label: "Central Roundabout (Gathering Point B)", neighbors: ["node-pt-c", "node-yanson", "node-chapel-n", "node-chapel-s", "node-st-miguel-n", "node-is-east-spine-1", "node-business-off"] },
  "node-is-admin": { id: "node-is-admin", x: 43, y: 18, label: "IS Admin Walkway", neighbors: ["node-pt-c", "node-roundabout", "node-business-off", "node-is-east-spine-1"] },
  "node-business-off": { id: "node-business-off", x: 44, y: 24, label: "Business Office & Clinic", neighbors: ["node-roundabout", "node-is-admin", "node-is-east-spine-1", "node-st-benilde-n"] },

  // NORTH-EAST EASTBOUND SPINE (Along New IS Building)
  "node-is-east-spine-1": { id: "node-is-east-spine-1", x: 50, y: 25, label: "IS Quadrangle West", neighbors: ["node-roundabout", "node-is-admin", "node-business-off", "node-is-east-spine-2", "node-tennis-n"] },
  "node-is-east-spine-2": { id: "node-is-east-spine-2", x: 60, y: 26, label: "IS Computer Center North", neighbors: ["node-is-east-spine-1", "node-is-east-spine-3", "node-pool-n"] },
  "node-is-east-spine-3": { id: "node-is-east-spine-3", x: 68, y: 27, label: "Gallaga Theater Walkway", neighbors: ["node-is-east-spine-2", "node-gate3", "node-is-east-spine-4", "node-pool-n"] },
  "node-is-east-spine-4": { id: "node-is-east-spine-4", x: 76, y: 28, label: "New IS Building Mid", neighbors: ["node-is-east-spine-3", "node-gate4", "node-is-east-spine-5", "node-hs-court-n"] },
  "node-is-east-spine-5": { id: "node-is-east-spine-5", x: 84, y: 29, label: "New IS Building East", neighbors: ["node-is-east-spine-4", "node-gate5", "node-prof-school", "node-hs-court-n"] },
  "node-prof-school": { id: "node-prof-school", x: 88, y: 32, label: "Professional School Building", neighbors: ["node-is-east-spine-5", "node-gate6", "node-hs-court-n", "node-oval-ne"] },

  // WEST FLANK (Coliseum, Food Court, Technical Sector)
  "node-coliseum-nw": { id: "node-coliseum-nw", x: 19, y: 31, label: "Coliseum North-West", neighbors: ["node-elc-w", "node-p2-w", "node-coliseum-w", "node-coliseum-ne"] },
  "node-coliseum-w": { id: "node-coliseum-w", x: 16, y: 40, label: "Coliseum & Food Court West Path", neighbors: ["node-elc-w", "node-coliseum-nw", "node-coliseum-sw"] },
  "node-coliseum-sw": { id: "node-coliseum-sw", x: 18, y: 49, label: "Coliseum South-West", neighbors: ["node-coliseum-w", "node-coliseum-s", "node-parking3", "node-carpentry"] },
  "node-coliseum-ne": { id: "node-coliseum-ne", x: 26, y: 31, label: "Coliseum North-East Walkway", neighbors: ["node-coliseum-nw", "node-chapel-s", "node-room10-w", "node-coliseum-e"] },
  "node-coliseum-e": { id: "node-coliseum-e", x: 26, y: 39, label: "Coliseum East / Academic West Path", neighbors: ["node-coliseum-ne", "node-coliseum-s", "node-solomon-w", "node-cody-w"] },
  "node-coliseum-s": { id: "node-coliseum-s", x: 24, y: 49, label: "Coliseum South Walkway", neighbors: ["node-coliseum-sw", "node-coliseum-e", "node-cody-w", "node-ica", "node-wester-w"] },

  // CENTRAL ACADEMIC RECTANGULAR GRID
  // Row 1: Above St. Miguel / Room 10 / St. Benilde
  "node-room10-w": { id: "node-room10-w", x: 30, y: 31, label: "Room 10 West Walkway", neighbors: ["node-chapel-s", "node-coliseum-ne", "node-st-miguel-n", "node-solomon-w"] },
  "node-st-miguel-n": { id: "node-st-miguel-n", x: 38, y: 31, label: "St. Miguel North Walkway", neighbors: ["node-roundabout", "node-room10-w", "node-st-benilde-n", "node-solomon-n"] },
  "node-st-benilde-n": { id: "node-st-benilde-n", x: 46, y: 31, label: "St. Benilde North Walkway", neighbors: ["node-business-off", "node-st-miguel-n", "node-tennis-n", "node-st-benilde-e"] },
  "node-tennis-n": { id: "node-tennis-n", x: 52, y: 31, label: "Tennis Court North Walkway", neighbors: ["node-is-east-spine-1", "node-st-benilde-n", "node-pool-n", "node-covered-court-w"] },
  "node-pool-n": { id: "node-pool-n", x: 62, y: 31, label: "Swimming Pool North Walkway", neighbors: ["node-is-east-spine-2", "node-is-east-spine-3", "node-tennis-n", "node-oval-nw"] },

  // Row 2: Between Solomon and Cody Hall
  "node-solomon-w": { id: "node-solomon-w", x: 29, y: 42, label: "Solomon West Walkway", neighbors: ["node-room10-w", "node-coliseum-e", "node-solomon-mid", "node-cody-w"] },
  "node-solomon-n": { id: "node-solomon-n", x: 38, y: 37, label: "St. Miguel / Solomon Walkway", neighbors: ["node-st-miguel-n", "node-solomon-mid"] },
  "node-solomon-mid": { id: "node-solomon-mid", x: 38, y: 42, label: "Solomon Central Walkway", neighbors: ["node-solomon-n", "node-solomon-w", "node-solomon-e", "node-cody-mid"] },
  "node-solomon-e": { id: "node-solomon-e", x: 46, y: 42, label: "Solomon East / MM Walkway", neighbors: ["node-solomon-mid", "node-st-benilde-e", "node-cody-e", "node-covered-court-w"] },
  "node-st-benilde-e": { id: "node-st-benilde-e", x: 46, y: 36, label: "St. Benilde East Path", neighbors: ["node-st-benilde-n", "node-solomon-e", "node-covered-court-w"] },

  // Row 3: Between Cody Hall and Hugh Wester Hall / College Library
  "node-cody-w": { id: "node-cody-w", x: 28, y: 51, label: "Br. Cody West Walkway", neighbors: ["node-coliseum-e", "node-coliseum-s", "node-solomon-w", "node-cody-mid", "node-wester-w"] },
  "node-cody-mid": { id: "node-cody-mid", x: 37, y: 51, label: "Br. Cody Central Corridor", neighbors: ["node-solomon-mid", "node-cody-w", "node-cody-e", "node-wester-mid"] },
  "node-cody-e": { id: "node-cody-e", x: 46, y: 51, label: "MM Hall / Cody East Path", neighbors: ["node-solomon-e", "node-cody-mid", "node-lib-e", "node-covered-court-s"] },

  // Row 4: Below Hugh Wester Hall / Science & Engineering Bldg
  "node-wester-w": { id: "node-wester-w", x: 27, y: 60, label: "Br. Hugh Wester West", neighbors: ["node-coliseum-s", "node-cody-w", "node-ica", "node-wester-mid", "node-tes"] },
  "node-wester-mid": { id: "node-wester-mid", x: 37, y: 60, label: "Br. Hugh Wester Mid Corridor", neighbors: ["node-cody-mid", "node-wester-w", "node-lib-e", "node-chem-lab-s"] },
  "node-lib-e": { id: "node-lib-e", x: 45, y: 60, label: "College Library & Science Walkway", neighbors: ["node-cody-e", "node-wester-mid", "node-bk-parking", "node-chem-lab-s"] },
  "node-chem-lab-s": { id: "node-chem-lab-s", x: 39, y: 67, label: "Chem / ECE Lab South Junction", neighbors: ["node-wester-mid", "node-lib-e", "node-tes", "node-mrf", "node-bk-junction"] },

  // SOUTH-WEST TECHNICAL & SERVICES
  "node-parking3": { id: "node-parking3", x: 20, y: 53, label: "Parking Area 3", neighbors: ["node-coliseum-sw", "node-carpentry", "node-ica"] },
  "node-carpentry": { id: "node-carpentry", x: 16, y: 56, label: "Carpentry Work Area", neighbors: ["node-parking3", "node-dison", "node-tes"] },
  "node-dison": { id: "node-dison", x: 12, y: 54, label: "Dison Hall Walkway", neighbors: ["node-carpentry"] },
  "node-ica": { id: "node-ica", x: 23, y: 56, label: "ICA Walkway", neighbors: ["node-coliseum-s", "node-wester-w", "node-parking3", "node-tes"] },
  "node-tes": { id: "node-tes", x: 19, y: 62, label: "TES Walkway", neighbors: ["node-carpentry", "node-ica", "node-wester-w", "node-chem-lab-s", "node-mrf", "node-gate9"] },
  "node-mrf": { id: "node-mrf", x: 21, y: 66, label: "MRF & Power House", neighbors: ["node-tes", "node-chem-lab-s", "node-gate9"] },

  // SPORTS & TRACK OVAL LOOP (Gathering Point A)
  "node-covered-court-w": { id: "node-covered-court-w", x: 52, y: 39, label: "Covered Court West", neighbors: ["node-tennis-n", "node-solomon-e", "node-st-benilde-e", "node-covered-court-s", "node-oval-w"] },
  "node-covered-court-s": { id: "node-covered-court-s", x: 52, y: 47, label: "Covered Court South", neighbors: ["node-covered-court-w", "node-cody-e", "node-oval-sw"] },
  "node-hs-court-n": { id: "node-hs-court-n", x: 84, y: 36, label: "HS Covered Court Walkway", neighbors: ["node-is-east-spine-4", "node-is-east-spine-5", "node-prof-school", "node-oval-ne"] },
  "node-oval-nw": { id: "node-oval-nw", x: 63, y: 38, label: "Track Oval North-West (Grandstand)", neighbors: ["node-pool-n", "node-oval-w", "node-oval-ne"] },
  "node-oval-ne": { id: "node-oval-ne", x: 82, y: 40, label: "Track Oval North-East", neighbors: ["node-oval-nw", "node-gate6", "node-prof-school", "node-hs-court-n", "node-oval-e"] },
  "node-oval-w": { id: "node-oval-w", x: 58, y: 46, label: "Track Oval West Concourse", neighbors: ["node-covered-court-w", "node-oval-nw", "node-pt-a", "node-oval-sw"] },
  "node-oval-e": { id: "node-oval-e", x: 85, y: 49, label: "Track Oval East Curve", neighbors: ["node-oval-ne", "node-pt-a", "node-oval-se"] },
  "node-pt-a": { id: "node-pt-a", x: 68, y: 45, label: "Gathering Point A (Oval Pitch)", neighbors: ["node-oval-w", "node-oval-e"] },
  "node-oval-sw": { id: "node-oval-sw", x: 57, y: 55, label: "Track Oval South-West", neighbors: ["node-oval-w", "node-covered-court-s", "node-bk-parking", "node-oval-s"] },
  "node-oval-se": { id: "node-oval-se", x: 77, y: 59, label: "Track Oval South-East Curve", neighbors: ["node-oval-e", "node-oval-s"] },
  "node-oval-s": { id: "node-oval-s", x: 67, y: 64, label: "Track Oval South Loop", neighbors: ["node-oval-sw", "node-oval-se", "node-bk-parking", "node-bk-junction"] },

  // SOUTH CORRIDOR TO SANTUARIO DE LA SALLE (Destination)
  "node-bk-parking": { id: "node-bk-parking", x: 51, y: 61, label: "Balay Kalinungan Parking", neighbors: ["node-lib-e", "node-oval-sw", "node-oval-s", "node-bk-junction"] },
  "node-bk-junction": { id: "node-bk-junction", x: 54, y: 68, label: "Balay Kalinungan Central Junction", neighbors: ["node-chem-lab-s", "node-bk-parking", "node-oval-s", "node-bus-garage", "node-santuario-n"] },
  "node-bus-garage": { id: "node-bus-garage", x: 61, y: 70, label: "Bus Garage & Dorms Concourse", neighbors: ["node-bk-junction", "node-gate7", "node-parmenie"] },
  "node-santuario-n": { id: "node-santuario-n", x: 52, y: 74, label: "Santuario North Walkway", neighbors: ["node-bk-junction", "node-santuario", "node-parmenie"] },
  "node-parmenie": { id: "node-parmenie", x: 54, y: 79, label: "Maison Parmenie Walkway", neighbors: ["node-santuario-n", "node-bus-garage", "node-santuario", "node-gate8"] },
  "node-santuario": { id: "node-santuario", x: 47, y: 80, label: "Santuario de La Salle (Destination)", neighbors: ["node-santuario-n", "node-parmenie", "node-gate8"] },
};

// Mapping of Building ID to closest Graph Waypoint
export const BUILDING_NODE_MAP: Record<string, string> = {
  "gate-1": "node-gate1",
  "gate-2": "node-gate2",
  "gate-3": "node-gate3",
  "gate-4": "node-gate4",
  "gate-5": "node-gate5",
  "gate-6": "node-gate6",
  "gate-7": "node-gate7",
  "gate-8": "node-gate8",
  "gate-9": "node-gate9",
  "santuario-de-la-salle": "node-santuario",
  "universal-bookshop": "node-bookshop-n",
  "elc-llc": "node-elc-w",
  "parking-space-2": "node-p2-e",
  "university-chapel": "node-chapel-n",
  "yanson-hall": "node-yanson",
  "admin-bldg-is": "node-is-admin",
  "business-office-bldg": "node-business-off",
  "steel-parking": "node-is-admin",
  "grade-1-bldg": "node-is-east-spine-1",
  "grade-school-bldg": "node-is-east-spine-1",
  "is-admin-gs-comp": "node-is-east-spine-2",
  "gallaga-theater": "node-is-east-spine-3",
  "prep-school-bldg": "node-is-east-spine-3",
  "new-is-bldg": "node-is-east-spine-4",
  "coliseum": "node-coliseum-e",
  "room-10-bldg": "node-room10-w",
  "small-library": "node-room10-w",
  "st-miguel": "node-st-miguel-n",
  "solomon-building": "node-solomon-mid",
  "st-benilde": "node-st-benilde-n",
  "st-mutien-marie-annex": "node-solomon-e",
  "mutien-marie-hall": "node-cody-e",
  "tennis-court": "node-tennis-n",
  "covered-court": "node-covered-court-w",
  "swimming-pool-grandstand": "node-pool-n",
  "track-oval": "node-pt-a",
  "prof-school-bldg": "node-prof-school",
  "hs-covered-court": "node-hs-court-n",
  "br-cody-hall": "node-cody-mid",
  "college-library": "node-cody-e",
  "br-hugh-wester-hall": "node-wester-mid",
  "computer-center": "node-wester-mid",
  "science-eng-bldg": "node-lib-e",
  "chem-ece-lab": "node-chem-lab-s",
  "parking-area-3": "node-parking3",
  "ica-bldg": "node-ica",
  "carpentry-area": "node-carpentry",
  "dison-hall": "node-dison",
  "tes-bldg": "node-tes",
  "mrf-power-house": "node-mrf",
  "bk-parking-area": "node-bk-parking",
  "balay-kalinungan-2": "node-bk-junction",
  "balay-kalinungan-1": "node-bk-junction",
  "dormitory-1-2": "node-bus-garage",
  "bus-garage": "node-bus-garage",
  "maison-parmenie": "node-parmenie",
};

// =============================================================================
// 🧮 DIJKSTRA PATHFINDING ACROSS REAL PAVED WALKWAYS (Cartesian Ratio: 1% = 4.286m)
// =============================================================================
export function getDistanceMeters(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  // 300m campus / 70% map height = 4.286 meters per percentage unit
  const dx = (p1.x - p2.x) * 4.286;
  const dy = (p1.y - p2.y) * 4.286;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

export function findWalkwayShortestPath(startNodeId: string, endNodeId: string): Waypoint[] {
  if (!CAMPUS_GRAPH_NODES[startNodeId] || !CAMPUS_GRAPH_NODES[endNodeId]) {
    const start = CAMPUS_GRAPH_NODES[startNodeId] || CAMPUS_GRAPH_NODES["node-gate2"];
    const end = CAMPUS_GRAPH_NODES[endNodeId] || CAMPUS_GRAPH_NODES["node-santuario"];
    return [{ x: start.x, y: start.y }, { x: end.x, y: end.y }];
  }

  if (startNodeId === endNodeId) {
    const node = CAMPUS_GRAPH_NODES[startNodeId];
    return [{ x: node.x, y: node.y }];
  }

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const nodeId of Object.keys(CAMPUS_GRAPH_NODES)) {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  }

  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let closestNodeId: string | null = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        closestNodeId = nodeId;
      }
    }

    if (closestNodeId === null || minDistance === Infinity) {
      break;
    }

    if (closestNodeId === endNodeId) {
      break;
    }

    unvisited.delete(closestNodeId);
    const currentNode = CAMPUS_GRAPH_NODES[closestNodeId];

    for (const neighborId of currentNode.neighbors) {
      if (!unvisited.has(neighborId)) continue;
      const neighborNode = CAMPUS_GRAPH_NODES[neighborId];
      if (!neighborNode) continue;

      const dist = getDistanceMeters(currentNode, neighborNode);
      const alt = distances[closestNodeId] + dist;

      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = closestNodeId;
      }
    }
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  let curr: string | null = endNodeId;

  while (curr !== null) {
    pathNodeIds.unshift(curr);
    curr = previous[curr];
  }

  if (pathNodeIds[0] !== startNodeId) {
    // Fallback direct
    const s = CAMPUS_GRAPH_NODES[startNodeId];
    const e = CAMPUS_GRAPH_NODES[endNodeId];
    return [{ x: s.x, y: s.y }, { x: e.x, y: e.y }];
  }

  return pathNodeIds.map((id) => ({
    x: CAMPUS_GRAPH_NODES[id].x,
    y: CAMPUS_GRAPH_NODES[id].y,
  }));
}

export function calculateCampusRoute(
  originId: string,
  destinationId: string,
  userCoords?: { x: number; y: number }
): NavigationRoute | null {
  if (originId === "user-current-location" || originId === "user-pointer" || originId === "current-location") {
    const coords = userCoords || { x: 34, y: 14 };
    return calculateRouteFromGpsLocation(coords.x, coords.y, destinationId);
  }

  const origin = CAMPUS_BUILDINGS.find((b) => b.id === originId) || CAMPUS_BUILDINGS[0];
  const destination = CAMPUS_BUILDINGS.find((b) => b.id === destinationId) || CAMPUS_BUILDINGS[1];

  const startNodeId = BUILDING_NODE_MAP[origin.id] || "node-gate2";
  const endNodeId = BUILDING_NODE_MAP[destination.id] || "node-santuario";

  const rawWaypoints = findWalkwayShortestPath(startNodeId, endNodeId);

  // Prefix building center and suffix destination center if helpful
  const fullWaypoints: Waypoint[] = [
    { x: origin.x, y: origin.y },
    ...rawWaypoints,
    { x: destination.x, y: destination.y },
  ];

  // Remove duplicate adjacent waypoints
  const waypoints: Waypoint[] = [];
  for (let i = 0; i < fullWaypoints.length; i++) {
    const pt = fullWaypoints[i];
    if (i === 0 || Math.hypot(pt.x - waypoints[waypoints.length - 1].x, pt.y - waypoints[waypoints.length - 1].y) > 0.8) {
      waypoints.push(pt);
    }
  }

  // Calculate total meters
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += getDistanceMeters(waypoints[i], waypoints[i + 1]);
  }

  const walkingSpeedMpm = 75; // meters per minute
  const estimatedMinutes = Math.max(1, Math.round(totalDistance / walkingSpeedMpm));

  // Generate Turn-by-Turn Steps
  const steps: NavigationStep[] = [];
  steps.push({
    instruction: `Start at ${origin.name}. Proceed along the paved campus walkway.`,
    distanceMeters: 0,
    landmarkCue: origin.shortName,
  });

  for (let i = 0; i < waypoints.length - 1; i++) {
    const dist = getDistanceMeters(waypoints[i], waypoints[i + 1]);
    if (dist > 10) {
      steps.push({
        instruction: `Continue along the covered concourse (~${dist} meters).`,
        distanceMeters: dist,
      });
    }
  }

  steps.push({
    instruction: `Arrive at your destination: ${destination.name}.`,
    distanceMeters: 0,
    landmarkCue: destination.shortName,
  });

  return {
    origin,
    destination,
    distanceMeters: Math.max(20, totalDistance),
    estimatedMinutes,
    pathWaypoints: waypoints,
    steps,
  };
}

/**
 * Finds the closest campus building to a given map coordinate (x, y)
 */
export function getClosestBuilding(x: number, y: number): CampusBuilding {
  let closest = CAMPUS_BUILDINGS[0];
  let minDistance = Infinity;

  for (const building of CAMPUS_BUILDINGS) {
    const dist = Math.hypot(building.x - x, building.y - y);
    if (dist < minDistance) {
      minDistance = dist;
      closest = building;
    }
  }

  return closest;
}

/**
 * Finds the closest graph node to a given map coordinate (x, y)
 */
export function getClosestGraphNode(x: number, y: number): string {
  let closestId = "node-gate2";
  let minDistance = Infinity;

  for (const [id, node] of Object.entries(CAMPUS_GRAPH_NODES)) {
    const dist = Math.hypot(node.x - x, node.y - y);
    if (dist < minDistance) {
      minDistance = dist;
      closestId = id;
    }
  }

  return closestId;
}

/**
 * Calculates turn-by-turn route starting directly from the user's real GPS position
 */
export function calculateRouteFromGpsLocation(
  userX: number,
  userY: number,
  destinationId: string
): NavigationRoute {
  const destination = CAMPUS_BUILDINGS.find((b) => b.id === destinationId) || CAMPUS_BUILDINGS[0];
  const closestNodeId = getClosestGraphNode(userX, userY);
  const endNodeId = BUILDING_NODE_MAP[destination.id] || "node-santuario";

  const rawWaypoints = findWalkwayShortestPath(closestNodeId, endNodeId);
  const fullWaypoints: Waypoint[] = [
    { x: userX, y: userY },
    ...rawWaypoints,
    { x: destination.x, y: destination.y },
  ];

  const waypoints: Waypoint[] = [];
  for (let i = 0; i < fullWaypoints.length; i++) {
    const pt = fullWaypoints[i];
    if (i === 0 || Math.hypot(pt.x - waypoints[waypoints.length - 1].x, pt.y - waypoints[waypoints.length - 1].y) > 0.8) {
      waypoints.push(pt);
    }
  }

  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += getDistanceMeters(waypoints[i], waypoints[i + 1]);
  }

  const estimatedMinutes = Math.max(1, Math.round(totalDistance / 75));
  const closestBuilding = getClosestBuilding(userX, userY);

  const virtualOrigin: CampusBuilding = {
    id: "user-current-location",
    name: `Your Location (near ${closestBuilding.shortName})`,
    shortName: "Your GPS Location",
    category: "amenity",
    x: userX,
    y: userY,
    width: 4,
    height: 4,
    description: "Live GPS pinpoint coordinates.",
    floors: 1,
    departments: ["Live GPS Location"],
    amenities: ["GPS Tracked"],
    popularFor: "Real-time user starting point.",
    operatingHours: "Always Active",
    color: "#2563EB",
  };

  const steps: NavigationStep[] = [
    {
      instruction: `Start from your current live location (near ${closestBuilding.shortName}).`,
      distanceMeters: 0,
      landmarkCue: "Current GPS Position",
    },
    ...rawWaypoints.slice(0, -1).map((wpt, idx) => ({
      instruction: `Follow the covered walkway towards ${destination.shortName} (~${getDistanceMeters(wpt, rawWaypoints[idx + 1] || wpt)}m).`,
      distanceMeters: getDistanceMeters(wpt, rawWaypoints[idx + 1] || wpt),
    })),
    {
      instruction: `Arrive at ${destination.name}.`,
      distanceMeters: 0,
      landmarkCue: destination.shortName,
    },
  ];

  return {
    origin: virtualOrigin,
    destination,
    distanceMeters: Math.max(15, totalDistance),
    estimatedMinutes,
    pathWaypoints: waypoints,
    steps,
  };
}

