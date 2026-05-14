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
- [UNDONE] Create Zustand analysis store
- [DONE] Create Zustand subscription store
- [UNDONE] Create Zustand B2B client store
- [DONE] Add secure token storage
- [DONE] Add logout state cleanup

## Phase 3 - Authentication Screens

- [DONE] Create splash screen
- [DONE] Create onboarding screen 1
- [DONE] Create onboarding screen 2
- [DONE] Create onboarding screen 3
- [INPROGRESS] Add a cinematic onboarding art direction with AI scanning overlays and floating UI layers
- [DONE] Use large elegant onboarding typography with high whitespace
- [DONE] Create login screen
- [DONE] Create register screen
- [DONE] Create forgot password screen
- [DONE] Create reset password screen
- [UNDONE] Add form validation
- [DONE] Add loading states
- [DONE] Add error states
- [DONE] Add success states
- [INPROGRESS] Add role-based redirect after login
- [DONE] Redirect CONSUMER to consumer home
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
- [UNDONE] Show welcome message
- [DONE] Show subscription plan
- [DONE] Show remaining analysis count
- [DONE] Show start analysis CTA
- [UNDONE] Show latest analysis summary
- [UNDONE] Show upgrade prompt when needed
- [UNDONE] Show skin journal shortcut
- [UNDONE] Show product recommendation shortcut
- [DONE] Use premium glass cards and optimistic, calming product language on the home screen

## Phase 6 - Selfie and Camera Flow

- [UNDONE] Create camera permission screen
- [UNDONE] Create selfie capture screen
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

- [UNDONE] Create analysis loading screen
- [UNDONE] Add scanning animation
- [UNDONE] Add progress indicator
- [UNDONE] Add friendly waiting messages
- [UNDONE] Add a premium AI-loading sequence with glow, pulse, and layered scanning motion
- [UNDONE] Add timeout handling
- [UNDONE] Add retry option on failure
- [UNDONE] Add success transition to result screen

## Phase 8 - Analysis Results

- [UNDONE] Create analysis result screen
- [UNDONE] Show selfie image
- [UNDONE] Show face map image
- [UNDONE] Show overall skin grade
- [UNDONE] Show acne score
- [UNDONE] Show pigmentation score
- [UNDONE] Show skin tone score
- [UNDONE] Show pores score
- [UNDONE] Show moisture score
- [UNDONE] Show oiliness score
- [UNDONE] Show wrinkles score
- [UNDONE] Add animated score bars
- [UNDONE] Design the results screen with premium skincare editorial styling, not dashboard clutter
- [UNDONE] Add explanation for each score
- [UNDONE] Add CTA to product recommendations
- [UNDONE] Add CTA to export PDF

## Phase 9 - Product Recommendations

- [UNDONE] Create recommendations screen
- [UNDONE] Show ranked product cards
- [UNDONE] Show product name
- [UNDONE] Show brand
- [UNDONE] Show product image
- [UNDONE] Show AI reasoning summary
- [UNDONE] Show target skin concern
- [UNDONE] Add Buy Now button
- [UNDONE] Open affiliate URL in external browser
- [UNDONE] Fall back to product URL if no affiliate URL
- [UNDONE] Create product detail screen
- [UNDONE] Show full ingredients
- [UNDONE] Show full AI reasoning
- [UNDONE] Present recommendation cards like premium beauty product storytelling, not commodity listings

## Phase 10 - Analysis History

- [UNDONE] Create analysis history screen
- [UNDONE] Show list of past analyses
- [UNDONE] Show analysis date
- [UNDONE] Show skin grade summary
- [UNDONE] Add pagination
- [UNDONE] Add pull-to-refresh
- [UNDONE] Add empty state
- [UNDONE] Add tap to view analysis detail

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
- [UNDONE] Show current plan
- [UNDONE] Show usage limit
- [UNDONE] Show analyses used
- [UNDONE] Show renewal date
- [UNDONE] Show upgrade options
- [UNDONE] Show cancel subscription option
- [UNDONE] Add upgrade CTA from analysis limit screen

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

- [UNDONE] Create profile screen
- [UNDONE] Show user details
- [UNDONE] Show account role
- [UNDONE] Show subscription details
- [UNDONE] Add edit profile screen
- [UNDONE] Add change password screen
- [UNDONE] Add notification preferences
- [UNDONE] Add privacy policy link
- [UNDONE] Add terms link
- [UNDONE] Add logout button

## Phase 20 - Shared Components

- [UNDONE] Create Button component
- [UNDONE] Create Input component
- [UNDONE] Create Card component
- [UNDONE] Create Loading component
- [UNDONE] Create EmptyState component
- [UNDONE] Create ErrorState component
- [UNDONE] Create SkinScoreBar component
- [UNDONE] Create FaceMapOverlay component
- [UNDONE] Create ProductCard component
- [UNDONE] Create JournalEntryCard component
- [UNDONE] Create BeforeAfterSlider component
- [UNDONE] Create SubscriptionPlanCard component
- [UNDONE] Create reusable glass surface and gradient background components
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
