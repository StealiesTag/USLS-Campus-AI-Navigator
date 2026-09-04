# Gemini Reflection & Journal Assistant

A secure, user-authenticated journaling and reflection web application built with **Google Gemini 3.6 Flash**, **Cloud Firestore**, and **Firebase Authentication (Google Sign-In)**.

---

## Architecture Overview

```
[ Client (React + Tailwind) ]
         │
         ├─── Firebase Authentication (Google Federated Sign-In)
         │
         ├─── Cloud Firestore (Owner-Bound Rules: /users/{userId}/interactions/{id})
         │
         └─── Express API Server (Node.js / Cloud Run)
                     │
                     └─── Google Gemini 3.6 Flash (Resilient 4-tier Fallback Ladder)
```
Cartesian Plane Coordinate System used for geolocation on the SVG Map
Dijkstra's Algorithm to calculate routes
---

## 1. Environment & Prerequisites

Ensure the following Google Cloud APIs are enabled in your project:

```bash
# Enable required Google Cloud Services
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

---

## 2. Secret Management Setup (Zero Hardcoding)

Store the `GEMINI_API_KEY` securely in **Google Cloud Secret Manager** and grant access to the Cloud Run runtime service account:

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant the default Cloud Run compute service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```
So your api key is safe.
---

## 3. Database Security Configuration (Cloud Firestore)

Deploy secure, owner-bound Firestore security rules ensuring strict user data isolation:

### `firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy the rules via the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Cloud Run Deployment Flow

Build and deploy the containerized full-stack application directly to Google Cloud Run:

```bash
# Deploy to Google Cloud Run with Secret Manager environment injection
gcloud run deploy gemini-journal-assistant \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port 3000
```

---

## 5. Required Campaign Labeling

Apply the mandatory challenge verification label to your Cloud Run service:

```bash
gcloud run services update gemini-journal-assistant \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```
For the ideathon challenge.
---

## 6. Functional QA Walkthrough

| Interaction | Expected Result |
| :--- | :--- |
| **Google Sign-In** | Authenticates without custom password forms; establishes isolated session. |
| **Journaling / Reflection** | Dispatches to Gemini 3.6 Flash fallback ladder; renders structured Markdown. |
| **Firestore Persistence** | Strips `undefined` values; persists to `/users/{userId}/interactions/{id}`. |
| **Executive Synthesis** | Auto-generates high-density summaries and action items. |
| **History & Export** | Real-time synchronization; searchable; one-click Markdown download. |


Alrighty, thanks for viewing the project!