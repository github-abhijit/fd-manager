## Technical Specification: Fixed Deposit (FD) Manager Web App## 1. Core Directive
Build a secure, mobile-friendly single-page Fixed Deposit (FD) tracking dashboard that aggregates, manages, and tracks maturity schedules for multiple FDs across different banks. The app must calculate accurate maturity profiles, handle principal-only renewals, and restrict access using secure user authentication.
## 2. Tech Stack Boundaries

* Frontend: React with TypeScript, Tailwind CSS (Mobile-First architecture), and Lucide React Icons.
* Backend/Database: Firebase Suite (Firestore Database).
* Authentication: Firebase Authentication with Google Sign-In provider.
* Hosting: Firebase Hosting or Vercel.

## 3. Data Models## Bank Entity

interface Bank {
  id: string;        // Unique identifier
  userId: string;    // Owner's Firebase UID
  name: string;      // Name of the bank (e.g., "HDFC Bank")
  createdAt: string; // ISO Timestamp
}

## Fixed Deposit Entity

interface FixedDeposit {
  id: string;
  userId: string;
  bankId: string;         // Foreign key matching Bank.id
  accountNumber: string;  // Optional/Partial masking
  holderName: string;     // Name on the FD
  principalAmount: number;// Initial deposit amount
  interestRate: number;   // Annual percentage rate (e.g., 7.1)
  startDate: string;      // YYYY-MM-DD
  maturityDate: string;   // YYYY-MM-DD
  status: 'ACTIVE' | 'MATURED' | 'CLOSED';
  notes?: string;
  updatedAt: string;
}

------------------------------
## 4. Mobile & Responsive Layout Requirements
To prevent cluttered spreadsheets on smaller screens, the layout must follow these adaptive rules:

* The "Card-Stack" Fallback: On screens smaller than 768px (mobile/tablet), wide tables must instantly break down into distinct, vertical "FD Cards". Each card must clearly present the Bank Name, Principal, Maturity Date, and a quick-action drawer.
* Touch-Friendly Targets: Interactive elements, buttons, and form selectors must have a minimum touch-target size of 44x44 pixels with ample spacing to avoid accidental misclicks.
* Bottom-Sheet Forms: For a native mobile experience, the Add Bank, Add FD, and Renewal modals should slide up as full-screen or bottom-sheet overlays on mobile, while remaining traditional pop-up modals on desktop.
* Fixed Action Action Button (FAB): On mobile views, display a floating + button in the bottom right corner for instant access to add new items without scrolling back to the top.

------------------------------
## 5. Functional Requirements & User Flows## Step 1: Authentication Gate

* Flow: A clean landing page optimized for mobile screens featuring a prominent, single-tap "Sign in with Google" button.
* Constraint: Block all dashboard routes if the user session is invalid. Redirect unauthenticated users back to the landing page instantly.

## Step 2: Main Dashboard View
Provide a scannable financial overview split into three functional sections:

* Global Metrics Grid: Total active investment amount, aggregate estimated interest earnings, and a count of active FDs. (Arranged in a single-column layout on mobile, expanding to a 3-column row on desktop).
* Maturity Alert Banner: A prioritized list showing all FDs maturing within the next 30 days. Display the Bank Name, Maturity Date, and Maturity Amount clearly.
* Global Action Row: Prominent buttons to trigger creation modals: [+ Add New Bank] and [+ Add New FD].

## Step 3: Bank Management

* Action: [+ Add New Bank] opens a clean, simple input overlay.
* Input: Text field for "Bank Name".
* Validation: Unique name check per user; prevent duplicate banks. Save to the Banks collection.

## Step 4: FD Management (CRUD Operations)
Display data filtered by Bank and Status. Include easy-access buttons for the following workflows:

[Mobile Card Stack / Desktop Table] 
 └── Action: Add New Entry ────> (Form: Bank, Holder, Principal, Rate, Dates)
 └── Action: Edit Entry ───────> (Form: Modifies all original metadata fields)
 └── Action: Close Entry ──────> (Status updates to CLOSED; historical logs only)
 └── Action: Renew Entry ──────> (Wizard: Pre-calculates Principal-only roll forward)


* Add Entry: Dropdown selector populated from the Banks collection, plus fields for Holder Name, Principal Amount, Interest Rate (%), Start Date, and Maturity Date. Dates must use native mobile browser date-pickers.
* Edit Entry: Overlay populating all existing fields to correct data typos.
* Close Entry: A single-click archive safety switch with a mobile confirmation prompt. It marks the status as CLOSED and removes it from the main active portfolio view without hard-deleting database history.

## Step 5: "Principal-Only" Renewal Wizard

* Flow: Tapping [Renew] on an active/matured FD opens a focused quick-action layout.
* Business Logic: The system assumes the user withdraws the generated interest. The wizard defaults the new principal amount to the original principal amount of the expiring FD.
* User Input: User enters the New Start Date and New Maturity Date. User can optionally overwrite the Interest Rate if bank rates have changed.
* Execution: On submit, the agent must update the old FD status to MATURED/CLOSED and automatically spawn a new FD entry containing the rolled-over principal and fresh tracking dates.

------------------------------
## 6. Non-Functional Requirements & Security

* Multi-Tenancy Isolation: Every Firestore query must filter explicitly by the logged-in user's UID (where("userId", "==", currentUser.uid)). Users must never see each other's banks or financial logs.
* Date Calculations: Frontend components must treat date strings strictly using UTC or uniform local boundaries to avoid timezone shifts rendering different maturity dates.

------------------------------
## Ready to hand off?
Before you feed this to the agent, let me know:

* Do you want the app to be installable like a native app on your phone's home screen using Progressive Web App (PWA) capabilities?
* Should we add a quick search/filter bar at the top of the mobile screen to find specific FDs by holder name or bank instantly?
* Do you need automatic currency formatting configured specifically for your region (e.g., ₹ Lakhs/Crores for India or $ Millions for US)?


