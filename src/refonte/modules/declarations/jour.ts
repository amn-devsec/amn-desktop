import { BellRing, Columns3, Flag, Gauge, StickyNote, Sunrise, Target, Trophy } from 'lucide-react';
import { declarerFamille, vue } from '../declarer';

/**
 * MA JOURNÉE — ce qu’on organise et suit chaque jour, et ce qui est « pour moi ».
 *
 * Regroupés (une entrée, plusieurs vues, aucune route supprimée) : Accueil et
 * tableau de bord ; Calendrier et RDV en ligne ; Tâches et priorités du jour ;
 * Projets et tableau ; Planning et absences ; Habitudes et routines.
 */

export default declarerFamille({
  id: 'jour',
  ordre: 1,
  teinte: 'jour',
  nom: { fr: 'Ma journée', en: 'My day' },
  actions: {
    organiser: { fr: 'Organiser ma journée', en: 'Plan my day' },
    suivre: { fr: 'Suivre l’avancement', en: 'Track progress' },
    equipe: { fr: 'Gérer l’équipe', en: 'Run the team' },
    perso: { fr: 'Pour moi', en: 'Just for me' },
  },
  modules: [
    {
      nom: { fr: 'Accueil et tableau de bord', en: 'Home and dashboard' },
      action: 'organiser',
      niveau: 'essentiel',
      vues: [
        vue('home', '/', ['voir ma journée', 'commencer la journée', 'revenir à l’accueil', 'voir ce qui m’attend'], ['accueil', 'qg', 'aujourd’hui', 'début', 'bonjour'], {
          en: { verbes: ['start my day', 'see my day', 'go back to home'], motsCles: ['home', 'hq', 'today', 'start'] },
        }),
        vue('dashboard', '/tableau-de-bord', ['voir mes chiffres', 'choisir un cadran'], ['tableau de bord', 'indicateurs', 'kpi', 'chiffres', 'graphique', 'statistiques'], {
          en: { verbes: ['see my numbers', 'pick a dial'], motsCles: ['dashboard', 'indicators', 'kpi', 'figures', 'stats'] },
        }),
      ],
    },
    {
      nom: { fr: 'Calendrier et RDV en ligne', en: 'Calendar and online booking' },
      action: 'organiser',
      niveau: 'essentiel',
      vues: [
        vue('agenda', '/agenda', ['prendre un rendez-vous', 'voir mon agenda', 'bloquer un créneau', 'planifier un rendez-vous', 'reporter un rendez-vous', 'synchroniser mon agenda Google'], ['calendrier', 'rdv', 'rendez-vous', 'disponibilités', 'date', 'google', 'ical'], {
          en: { verbes: ['book an appointment', 'see my calendar', 'block a time slot', 'sync my Google calendar'], motsCles: ['calendar', 'agenda', 'appointment', 'availability', 'google', 'date'] },
        }),
        vue('booking', '/rdv-en-ligne', ['laisser mes clients réserver', 'ouvrir des créneaux en ligne', 'partager mon lien de réservation'], ['réservation', 'rdv en ligne', 'prise de rendez-vous', 'lien', 'réserver'], {
          en: { verbes: ['let clients book', 'open online slots', 'share my booking link'], motsCles: ['booking', 'online booking', 'reservation', 'appointment page'] },
        }),
      ],
    },
    {
      nom: { fr: 'Tâches et priorités du jour', en: 'Tasks and today’s priorities' },
      action: 'organiser',
      niveau: 'essentiel',
      vues: [
        vue('tasks', '/tasks', ['ajouter une tâche', 'assigner une tâche', 'cocher une tâche', 'suivre mes tâches'], ['tâche', 'todo', 'à faire', 'liste', 'to-do'], {
          en: { verbes: ['add a task', 'assign a task', 'tick off a task'], motsCles: ['task', 'todo', 'to do', 'checklist', 'list'] },
        }),
        vue('priorities', '/priorites', ['choisir mes priorités', 'décider quoi faire aujourd’hui'], ['priorité', 'focus', 'urgent', 'important', 'top 3'], {
          en: { verbes: ['choose my priorities', 'decide what to do today'], motsCles: ['priority', 'priorities', 'focus', 'urgent', 'top 3'] },
        }),
      ],
    },
    {
      nom: { fr: 'Projets et tableau', en: 'Projects and board' },
      action: 'suivre',
      niveau: 'essentiel',
      vues: [
        vue('projects', '/projets', ['créer un projet', 'suivre un projet', 'voir ce qui bloque', 'ouvrir un projet', 'archiver un projet'], ['projet', 'chantier', 'dossier', 'avancement', 'mission'], {
          en: { verbes: ['create a project', 'follow a project', 'see what is blocked'], motsCles: ['project', 'job', 'file', 'progress'] },
        }),
        vue('board', '/tableau-projets', ['voir les projets en colonnes', 'déplacer un projet'], ['kanban', 'tableau', 'colonnes', 'projet', 'trello', 'tableau de projets'], {
          en: { verbes: ['see projects in columns', 'move a project'], motsCles: ['kanban', 'board', 'columns', 'project'] },
        }),
      ],
    },
    {
      nom: { fr: 'Missions et tickets', en: 'Missions and tickets' },
      action: 'suivre',
      niveau: 'courant',
      vues: [
        vue('missions', '/missions', ['suivre les tickets de l’équipe', 'voir qui traite quoi', 'prendre en charge un ticket', 'déplacer un ticket'], ['mission', 'ticket', 'kanban', 'prise en charge', 'délai', 'file'], {
          en: { verbes: ['follow the team tickets', 'see who handles what', 'take a ticket', 'move a ticket'], motsCles: ['mission', 'ticket', 'kanban', 'first response', 'queue'] },
          nouveau: {
            icone: Columns3,
            ecran: () => import('../../journee/missions/PageMissions'),
            indice: { fr: 'Les tickets de l’équipe et des clients, en colonnes', en: 'Team and client tickets, in columns' },
          },
        }),
      ],
    },
    {
      nom: { fr: 'Cockpit d’un client', en: 'Client cockpit' },
      action: 'suivre',
      niveau: 'courant',
      vues: [
        vue('cockpit', '/cockpit-client', ['piloter l’activité d’un client', 'voir le revenu récurrent d’un client', 'voir qui est connecté chez un client', 'voir la santé de l’intégration'], ['cockpit', 'revenu récurrent', 'stripe', 'connectés', 'intégration', 'console'], {
          en: { verbes: ['run a client’s activity', 'see a client’s recurring revenue', 'see who is online at a client', 'see the integration health'], motsCles: ['cockpit', 'recurring revenue', 'stripe', 'online', 'integration', 'console'] },
          nouveau: {
            icone: Gauge,
            ecran: () => import('../../journee/cockpit/PageCockpit'),
            indice: { fr: 'Leur activité en ligne, en direct : revenus, utilisateurs, tickets, santé', en: 'Their activity online, live: revenue, users, tickets, health' },
          },
        }),
      ],
    },
    {
      nom: { fr: 'Notes rapides', en: 'Quick notes' },
      action: 'suivre',
      niveau: 'courant',
      vues: [
        vue('notesRapides', '/notes-rapides', ['noter une idée en deux secondes', 'voir mes notes rapides', 'ranger mes notes à plus tard'], ['note rapide', 'idée', 'mur de notes', 'à trier', 'mémo'], {
          en: { verbes: ['note an idea in two seconds', 'see my quick notes', 'sort my notes later'], motsCles: ['quick note', 'idea', 'note wall', 'to sort', 'memo'] },
          nouveau: {
            icone: StickyNote,
            ecran: () => import('../../journee/notes/PageNotes'),
            indice: { fr: 'Noter en deux secondes, classer plus tard', en: 'Note in two seconds, sort later' },
          },
        }),
      ],
    },
    {
      nom: { fr: 'Rappels', en: 'Reminders' },
      action: 'suivre',
      niveau: 'courant',
      vues: [
        vue('rappels', '/rappels', ['voir ce qui sonne maintenant', 'reporter un rappel', 'ne rien oublier aujourd’hui'], ['rappel', 'reporter', 'à reprendre', 'récurrent', 'heures calmes', 'prévenu'], {
          en: { verbes: ['see what rings now', 'snooze a reminder', 'forget nothing today'], motsCles: ['reminder', 'snooze', 'recurring', 'quiet hours', 'notified'] },
          nouveau: {
            icone: BellRing,
            ecran: () => import('../../journee/rappels/PageRappels'),
            indice: { fr: 'Ce qui sonne maintenant, ce qui arrive, et comment tu es prévenu', en: 'What rings now, what is coming, and how you are told' },
          },
        }),
      ],
    },
    {
      action: 'suivre',
      niveau: 'courant',
      vues: [
        vue('okr', '/objectifs-resultats', ['fixer un objectif', 'mesurer un résultat', 'suivre mes objectifs'], ['okr', 'objectif', 'saison', 'kpi', 'résultats clés', 'trimestre'], {
          en: { verbes: ['set an objective', 'measure a result', 'track my objectives'], motsCles: ['okr', 'objective', 'key results', 'season', 'kpi'] },
        }),
      ],
    },
    {
      action: 'suivre',
      niveau: 'courant',
      vues: [
        vue('weekly', '/revue-hebdo', ['faire le bilan de la semaine', 'préparer la semaine prochaine'], ['revue', 'hebdo', 'vendredi', 'bilan', 'rétrospective', 'semaine'], {
          en: { verbes: ['review the week', 'prepare next week'], motsCles: ['review', 'weekly', 'friday', 'retrospective', 'wrap-up'] },
        }),
      ],
    },
    {
      action: 'suivre',
      niveau: 'courant',
      vues: [
        vue('time', '/temps', ['noter le temps passé', 'lancer le chronomètre', 'suivre mon temps', 'facturer du temps'], ['temps', 'chrono', 'chronomètre', 'heures', 'feuille de temps', 'timesheet'], {
          en: { verbes: ['log time spent', 'start the timer'], motsCles: ['time', 'timer', 'stopwatch', 'hours', 'timesheet'] },
        }),
      ],
    },
    {
      nom: { fr: 'Planning et absences', en: 'Schedule and time off' },
      action: 'equipe',
      niveau: 'courant',
      vues: [
        vue('shifts', '/planning', ['faire le planning', 'voir qui travaille cette semaine', 'organiser les équipes'], ['planning', 'horaires', 'roulement', 'équipe', 'shift', 'rota'], {
          en: { verbes: ['make the schedule', 'see who works this week'], motsCles: ['schedule', 'shifts', 'rota', 'roster', 'team'] },
        }),
        vue('leaves', '/absences', ['poser un congé', 'déclarer une absence', 'voir qui est absent'], ['absence', 'congé', 'vacances', 'maladie', 'télétravail', 'rtt', 'arrêt maladie'], {
          en: { verbes: ['request leave', 'declare an absence', 'see who is away'], motsCles: ['leave', 'absence', 'holiday', 'vacation', 'sick', 'remote work', 'time off'] },
        }),
      ],
    },
    {
      nom: { fr: 'Habitudes et routines', en: 'Habits and routines' },
      action: 'perso',
      niveau: 'courant',
      vues: [
        vue('habits', '/personnel/habitudes', ['cocher une habitude', 'suivre mes habitudes'], ['habitude', 'série', 'perso', 'streak'], {
          en: { verbes: ['tick off a habit', 'track my habits'], motsCles: ['habit', 'streak', 'personal'] },
        }),
        vue('routines', '/routines', ['cocher une routine', 'créer une routine'], ['routine', 'habitude', 'quotidien', 'récurrent'], {
          en: { verbes: ['tick off a routine', 'create a routine'], motsCles: ['routine', 'daily', 'recurring', 'habit'] },
        }),
      ],
    },
    {
      action: 'perso',
      niveau: 'courant',
      vues: [
        vue('budget', '/personnel/budget', ['savoir ce qu’il me reste à dépenser'], ['budget', 'paie', 'perso', 'reste à vivre', 'argent perso', 'dépenses perso'], {
          en: { verbes: ['know what I have left to spend'], motsCles: ['budget', 'payday', 'personal', 'money left'] },
        }),
      ],
    },
    {
      action: 'perso',
      niveau: 'courant',
      vues: [
        vue('courses', '/personnel/courses', ['faire ma liste de courses'], ['courses', 'liste', 'supermarché', 'épicerie'], {
          en: { verbes: ['make my shopping list'], motsCles: ['groceries', 'shopping', 'list', 'supermarket'] },
        }),
      ],
    },
    {
      action: 'perso',
      niveau: 'avance',
      vues: [
        vue('personalGoals', '/personnel/objectifs', ['fixer un objectif personnel'], ['objectif', 'perso', 'but'], {
          en: { verbes: ['set a personal goal'], motsCles: ['goal', 'personal', 'target'] },
        }),
      ],
    },
    {
      nom: { fr: 'Séries et jalons', en: 'Streaks and milestones' },
      action: 'suivre',
      niveau: 'courant',
      vues: [
        vue('series', '/series', ['voir ma série', 'voir mes badges', 'voir mes paliers'], ['série', 'jalons', 'badge', 'palier', 'régularité', 'record'], {
          en: { verbes: ['see my streak', 'see my badges', 'see my milestones'], motsCles: ['streak', 'milestones', 'badge', 'record', 'habit'] },
          nouveau: { icone: Trophy, ecran: () => import('../../journee/ecrans/L01/SeriesRefonte'), indice: { fr: 'Ta régularité, sans pression', en: 'Your steady habit, no pressure' } },
        }),
      ],
    },
    {
      nom: { fr: 'Défis d’équipe', en: 'Team challenges' },
      action: 'suivre',
      niveau: 'courant',
      vues: [
        vue('defis', '/defis', ['voir le défi de la semaine', 'proposer un défi à l’équipe', 'fêter ensemble'], ['défi', 'équipe', 'objectif commun', 'célébration', 'semaine'], {
          en: { verbes: ['see the weekly challenge', 'suggest a team challenge', 'celebrate together'], motsCles: ['challenge', 'team', 'shared goal', 'celebration', 'week'] },
          nouveau: { icone: Flag, ecran: () => import('../../journee/ecrans/L07/DefisRefonte'), indice: { fr: 'Avancer ensemble, sans classement', en: 'Moving forward together, no ranking' } },
        }),
      ],
    },
    {
      nom: { fr: 'Rituel du matin', en: 'Morning ritual' },
      action: 'organiser',
      niveau: 'courant',
      vues: [
        vue('rituel', '/rituel', ['faire mon rituel du matin', 'choisir mes trois priorités', 'préparer ma journée'], ['rituel', 'matin', 'priorités', 'journée', 'trois choses'], {
          en: { verbes: ['do my morning ritual', 'choose my three priorities', 'plan my day'], motsCles: ['ritual', 'morning', 'priorities', 'day', 'three things'] },
          nouveau: { icone: Sunrise, ecran: () => import('../../journee/ecrans/L03/RituelRefonte'), indice: { fr: 'Trois minutes pour bien partir', en: 'Three minutes to start well' } },
        }),
      ],
    },
    {
      nom: { fr: 'Mode Focus', en: 'Focus mode' },
      action: 'organiser',
      niveau: 'courant',
      vues: [
        vue('focus', '/focus', ['me concentrer sur une tâche', 'lancer le mode focus', 'couper le bruit'], ['focus', 'concentration', 'session', 'pomodoro', 'minuteur'], {
          en: { verbes: ['focus on one task', 'start focus mode', 'mute the noise'], motsCles: ['focus', 'concentration', 'session', 'pomodoro', 'timer'] },
          nouveau: { icone: Target, ecran: () => import('../../journee/ecrans/L02/FocusRefonte'), indice: { fr: 'Une seule chose, le reste attend', en: 'One thing at a time, the rest waits' } },
        }),
      ],
    },
    {
      action: 'perso',
      niveau: 'avance',
      vues: [
        vue('pomodoro', '/personnel/pomodoro', ['me concentrer 25 minutes', 'lancer un pomodoro'], ['pomodoro', 'concentration', 'minuteur', 'timer'], {
          en: { verbes: ['focus for 25 minutes', 'start a pomodoro'], motsCles: ['pomodoro', 'focus', 'timer', 'concentration'] },
        }),
      ],
    },
    {
      action: 'perso',
      niveau: 'avance',
      vues: [
        vue('health', '/personnel/sante', ['noter un rendez-vous médical', 'suivre mes échéances de santé'], ['santé', 'médecin', 'vaccin', 'rendez-vous médical', 'dentiste', 'ordonnance'], {
          en: { verbes: ['note a medical appointment', 'track my health deadlines'], motsCles: ['health', 'doctor', 'vaccine', 'dentist', 'prescription'] },
        }),
      ],
    },
  ],
});
