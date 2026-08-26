/** Vrai / faux : même interaction qu'un choix unique, libellé de consigne adapté. */
import { choiceQuestion } from './SingleChoiceQuestion.js';

export function trueFalseQuestion(props) {
  return choiceQuestion({ ...props, legend: 'Cette affirmation est-elle vraie ou fausse ?' });
}
