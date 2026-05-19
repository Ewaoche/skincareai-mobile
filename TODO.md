# TODO.md - SkincareAI Mobile App Planning

Mobile stack: Expo React Native, Expo Router, NativeWind, Zustand, React Query.

Status legend:

- `DONE`
- `UNDONE`
- `INPROGRESS`

## Design Direction

The mobile app should feel:

- premium
- soft
- trustworthy
- feminine-neutral
- calming
- clean like a luxury skincare brand
- futuristic without feeling clinical

Recommended default visual direction:

- palette: soft rose, peach cream, lavender mist, warm ivory, charcoal
- font: `Plus Jakarta Sans`
- UI style: glassmorphism with soft shadows
- motion: meaningful transitions and scanning animations using Reanimated
- navigation: floating bottom tab bar with blur or glass effect, rounded corners, animated active state

Recommended core palette:

- primary: `#E88CA8`
- secondary: `#F6D1C1`
- accent: `#C9B6FF`
- background: `#FFF9F7`
- surface: `#FFFFFF`
- text primary: `#1E1E1E`
- text secondary: `#7D7D7D`
- success: `#7ED6A5`

Hard design rules:

- avoid generic stock-photo aesthetics
- avoid flat default UI with weak hierarchy
- use large, elegant headings
- use rounded cards and buttons
- use warm gradients and subtle glow carefully
- keep the experience premium rather than noisy

## Current Reality Check

- [DONE] Authentication API integration is live against the backend
- [DONE] Session restore, token refresh, and logout flow are implemented
- [DONE] Consumer tab shell exists with Home, Analysis, History, and Profile routes
- [DONE] Onboarding, login, register, forgot-password, and reset-password screens are implemented
- [DONE] Subscription summary is wired into the Home screen
- [DONE] Mobile analysis capture, upload, result retrieval, and history retrieval are live against the backend
- [DONE] Analysis result and recommendation screens exist and are wired to the live backend
- [INPROGRESS] Consumer app screens after login are mostly placeholders rather than finished product flows
- [UNDONE] B2B mobile flow is not implemented yet

## Immediate Next Slice

- [INPROGRESS] Build the consumer analysis flow end-to-end on mobile
- [DONE] Add camera/photo picker entry into `POST /api/analysis/start`
- [INPROGRESS] Add analysis loading state and failure handling
- [DONE] Add analysis result screen using `selfieUrl`, `faceMapUrl`, and score payload
- [DONE] Add history list using `GET /api/analysis/history`
- [DONE] Add history detail screen using `GET /api/analysis/:id`
- [INPROGRESS] Render provider overlay masks cleanly on the analysis result screen

## Phase 1 - Mobile Project Foundation

- [DONE] Initialize the standalone mobile project with Expo Version ~54.0.32  inside `Mobile/`
- [DONE] Configure TypeScript
- [DONE] Configure Expo Router
- [DONE] Configure NativeWind
- [DONE] Configure app theme system
- [DONE] Configure global colors from the premium skincare palette
- [DONE] Configure typography around `Plus Jakarta Sans`
- [INPROGRESS] Configure spacing system
- [DONE] Configure reusable layout components
- [UNDONE] Add motion primitives and transition helpers for premium interactions
- [DONE] Define glassmorphism surface tokens, shadows, blur, and corner radius rules
- [DONE] Create `.env.example`
- [DONE] Prepare mobile README

## Phase 2 - API Client and State Management

- [DONE] Create Axios API client
- [DONE] Configure backend base URL
- [DONE] Add JWT bearer token interceptor
- [DONE] Add refresh token retry on 401
- [DONE] Create central `queryKeys` file
- [DONE] Configure React Query provider
- [DONE] Create Zustand auth store
- [UNDONE] Create Zustand user store
- [DONE] Create Zustand analysis store
- [DONE] Create Zustand subscription store
- [UNDONE] Create Zustand B2B client store
- [DONE] Add secure token storage
- [DONE] Add logout state cleanup

## Phase 3 - Authentication Screens

- [DONE] Create splash screen
- [DONE] Create onboarding screen 1
- [DONE] Create onboarding screen 2
- [DONE] Create onboarding screen 3
- [DONE] Add a cinematic onboarding art direction with AI scanning overlays and sliding visuals
- [DONE] Use large elegant onboarding typography with high whitespace
- [DONE] Create login screen
- [DONE] Create register screen
- [DONE] Create forgot password screen
- [DONE] Create reset password screen
- [INPROGRESS] Add form validation
- [DONE] Add loading states
- [DONE] Add error states
- [DONE] Add success states
- [INPROGRESS] Add role-based redirect after login
- [DONE] Redirect CONSUMER to consumer home
- [DONE] Keep ADMIN accounts out of the mobile app and reserve them for the admin web dashboard
- [DONE] Keep B2B roles out of the consumer mobile flow until the B2B dashboard exists
- [UNDONE] Redirect B2B users to B2B dashboard

## Phase 4 - Consumer Navigation

- [DONE] Create consumer tab layout
- [DONE] Use a floating bottom tab bar with rounded glass styling
- [DONE] Add Home tab
- [DONE] Add Analysis tab
- [UNDONE] Add Journal tab
- [DONE] Add History tab
- [DONE] Add Profile tab
- [DONE] Add protected route handling
- [DONE] Add loading screen while restoring session
- [INPROGRESS] Add animated active-tab state and premium transitions between tabs

## Phase 5 - Consumer Home

- [DONE] Create consumer home screen
- [DONE] Show welcome message
- [DONE] Show subscription plan
- [DONE] Show remaining analysis count
- [DONE] Show start analysis CTA
- [DONE] Show latest analysis summary
- [UNDONE] Show upgrade prompt when needed
- [UNDONE] Show skin journal shortcut
- [UNDONE] Show product recommendation shortcut
- [DONE] Use premium glass cards and optimistic, calming product language on the home screen

## Phase 6 - Selfie and Camera Flow

- [UNDONE] Create camera permission screen
- [UNDONE] Create selfie capture screen
- [DONE] Add image picker fallback for devices/users who do not want live camera capture
- [UNDONE] Add face oval guide overlay
- [UNDONE] Add elegant AI scanning overlays that feel cinematic rather than clinical
- [UNDONE] Add camera flip button
- [UNDONE] Add retake button
- [UNDONE] Add continue button
- [UNDONE] Add selfie preview screen
- [UNDONE] Validate image before upload
- [UNDONE] Handle camera permission denied state
- [UNDONE] Handle camera unavailable state

## Phase 7 - Analysis Loading Experience

- [DONE] Create analysis loading screen
- [UNDONE] Add scanning animation
- [DONE] Add progress indicator
- [DONE] Add friendly waiting messages
- [UNDONE] Add a premium AI-loading sequence with glow, pulse, and layered scanning motion
- [UNDONE] Add timeout handling
- [UNDONE] Add retry option on failure
- [DONE] Add success transition to result screen

## Phase 8 - Analysis Results

- [DONE] Create analysis result screen
- [DONE] Show selfie image
- [INPROGRESS] Show face map image
- [DONE] Show overall skin grade
- [DONE] Show acne score
- [DONE] Show pigmentation score
- [DONE] Show skin tone score
- [DONE] Show pores score
- [DONE] Show moisture score
- [DONE] Show oiliness score
- [DONE] Show wrinkles score
- [UNDONE] Add animated score bars
- [UNDONE] Design the results screen with premium skincare editorial styling, not dashboard clutter
- [UNDONE] Add explanation for each score
- [DONE] Add CTA to product recommendations
- [UNDONE] Add CTA to export PDF

## Phase 9 - Product Recommendations

- [DONE] Create recommendations screen
- [DONE] Show ranked product cards
- [DONE] Show product name
- [DONE] Show brand
- [DONE] Show product image
- [DONE] Show AI reasoning summary
- [DONE] Show target skin concern
- [DONE] Add Buy Now button
- [DONE] Open affiliate URL in external browser
- [DONE] Fall back to product URL if no affiliate URL
- [UNDONE] Create product detail screen
- [UNDONE] Show full ingredients
- [UNDONE] Show full AI reasoning
- [UNDONE] Present recommendation cards like premium beauty product storytelling, not commodity listings

## Phase 10 - Analysis History

- [DONE] Create analysis history screen
- [DONE] Show list of past analyses
- [DONE] Show analysis date
- [DONE] Show skin grade summary
- [UNDONE] Add pagination
- [DONE] Add pull-to-refresh
- [DONE] Add empty state
- [DONE] Add tap to view analysis detail

## Phase 11 - Before and After Comparison

- [UNDONE] Create before and after comparison screen
- [UNDONE] Allow user to select two analyses
- [UNDONE] Show side-by-side selfies
- [UNDONE] Show score differences
- [UNDONE] Show improvement indicators
- [UNDONE] Add before and after slider component
- [UNDONE] Add comparison summary

## Phase 12 - Skin Journal

- [UNDONE] Create skin journal list screen
- [UNDONE] Create add journal entry screen
- [UNDONE] Add text input
- [UNDONE] Add optional photo upload
- [UNDONE] Add mood selector
- [UNDONE] Add date selector
- [UNDONE] Show journal cards
- [UNDONE] Add journal detail screen
- [UNDONE] Add delete journal entry
- [UNDONE] Add empty state

## Phase 13 - PDF Export

- [UNDONE] Add PDF export button on analysis result screen
- [UNDONE] Add PDF generating state
- [UNDONE] Add PDF ready state
- [UNDONE] Add PDF open action
- [UNDONE] Add PDF error state
- [UNDONE] Show exported PDF history if available

## Phase 14 - Subscription Management

- [UNDONE] Create subscription screen
- [DONE] Create subscription screen
- [DONE] Show current plan
- [DONE] Show usage limit
- [DONE] Show analyses used
- [UNDONE] Show renewal date
- [DONE] Show upgrade options
- [UNDONE] Show cancel subscription option
- [DONE] Add upgrade CTA from home/profile

## Phase 14B - Billing Return Flow

- [DONE] Add deep-link success screen
- [DONE] Add deep-link cancel screen
- [DONE] Refetch subscription state after Stripe return

## Phase 15 - B2B Navigation

- [UNDONE] Create B2B dashboard layout
- [UNDONE] Add Dashboard tab
- [UNDONE] Add Clients tab
- [UNDONE] Add Analysis tab
- [UNDONE] Add Reports tab
- [UNDONE] Add Profile tab
- [UNDONE] Protect B2B routes
- [UNDONE] Prevent consumer access to B2B screens

## Phase 16 - B2B Dashboard

- [UNDONE] Create B2B dashboard screen
- [UNDONE] Show business name
- [UNDONE] Show subscription plan
- [UNDONE] Show monthly analysis usage
- [UNDONE] Show remaining analyses
- [UNDONE] Show total clients
- [UNDONE] Show quick action to add client
- [UNDONE] Show quick action to start analysis
- [UNDONE] Show recent client analyses

## Phase 17 - B2B Client Management

- [UNDONE] Create client list screen
- [UNDONE] Add client search
- [UNDONE] Add client filter
- [UNDONE] Create add client screen
- [UNDONE] Create edit client screen
- [UNDONE] Create client profile screen
- [UNDONE] Show client details
- [UNDONE] Show client notes
- [UNDONE] Show client analysis history
- [UNDONE] Add start analysis for selected client
- [UNDONE] Add delete client action

## Phase 18 - B2B Analysis Flow

- [UNDONE] Start analysis from client profile
- [UNDONE] Reuse selfie camera flow
- [UNDONE] Link analysis to selected client
- [UNDONE] Show client name on result screen
- [UNDONE] Show B2B PDF export option
- [UNDONE] Add professional notes input
- [UNDONE] Add before and after comparison per client

## Phase 19 - Profile and Settings

- [DONE] Create profile screen
- [DONE] Show user details
- [DONE] Show account role
- [UNDONE] Show subscription details
- [UNDONE] Add edit profile screen
- [UNDONE] Add change password screen
- [UNDONE] Add notification preferences
- [UNDONE] Add privacy policy link
- [UNDONE] Add terms link
- [DONE] Add logout button

## Phase 20 - Shared Components

- [DONE] Create Button component
- [DONE] Create Input component
- [DONE] Create Card component
- [UNDONE] Create Loading component
- [UNDONE] Create EmptyState component
- [UNDONE] Create ErrorState component
- [UNDONE] Create SkinScoreBar component
- [UNDONE] Create FaceMapOverlay component
- [UNDONE] Create ProductCard component
- [UNDONE] Create JournalEntryCard component
- [UNDONE] Create BeforeAfterSlider component
- [UNDONE] Create SubscriptionPlanCard component
- [DONE] Create reusable glass surface and gradient background components
- [UNDONE] Create reusable motion wrappers for fade, slide, stagger, and scan effects

## Phase 21 - Mobile QA

- [UNDONE] Test authentication flow
- [UNDONE] Test role-based routing
- [UNDONE] Test selfie capture on Android
- [UNDONE] Test selfie capture on iOS
- [UNDONE] Test analysis loading state
- [UNDONE] Test analysis results display
- [UNDONE] Test product recommendation links
- [UNDONE] Test B2B client flow
- [UNDONE] Test PDF export flow
- [UNDONE] Test offline and error states
- [UNDONE] Test app on tablet for B2B use
