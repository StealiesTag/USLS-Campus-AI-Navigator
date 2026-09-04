import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));

// Lazy Google GenAI Client
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Give context to AI here to retrieve data
const CAMPUS_KNOWLEDGE = `
USLS (University of St. La Salle, Bacolod) Campus Buildings & IDs (Official Negros Mental Health Summit Map Layout):
- "user-current-location": Your Live Location / User Pointer (Default real-time GPS pinpoint & compass pointer)
- "santuario-de-la-salle": Santuario de La Salle (Main Destination, University Sanctuary, Event Center, Summit Hall)
- "gate-1": Gate 1 (La Salle Avenue NW Entrance, near Bookshop & ELC)
- "gate-2": Gate 2 (Main Administration Gate, near Gathering Point C & Yanson Hall)
- "gate-3": Gate 3 (Integrated School Gate, near Steel Parking & Grade School)
- "gate-4": Gate 4 (Gallaga Theater Gate)
- "gate-5": Gate 5 (New IS Building Gate)
- "gate-6": Gate 6 (Professional School & Sports Gate)
- "gate-7": Gate 7 (Balay Kalinungan Gate)
- "gate-8": Gate 8 (Santuario de La Salle South Gate)
- "gate-9": Gate 9 (Carpentry & Technical Gate)
- "universal-bookshop": Universal Bookshop (Textbooks, School Supplies, Lasallian Merchandise)
- "elc-llc": ELC / LLC Building (English Language Center, Language Labs)
- "parking-space-2": Parking Space - 2 (NW Parking)
- "university-chapel": University Chapel (Sacred Chapel for Prayer and Mass)
- "yanson-hall": Yanson Hall (Integrated School Classrooms)
- "admin-bldg-is": Admin Bldg (Integrated School Administration)
- "business-office-bldg": Business Office Bldg / Clinic / Procurement (University Health Clinic, Procurement, Business Office)
- "steel-parking": Steel Parking (Multi-level parking)
- "grade-1-bldg": Grade - 1 Building
- "grade-school-bldg": Grade School Building & IS Garden
- "is-admin-gs-comp": IS Admin & GS Computer Center
- "gallaga-theater": Gallaga Theater (Performing Arts Theater named after Peque Gallaga)
- "prep-school-bldg": Prep School Building & Power House
- "new-is-bldg": New Integrated School Building (Senior & Junior High School)
- "coliseum": USLS Coliseum (Multi-purpose 8,000-seat arena, Varsity games, Graduations)
- "room-10-bldg": Room 10 Building (Academic Classrooms)
- "small-library": Library Wing (Study Rooms & Reference Library)
- "st-miguel": St. Miguel (GSM/Law, College of Medicine, University Admin Offices, Registrar, Admissions, Accounting)
- "solomon-building": Solomon Building (Dr. Lucio C. Tan College of Business & Accountancy - CBA)
- "st-benilde": St. Benilde Hall (Humanities & Liberal Arts)
- "st-mutien-marie-annex": St. Mutien Marie Annex (Teacher Education labs)
- "mutien-marie-hall": MM Hall / Mutien Marie Hall (College of Education & College of Arts and Sciences - CAS)
- "tennis-court": Tennis Court
- "covered-court": Covered Court & Open Court (Volleyball, Badminton, PE)
- "swimming-pool-grandstand": Grandstand & Swimming Pool Complex (50m Olympic Pool)
- "track-oval": Track & Field Oval (Gathering Point A, 400m Track, Football Pitch)
- "prof-school-bldg": Professional School Building (Graduate Studies, Law)
- "hs-covered-court": High School Basketball Covered Court
- "br-cody-hall": Br. Francis Cody FSC Hall (College of Nursing & Allied Health Sciences, Simulation Wards)
- "college-library": College Library (Main LRC, Digital Commons, Archives)
- "br-hugh-wester-hall": Br. Hugh Wester FSC Hall (Engineering & Technology Classrooms)
- "computer-center": Computer Center (Datacenter, IT, AI & Coding Labs)
- "science-eng-bldg": Science & Eng'g Building (Engineering Labs, Physics, Robotics)
- "chem-ece-lab": Chem / ECE Lab (Chemistry Wet Labs, Electronics Labs)
- "parking-area-3": Parking Area - 3
- "ica-bldg": ICA (Institute of Culinary Arts, Commercial Kitchens)
- "carpentry-area": Carpentry Work Area (Physical Plant)
- "dison-hall": Dison Hall (Technical & Vocational Education)
- "tes-bldg": TES (Technical Education Services)
- "mrf-power-house": MRF & Power House (Recycling Facility & Power Generators)
- "bk-parking-area": Balay Kalinungan Parking Area
- "balay-kalinungan-2": Balay Kalinungan Phase - 2 (Retreat Center & Guest Rooms)
- "balay-kalinungan-1": Balay Kalinungan Phase - 1 (Retreat Pavilion & Prayer Garden)
- "dormitory-1-2": Dormitory #1 & #2 (Student Housing)
- "bus-garage": Bus Garage (USLS Green Fleet)
- "maison-parmenie": Maison Parmenie (Brothers' Spiritual Formation Center)
`;

// Helper: Intelligent offline fallback navigation generator
function getCampusOfflineFallback(prompt: string, originId: string = "user-current-location") {
  const p = prompt.toLowerCase();
  let destinationId = "santuario-de-la-salle";
  let description = "Follow the central covered walkway toward your destination.";

  if (p.includes("santuario") || p.includes("summit") || p.includes("sanctuary") || p.includes("event") || p.includes("hall")) {
    destinationId = "santuario-de-la-salle";
    description = "Head southeast past Miguel Hall and follow the illuminated promenade directly to Santuario de La Salle.";
  } else if (p.includes("registrar") || p.includes("admission") || p.includes("accounting") || p.includes("miguel") || p.includes("medicine")) {
    destinationId = "st-miguel";
    description = "Proceed towards St. Miguel Hall. The Office of the Registrar and University Admissions are located on the ground floor.";
  } else if (p.includes("library") || p.includes("book") || p.includes("study") || p.includes("lrc")) {
    destinationId = "college-library";
    description = "Walk toward the College Library / Learning Resource Center situated adjacent to Cody Hall and the Computer Center.";
  } else if (p.includes("coliseum") || p.includes("arena") || p.includes("game") || p.includes("basketball")) {
    destinationId = "coliseum";
    description = "Make your way south toward the USLS Coliseum arena located right by the Grandstand and Olympic Swimming Pool.";
  } else if (p.includes("food") || p.includes("lunch") || p.includes("snack") || p.includes("canteen") || p.includes("eat") || p.includes("ica") || p.includes("culinary")) {
    destinationId = "ica-bldg";
    description = "Head towards the ICA (Institute of Culinary Arts) & Canteen area for freshly prepared meals and drinks.";
  } else if (p.includes("nursing") || p.includes("cody") || p.includes("allied health")) {
    destinationId = "br-cody-hall";
    description = "Proceed southeast along the concourse to Br. Cody FSC Hall for the College of Nursing and medical simulation laboratories.";
  } else if (p.includes("engineering") || p.includes("science") || p.includes("robotics") || p.includes("lab")) {
    destinationId = "science-eng-bldg";
    description = "Follow the main walkway toward the Science & Engineering Complex near Hugh Wester Hall.";
  } else if (p.includes("chapel") || p.includes("mass") || p.includes("pray")) {
    destinationId = "university-chapel";
    description = "Head near Gate 2 towards the University Chapel for quiet prayer and daily mass.";
  } else if (p.includes("bookshop") || p.includes("supplies") || p.includes("merch")) {
    destinationId = "universal-bookshop";
    description = "Proceed towards Gate 1 to visit the Universal Bookshop for school supplies, books, and Lasallian merchandise.";
  }

  const originName = originId === "user-current-location" ? "your current user pointer location" : originId.replace(/-/g, " ");

  return {
    text: `From ${originName}, ${description} Your turn-by-turn route is now highlighted on the interactive campus map.`,
    destinationId,
    originId: originId || "user-current-location",
  };
}

// Gemini AI Campus Navigation API
app.post("/api/chat/navigate", async (req, res) => {
  const { prompt, currentOriginId = "user-current-location", history = [] } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'prompt' field." });
  }

  // Recommended standard models per @google/genai guidelines
  const candidateModels = [
    "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];

  // Instructions to the Ai
  const systemInstruction = `
You are the official AI Navigator for the University of St. La Salle (USLS) campus in Bacolod.
Your role is to guide students, faculty, and visitors around campus with friendly, concise, and helpful directions.

${CAMPUS_KNOWLEDGE}

Instructions:
1. Provide a warm, accurate, and concise answer (2 to 4 sentences).
2. If the user is asking where a place is, or asking for directions to a building/facility, identify the destination ID from the list above.
3. If they specified a starting point, identify the origin ID as well (otherwise default to origin "${currentOriginId}").
4. At the very end of your response, ALWAYS include a machine-readable JSON metadata block on a new line in this exact format:
<<<JSON{"destinationId": "building-id-or-null", "originId": "origin-id-or-null"}>>>

Example:
To get to the University Registrar, head towards St. Miguel Hall where Admissions and Registrar offices are located on the ground floor.
<<<JSON{"destinationId": "st-miguel", "originId": "user-current-location"}>>>
`;

  let rawReply = "";
  let modelUsed = "";
  let lastError: any = null;

  try {
    const ai = getGenAI();

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-6)) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: String(msg.content) }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    for (const modelName of candidateModels) {
      // Retry once if temporary 503/429 overload occurs
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.3,
            },
          });

          if (response?.text) {
            rawReply = response.text;
            modelUsed = modelName;
            break;
          }
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.statusCode || "";
          const msg = err?.message || String(err);
          console.warn(`[Gemini Navigation API] Attempt ${attempt + 1} with ${modelName} failed (${status}): ${msg}`);
          // Wait 600ms before retrying on rate limit or 503 overload
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 600));
          }
        }
      }

      if (rawReply) {
        break;
      }
    }
  } catch (err: any) {
    lastError = err;
    console.warn("[Gemini Navigation API] Client initialization or request failed:", err?.message || err);
  }

  // If Gemini succeeded, parse JSON block
  if (rawReply) {
    let destinationId: string | null = null;
    let originId: string | null = null;
    let cleanText = rawReply;

    const match = rawReply.match(/<<<JSON\s*({[\s\S]*?})\s*>>>/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        destinationId = parsed.destinationId || null;
        originId = parsed.originId || null;
      } catch (e) {
        console.warn("Failed to parse JSON metadata from Gemini response:", e);
      }
      cleanText = rawReply.replace(/<<<JSON[\s\S]*?>>>/, "").trim();
    }

    return res.json({
      text: cleanText,
      destinationId,
      originId: originId || currentOriginId,
      modelUsed,
      timestamp: new Date().toISOString(),
    });
  }

  // Graceful Fallback: If Gemini API had a transient 503 / network issue, return offline campus route
  console.info("[Gemini Navigation API] Serving intelligent campus fallback response.");
  const fallback = getCampusOfflineFallback(prompt, currentOriginId);

  return res.json({
    text: fallback.text,
    destinationId: fallback.destinationId,
    originId: fallback.originId,
    modelUsed: "campus-offline-engine (fallback)",
    timestamp: new Date().toISOString(),
  });
});

// Vite & Static Asset Handling
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`USLS Campus AI Navigator Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
