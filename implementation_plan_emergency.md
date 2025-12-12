# Implementation Plan: Emergency & Healthcare Locator System

## User Goal
Enable users to:
1.  Find the nearest ASHA healthcare service center.
2.  Find the nearest Government Hospital.
3.  Call for help immediately in case of emergency.

## Proposed Strategy

We will implement this in two key parts: an **Emergency SOS System** and a **Healthcare Locator Page**.

### Part 1: Emergency SOS System (Global Access)
An always-accessible "Panic Button" or "SOS" feature is critical for maternal health.

-   **Component**: `SOSButton` (Floating Action Button or Navbar item).
-   **Functionality**:
    -   One-tap dial for **102** (Ambulance) and **108** (Emergency).
    -   Optional: Ability to configure a personal emergency contact (Husband/Doctor).
    -   Puts the app in "Emergency Mode" (bright red UI, quick actions).

### Part 2: "Find Care" Locator Page
A dedicated page to visualize and contact nearby healthcare facilities.

#### UI Layout:
-   **Map View**: Interactive map showing User Location and nearby facilities (PHCs, Govt Hospitals).
-   **List View**: A card list of the nearest identified centers with:
    -   Name (e.g., "Community Health Center, Rampur")
    -   Distance (e.g., "1.2 km away")
    -   Action Buttons: **Call Now** and **Get Directions**.

#### Technical Implementation Options:

**Option A: Open Source / Free (Recommended for Prototype)**
-   **Map Provider**: `react-leaflet` with OpenStreetMap.
-   **Data Source**:
    -   Use browser's Geolocation API to get lat/long.
    -   Use "Overpass API" (OSM) to fetch real nearby hospitals.
    -   *Fallback*: Use "Deep Links" to open the user's native Google Maps app with a pre-filled search query (e.g., `https://maps.google.com/?q=govt+hospital+near+me`). This is the most reliable way to get up-to-date real-world data without maintaining a database.

**Option B: Google Maps Platform (Production Grade)**
-   **Map Provider**: `@react-google-maps/api`.
-   **Data Source**: Google Places API.
-   **Pros**: extremely accurate.
-   **Cons**: Requires an API Key and Credit Card setup (billing).

## Recommended Workflow (Option A)

 We will proceed with **Option A** to ensure the app works immediately without needing API keys.

1.  **Create `src/pages/FindCare.jsx`**:
    -   Request User Location.
    -   Display a Map using `react-leaflet`.
    -   Show a list of "Nearby Categories" (ASHA Center, Govt Hospital).
    -   Clicking a category opens the native Google Maps app with that search query (most reliable for finding actual ASHA centers).
    
2.  **Add `SOSButton`**:
    -   Add a floating red button on the dashboard/home.
    -   Clicking it opens a modal with big buttons: "Call Ambulance (102)", "Call Police (100)", "Call Emergency Contact".

3.  **Route Setup**:
    -   Add `/find-care` to `App.jsx`.
    -   Add link in Navbar.

## Code Structure Changes

1.  **Dependencies**: Install `leaflet` and `react-leaflet`.
2.  **New Components**:
    -   `components/SOSButton.jsx`
    -   `pages/FindCare.jsx`
3.  **Updates**:
    -   `App.jsx` (Routes)
    -   `components/Navbar.jsx` (Link)

## Next Steps
If you approve this plan, I will:
1.  Install the necessary map libraries.
2.  Create the SOS Button and "Find Care" page.
3.  Implement the logic to launch phone calls and map navigation.
