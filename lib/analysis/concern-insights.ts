import { AppLanguage } from '@/lib/i18n/types';

export function buildConcernInsight(
  concern: string,
  score: number | null,
  language: AppLanguage,
): string {
  const scoreText =
    score === null
      ? language === 'el'
        ? 'Αυτή η ανησυχία επισημάνθηκε στην ανάλυσή σας.'
        : 'This concern was highlighted in your analysis.'
      : language === 'el'
        ? `Αυτή η περιοχή βαθμολογήθηκε με ${score}.`
        : `This area scored ${score}.`;

  switch (concern) {
    case 'acne':
      return language === 'el'
        ? `${scoreText} Η επισημασμένη περιοχή δείχνει πού η δραστηριότητα ακμής είναι πιο ορατή.`
        : `${scoreText} The highlighted area shows where breakout activity is most visible.`;
    case 'age_spot':
      return language === 'el'
        ? `${scoreText} Η επισημασμένη περιοχή δείχνει πού ο αποχρωματισμός και ο ανομοιόμορφος τόνος είναι πιο ορατά.`
        : `${scoreText} The highlighted area shows where discoloration and uneven tone are most visible.`;
    case 'pore':
      return language === 'el'
        ? `${scoreText} Η επισημασμένη περιοχή δείχνει πού οι ορατοί πόροι είναι πιο έντονοι.`
        : `${scoreText} The highlighted area shows where visible pores are more noticeable.`;
    case 'oiliness':
      return language === 'el'
        ? `${scoreText} Η επισημασμένη περιοχή δείχνει πού η περίσσεια λιπαρότητας μπορεί να επηρεάζει την ισορροπία και την υφή του δέρματος.`
        : `${scoreText} The highlighted area shows where excess oil may be affecting skin balance and texture.`;
    case 'wrinkle':
      return language === 'el'
        ? `${scoreText} Η επισημασμένη περιοχή δείχνει πού οι λεπτές γραμμές και οι ρυτίδες είναι πιο ορατές.`
        : `${scoreText} The highlighted area shows where fine lines and wrinkles are most visible.`;
    case 'moisture':
      return language === 'el'
        ? `${scoreText} Η επισημασμένη περιοχή δείχνει πού η ξηρότητα ή η αφυδάτωση είναι πιο ορατές.`
        : `${scoreText} The highlighted area shows where dryness or dehydration is most visible.`;
    case 'radiance':
      return language === 'el'
        ? `${scoreText} Η επισημασμένη περιοχή δείχνει πού ο τόνος και η λάμψη φαίνονται λιγότερο ομοιόμορφα.`
        : `${scoreText} The highlighted area shows where tone and radiance look less even.`;
    default:
      return language === 'el'
        ? `${scoreText} Αυτή η επικάλυψη δείχνει την οπτική περιοχή που συνδέεται με την επιλεγμένη ανησυχία.`
        : `${scoreText} This overlay shows the visual region linked to the selected concern.`;
  }
}
