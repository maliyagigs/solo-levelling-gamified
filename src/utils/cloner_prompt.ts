/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ANDROID_CLONE_PROMPT = `
# SYSTEM IDENTITY & COGNITIVE GOAL
You are a legendary Android Developer specializing in Kotlin, Jetpack Compose, Material Design 3, Room local database persistence, and native canvas-based physics micro-animations. Your objective is to clone and rewrite the "Monarch" Solo Leveling S-Rank self-improvement RPG system web application into an offline-first, highly responsive Android application, ready for USB Debugging deployment.

---

# ARCHITECTURE & TECHNOLOGY STANDARDS
1. **Target Platform:** Android SDK 26 (Android 8.0) to SDK 34 (Android 14)
2. **Language:** 100% Kotlin
3. **UI Engine:** Jetpack Compose (Modern Declarative Components)
4. **Navigation:** Compose Navigation with single-activity architecture (\`MainActivity\`)
5. **Database (Room Local persistence):** Automatically loads cached player profile state, inventory arrays, unlocked soldiers, active skills tree levels, and active quest completions across application restarts.
6. **Themes (Deep Dark Cosmic):** Custom, eye-safe midnight slate color palette with radiant neon cyan elevations and glowing active borders.
7. **Zero Assets Audio Synth Engine:** Custom native \`AudioTrack\` oscillator method to synthesize real-time sound frequencies (clicks, dagger slashes, level-ups, and void shadow rumbles) completely offline.

---

# WORKFLOW CHRONOLOGY (STEP-BY-STEP FLOW)

## PHASE 1: SEQUENTIAL ONE-BY-ONE QUESTIONING ONBOARDING (\`OnboardingScreen.kt\`)
The player must venture through the gate. Implement the onboarding experience strictly as a single-screen horizontal progression that asks the following questions one-by-one. Use premium Compose page transitions (fade-in, slide offset) to maintain high-impact gamification feedback.

- **STEP 0: COVER GATE SCREEN ("ʍօռǟʀƈɦ" UI)**
  * **Visuals:** Large pulsating golden/cyan Sovereign gate circle icon in center, title "ʍօռǟʀƈɦ", subtitle "Physical Ascension Protocol & Gate Challenge".
  * **Quote Box:** "Do you desire to break your limits? The System offers a path. Break away from your battered E-Rank shell and ascend as the Sovereign ruler of your own flesh."
  * **Button:** "Enter the Gate"
  * **Interaction:** Clicking triggers a dramatic warning popup modal:
    * *System Notification (Shield alert):* "You have inquired to be a player. Will you accept? We warn you: if you accept, your daily training limits will be monitored by the Monarch system. Extreme penalties govern active workout day evasions."
    * *Actions:* DECLINE (triggers Red Zone warning: "Are you sure you are ready to remain an E-rank forever?") or ACCEPT (launches the audio sweep sound and opens Step 1).

- **STEP 1: CHOOSE YOUR AVATAR PROFILE (GENDER)**
  * **Options:** "Male", "Female", "Other".
  * **Action:** Clicking locks choice, emits swipe sound, and moves to Step 2.

- **STEP 2: DEFINE YOUR SOVEREIGN QUEST (ASCENSION GOALS)**
  * **Options (Data model mapping):**
    1. "Physical Conditioning & Bodybuilding" (id: "build_muscle") - Gain power, size, muscle density and systemic strength.
    2. "Sovereign Shred & Fat Loss" (id: "loose_weight") - Burn calories, slice fat reserves, rise with speed and stamina.
    3. "Academic Excellence & Focus" (id: "academics_focus") - Conquer cognitive domains, focus pomodoro timers & exam prep.
    4. "Career Ascension & Coding Guild" (id: "career_focus") - Forge projects, build resume score, and lock recruiter offers.
    5. "All-Round Shadow Monarch Sovereign" (id: "all_round") - Achieve parity across all physical, mental, and professional gates.

- **STEP 3: SELECT YOUR COGNITIVE DOMAIN (ACADEMIC SUBJECT)**
  * **Options (Active directory lists):**
    * "Computer Science & Engineering" (id: "comp_sci") - Focuses on algorithms, system architectures & software engineering.
    * "Mathematics & Physical Sciences" (id: "math_physics") - Focuses on numerical formulas, structural logic & theoretical limits.
    * "Biological & Medical Sciences" (id: "bio_med") - Focuses on anatomy, physiological grids, biochemistry & cell pathing.
    * "Business, Finance & Economics" (id: "biz_finance") - Focuses on treasury assets, market algorithms & venture capital.
    * "Humanities & Social Sciences" (id: "humanities") - Focuses on historical context, cognitive languages & culture guilds.
    * "Other Technical Discipline" (id: "other") - Focuses on custom syllabus grids & tailored cognitive metrics.

- **STEP 4: DAILY POMODORO SCHEDULE**
  * **Options:**
    * "2 Pomodoro Sessions / Day" (50 mins total)
    * "4 Pomodoro Sessions / Day" (100 mins total)
    * "6 Pomodoro Sessions / Day" (150 mins total)
    * "8 Pomodoro Sessions / Day" (200 mins total)

- **STEP 5: TARGET PROFESSIONAL GUILD (CAREER GOAL)**
  * **Options:**
    * "Software Engineer / Web Generalist" (id: "software_eng")
    * "Data Scientist & AI Alchemist" (id: "data_scientist")
    * "Product Manager / Guild Knight" (id: "product_manager")
    * "Creative Designer / Archer" (id: "designer")
    * "Financial Analyst / Treasury Rogue" (id: "analyst")

- **STEP 6: DAILY CAREER DIRECTIVE**
  * **Options:**
    * "Leetcode & DSA Duels" (id: "leetcode") - Solve challenges on CS structures, queues, arrays.
    * "Portfolio & App Commits" (id: "portfolio") - Build functional interfaces & deploy services.
    * "Resumes & Recruiter Contacts" (id: "outreach") - Optimize profile score, reach recruiters, track job phases.
    * "Technical and Systems Reading" (id: "reading") - Study virtual memory, cache, and system papers.

- **STEP 7: BODYBUILDING TRAINING SPLIT**
  * **Options:**
    1. "Push-Pull-Legs Split" (id: "push_pull_legs") - Divide training by functional motion.
    2. "Classic Bro Split" (id: "bro_split") - Blitz one massive muscle per day with heavy sets.
    3. "Upper-Lower Action Splits" (id: "upper_lower") - Alternate entire upper body with lower extremities.
    4. "Full-Body Strength Conditioning" (id: "full_body") - Addressing every joint & muscle chain each session.

- **STEP 8: METABOLIC & NUTRITION APPROACH**
  * **Options:**
    * "Aggressive Muscle Bulking" (id: "bulk") - Caloric surplus & high amino acid density.
    * "Sovereign Shred & Fat Slice" (id: "cut") - Maintain strength while forcing cardiorespiratory shred in deficit.
    * "Metamorphosis Recomp" (id: "recomp") - Shed visceral fat slowly while rebuilding myofibrils.

- **STEP 9: INITIAL WARRIOR RANK (FITNESS CAPACITY)**
  * **Options:**
    * "BEGINNER (E-Rank)" - Brand new to combat conditioning. Bandages ready.
    * "INTERMEDIATE (C-Rank)" - Familiar with lift patterns and gate environments.
    * "ADVANCED (S-Rank equivalent)" - Highly conditioned warrior seeking cosmic evolution.

- **STEP 10: DAILY ACTIVITY SCAN**
  * **Options:** "Sedentary" (Little to no activity), "Light Active" (Active 1-3 days), "Moderately Active" (Active 4-6 days), "Very Active" (Heavy gym loading).

- **STEP 11: CHRONO ROTATION INDEX (AGE SELECTOR)**
  * **UI:** horizontal scrolling picker or interactive wheel, displaying ages 12 to 90. Supports custom confirmed info.

- **STEP 12: VERTICAL ANATOMICAL SPAN (HEIGHT SELECTOR)**
  * **UI:** Smooth toggler to select IMPERIAL (Feet/Inches) or METRIC (Centimeters). Integrates increment + / - counters with numeric text updates.

- **STEP 13: CURRENT GRAVITATIONAL LOAD (CURRENT WEIGHT SELECTOR)**
  * **UI:** Imperial (LBS) or Metric (KG) selector switch, matching large value adjusters with visual markers.

- **STEP 14: TARGET AWAKENING MASS (TARGET WEIGHT SELECTOR)**
  * **UI:** Calibrates scale surplus or deficit targets based on selected approach.

- **STEP 15: ANATOMICAL LIMITATION SCANS (HEALTH ISSUES)**
  * **UI:** Optional text area allowing inputting injury recovery notes, heart conditions, or joints limitations.

- **STEP 16: ARMAMENT DEPOSITARY (EQUIPMENT ACCESS)**
  * **UI:** Multiple select grids showing: Dumbbells, Barbell & Plates, Resistance Bands, Commercial Gym Access, Kettlebells, Pull-up Bar. Alternatively, a button for "Bodyweight Only (None)".

- **STEP 17: WEEKLY GAME CLOSURES (WORKOUT FREQUENCY)**
  * **UI:** Premium sliders to select workout days per week ranging from 1 to 7.

- **STEP 18: CHOOSE ACTIVE SYSTEM DAYS**
  * **UI:** Day indicators (Mon, Tue, Wed, Thu, Fri, Sat, Sun) as circular toggle buttons, allowing player to map active gym schedules.
  * **Add-on:** "System Reminder Pings" toggler layout (uses Android system alarm triggers to warn players about skipped active workout slots).

---

## PHASE 2: S-RANK GENERATION SUMMARY (\`PlanPreviewScreen.kt\`)
Once the final questionnaire step is confirmed, execute the exact **Metabolic & Training Formulation Formulas**:
1. Convert Imperial values to metrics: $Weight_{kg} = Weight_{lbs} \times 0.453592$
2. **Formula Calculations:**
   * **If Goal is "build_muscle":**
     - $Calories = Weight_{kg} \times 33 + 400$
     - $Protein = Weight_{kg} \times 2.2 \text{ grams}$
     - $Fats = (Calories \times 0.25) / 9 \text{ grams}$
     - $Carbs = (Calories - (Protein \times 4 + Fats \times 9)) / 4 \text{ grams}$
     - $Water = 4.0 \text{ Liters}$, $WorkoutDuration = 60 \text{ mins}$, $RestDuration = 90 \text{ mins}$.
     - *Recipes template:* Double Egg Oatmeal (Breakfast), Sirloin Beef Roast (Lunch), Grilled Chicken Breast (Postworkout), Greek Yogurt (Pre-sleep).
   * **If Goal is "loose_weight":**
     - $Calories = Weight_{kg} \times 24 - 300$
     - $Protein = Weight_{kg} \times 2.0 \text{ grams}$
     - $Fats = (Calories \times 0.22) / 9 \text{ grams}$
     - $Carbs = (Calories - (Protein \times 4 + Fats \times 9)) / 4 \text{ grams}$
     - $Water = 3.5 \text{ Liters}$, $WorkoutDuration = 45 \text{ mins}$, $RestDuration = 45 \text{ mins}$.
     - *Recipes template:* Egg White Scramble (Breakfast), Organic Salad with Olive Oil (Lunch), Baked Salmon Fillet (Dinner), High Protein Berries (Snack).
   * **If Goal is "look_better":**
     - $Calories = Weight_{kg} \times 28$
     - $Protein = Weight_{kg} \times 1.8 \text{ grams}$
     - $Fats = (Calories \times 0.25) / 9 \text{ grams}$
     - $Carbs = (Calories - (Protein \times 4 + Fats \times 9)) / 4 \text{ grams}$
     - $Water = 3.2 \text{ Liters}$, $WorkoutDuration = 50 \text{ mins}$, $RestDuration = 60 \text{ mins}$.
     *Recipes:* Tomato Omelet (Breakfast), Atlantic Cod Fillet (Lunch), Tender Sirloin Steak (Dinner), Chia Pudding (Snack).
   * **Else (Stay in Shape):**
     - $Calories = Weight_{kg} \times 28$
     - $Protein = Weight_{kg} \times 1.6 \text{ grams}$
     - $Fats = (Calories \times 0.28) / 9 \text{ grams}$
     - $Carbs = (Calories - (Protein \times 4 + Fats \times 9)) / 4 \text{ grams}$
     - $Water = 3.0 \text{ Liters}$, $WorkoutDuration = 40 \text{ mins}$, $RestDuration = 60 \text{ mins}$.
     *Recipes:* Greek Yogurt (Breakfast), Chicken Avocado Salad (Lunch), Classic Chicken Asparagus (Dinner).

Display these targets dynamically inside a breathtaking parchment outline with custom neon borders, before directing players to the Core RPG Game dashboard.

---

## PHASE 3: THE S-RANK GAME MODULES (\`RpgDashboardScreen.kt\`)

### 1. NAVIGATION TAB BAR
Design a slick persistent bottom-navigation or rail header with high-contrast active icons:
- **STATUS:** Attributes, Allocated stats metrics, current Level, EXPs, and custom calibrated Macros.
- **QUESTS:** Comprehensive day training check-off lists.
- **GATES:** Double Dungeon combat trials against S-rank gods.
- **SHADOWS:** Shadow Extraction rumbles (ARISE phrase summon).
- **SKILLS:** Custom active ability tree unlocking grid.
- **BACKPACK:** Armed inventory items inspection grid and trading counters.
- **LIFE FORGE:** Pomodoro focal circle, Bodybuilding split lists, Meals checklist, and Career applications recruiter tracker.

### 2. STATS & ATTRIBUTES SYSTEM (STATUS TAB)
- Displays current stats: Strength, Agility, Vitality, Intelligence, Perception.
- Shows dynamic Level progress bar fueled by XP and Levels triggers. When leveling up, allocate +5 unspent points voluntarily across attributes! No level limits.
- Features complete physical representation card detailing calculated metabolic constants (Proteins, Carbs, Fats, and daily Liters).

### 3. ACTIVE TRAINING TRIGGERS (QUESTS TAB)
- Generates dynamic daily checklists based on user profile selections.
* **Daily physicals logs:** Push-ups (0/100), Squats (0/100), Running (0/10 km), Hydration level tracker (drinks 1L additions up to daily Liters goals).
* **Intellectual log check:** Complete assigned Pomodoro study sessions.
* **Career prep check:** Solve algorithmic puzzles or submit portfolio commits.
- Completing quests plays the synthesised "loot sound", adds Gold and XP. If XP exceeds maximum limit ($MaxXP = MaxXP \times 1.4$), increment Level and trigger a glorious visual "LEVEL UP!" splash screen overlays!

### 4. TURN COMBAT DUNGEONS (GATES TAB)
- Standardize a text/graphics dungeon raid sequence against iconic bosses (E-rank Statue of God to S-rank Antares Sovereign of Destruction).
- Boss stats: HP, Attack, Level gates requirements, and XP/Gold ratios.
- Combat cycle consists of turn-based actions: Player can "Strike" (decreases Boss HP by $Strength \times WeaponModifier$), "Skill Cast" (expends Mana to trigger elemental spell cuts), "Summon Shadows" (brings selected active soldiers into context to multiply damage), or "Flee" (escapes with slight penalty).
- Battle logs print interactive action sequences. Winning the raid rolls a random loot outcome: grants actual weapon drops based on boss-fight drops chance!

### 5. SHADOW EXTRACTION ORCHESTRATOR (SHADOWS TAB)
- Unlocks the legendary Shadow Soldiers based on global progress and Gold balances: Shadow Infantry, Wolves, Commander Igris, Tanker Iron, Marshal Beru, Grand Marshal Bellion, or the Ultimate Legion.
- Add an interactive button labeled "ARISE" (or audio listener command). Holding/pressing it triggers a low-frequency rumbling synthesised oscillator sweep that shakes the UI, playing custom shadow summon glows!

### 6. ARMAMENT MATRICES (BACKPACK TAB)
- View acquired swords and daggers: Rusty goblins knife (E-Rank), Kasaka venom blade (C-Rank), Knight's Crimson Longsword (B-Rank), Demon Soul Piercer (A-Rank), Kamaish Dragon Fang Dagger (S-Rank), and the Sovereign's Wrath Cosmic Blades.
- Inspecting items displays full detailed dialogue models: Weapon lore story, passive poison modifiers, weight, speed statistics, and scaling modifiers.
- Equip button increases player’s Strength, Agility, or Agility statistics.

### 7. LIFE FORGE (PRODUCTIVITY & FOCUS TAB)
- **Study Mode Circles (Pomodoro):** Fully functional countdown visualizer (25-minute timer, ticks down in real-time, displays minutes/seconds, triggers finish alarm synthesized chime that automatically checks off study targets).
- **Workout Split Log:** Renders active exercises (bench press, squats, lat pulldowns) containing input fields to enter weight and sets logs.
- **Recruiter Prep Pipeline:** Interactive vertical board detailing jobs screening phases (Applied -> Coding Assessment -> Interview -> Offer/Rejection) allowing dragging or click-to-move items across columns.

---

# ZERO-ASSETS NATIVE COGNITIVE synthesizer
Use standard Kotlin \`AudioTrack\` structures inside your UI layer or specialized controller helper. Design a single lightweight object that structures soundscapes completely offline dynamically using mathematical sine wave formulas:

\`\`\`kotlin
package com.monarch.fitness.util

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import kotlin.math.sin
import kotlin.math.roundToInt

object AudioEngine {
    private const val SAMPLE_RATE = 44100

    fun playTone(
        startFreq: Float,
        endFreq: Float,
        durationMs: Int,
        isNoise: Boolean = false
    ) {
        Thread {
            val numSamples = (durationMs / 1000.0 * SAMPLE_RATE).roundToInt()
            val sample = FloatArray(numSamples)
            val buffer = ShortArray(numSamples)

            for (i in 0 until numSamples) {
                val t = i.toFloat() / SAMPLE_RATE
                val progress = i.toFloat() / numSamples
                
                // Sweep progression
                val currentFreq = startFreq + (endFreq - startFreq) * progress
                
                val value = if (isNoise) {
                    (Math.random() * 2.0 - 1.0).toFloat()
                } else {
                    sin(2.0 * Math.PI * currentFreq * t).toFloat()
                }

                // Smooth fade envelope
                val envelope = when {
                    progress < 0.1f -> progress / 0.1f
                    progress > 0.8f -> (1.0f - progress) / 0.2f
                    else -> 1.0f
                }
                sample[i] = value * envelope
                buffer[i] = (sample[i] * 32767).roundToInt().toShort()
            }

            val audioTrack = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_GAME)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(SAMPLE_RATE)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(buffer.size * 2)
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build()

            try {
                audioTrack.write(buffer, 0, buffer.size)
                audioTrack.play()
                Thread.sleep(durationMs.toLong())
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                audioTrack.release()
            }
        }.start()
    }

    fun playSelect() = playTone(880f, 1320f, 120)       // Cyber chime click
    fun playSwipe() = playTone(1500f, 200f, 250, true)  // Slash blade effect
    fun playLevelUp() = playTone(440f, 1200f, 600)      // S-Rank level up harmonic
    fun playArise() = playTone(120f, 40f, 800)          // Low dimensional command rumble
    fun playLoot() = playTone(783.99f, 1174.66f, 300)   // Magic coin shine sound
    fun playHurt() = playTone(250f, 100f, 400)          // Physical damage deep chime
}
\`\`\`

---

# ACTION PROMPT FOR CORE JETPACK COMPOSE REWRITE
"Extract the full sequential workflow, step-by-step questionnaire details, calculated metabolic formulas, catalog data, turn-based battle stages, local databases structures, and dynamic synth oscillators described in this specification sheet. Convert them into fully native, modular Android code modules using Jetpack Compose, Compose Navigation, and Room Data Access. The final result must be high-fidelity, completely ready to compile in Android Studio, and deploy to a phone using USB Debugging, with zero external files or custom graphic dependencies!"
`;
