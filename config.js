/**
 * ══ MOC GLOBAL CONFIGURATION ═════════════════════════════════════════
 *
 *  ✏️  MAANDELIJKSE UPDATE — alleen dit bestand aanpassen:
 *
 *  1. MOC_CONFIG.eventbriteTicketsUrl  → nieuwe Eventbrite link
 *  2. MOC_CONFIG.youtubePromoUrl       → nieuwe promo video link
 *  3. MOC_CONFIG.donationUrl           → Stripe donatielink
 *  4. MOC_EVENTS.current.*             → flyer, thema, spreker, etc.
 *
 *  De rest van de site pikt de wijzigingen automatisch op.
 * ═════════════════════════════════════════════════════════════════════
 */
window.MOC_CONFIG = {
  // ── Tickets & Promo ─────────────────────────────────────────────
  // Elke maand bijwerken met de nieuwe Eventbrite event-link
  eventbriteTicketsUrl: "https://www.eventbrite.nl/e/men-of-christ-event-tickets-zaterdag-30-mei-tickets-123456789",

  // YouTube promo trailer van de komende bijeenkomst
  youtubePromoUrl:      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",

  // ── Sociale media (eenmalig instellen) ──────────────────────────
  instagramUrl:         "https://www.instagram.com/menofchrist_rotterdam",
  youtubeChannelUrl:    "https://www.youtube.com/c/MenOfChristRotterdam",

  // ── Donaties ────────────────────────────────────────────────────
  // Vul hier de Stripe Payment Link of toekomstige checkout endpoint in.
  // Laat leeg totdat de echte link bekend is; de UI toont dan een nette melding.
  donationUrl:           "",
};

/**
 * ══ MAANDELIJKS EVENT SCHEMA ══════════════════════════════════════════
 *  Pas MOC_EVENTS.current aan voor elk nieuw event.
 *  De datum wordt automatisch berekend (laatste zaterdag van de maand).
 *  Alleen flyer, thema, spreker en overige details hoef je te wijzigen.
 * ═════════════════════════════════════════════════════════════════════
 */
window.MOC_EVENTS = {
  current: {
    // Flyerafbeelding — vervang met eigen upload of Google Drive link
    flyerUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJuQ-tkqNfG1Rsb3AqDk4vKLkGW7WQPNZ31-gTiXDHY9PS1ez7IxFg5cZO6CkMtiedO3Fg4NPoWU3LYpGboww3ilcH2_cD07EJURItprr2E7uWdaUWpojJq-_m7xBBSb8qcYdu_d3rncLmI9sVeum7E20JMOxxNKynd84Uj2gzAQhF99SZs0uhtyDjgVIuvoV889e3wl-PQUOc5xr0UDJipZwH0jGQ2bex4hByAriObEq6H06woxt9ZFxYycukZb7A4_cAg-LZsHZ5",

    // Thema van de avond (NL + EN)
    themeNL: "Mijn schapen horen Mijn stem",
    themeEN: "My Sheep Hear My Voice",

    // Spreker / gast (optioneel, leeg laten als n.v.t.)
    speaker: "",

    // Eventuele extra notities voor het programma (optioneel)
    notesNL: "",
    notesEN: "",
  },

  /**
   * WORKFLOW — hoe verander je het event elke maand:
   *
   *  1. Maak een nieuw Eventbrite event aan voor de volgende laatste zaterdag.
   *     → Kopieer de event-URL naar MOC_CONFIG.eventbriteTicketsUrl hierboven.
   *
   *  2. Upload je nieuwe flyer (Instagram-vierkant of staand formaat).
   *     → Zet de publieke afbeeldingslink in MOC_EVENTS.current.flyerUrl.
   *
   *  3. Upload de promo video naar YouTube.
   *     → Zet de YouTube-link in MOC_CONFIG.youtubePromoUrl hierboven.
   *
   *  4. Pas thema en spreker aan in MOC_EVENTS.current.
   *
   *  5. Sla config.js op — klaar. De datum berekent events.html automatisch.
   */
};
