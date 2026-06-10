import { createFileRoute } from "@tanstack/react-router";
import lottie from "lottie-web/build/player/lottie_light";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  X,
  Plus,
  Minus,
  Trash2,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Play,
  RotateCcw,
  Square,
  Lock,
  Mic,
  Volume2,
} from "lucide-react";
import confettiAnimation from "@/assets/confetti-full-screen.json";
import correctSound from "@/assets/correct.wav";
import defaultTreeImage from "@/assets/default-tree.png";
import festivalsFollowImage1 from "@/assets/festivals-follow-1.jpg";
import festivalsFollowImage2 from "@/assets/festivals-follow-2.jpg";
import festivalsFollowImage3 from "@/assets/festivals-follow-3.jpg";
import festivalsFollowImage4 from "@/assets/festivals-follow-4.jpg";
import festivalsMatchImage from "@/assets/festivals-match.png";
import festivalsReadImage from "@/assets/festivals-read.jpg";
import festivalsRolePlayImage from "@/assets/festivals-role-play.jpg";
import followBrushTeethAudio from "@/assets/follow-audio/brush-teeth.m4a";
import followGetUpAudio from "@/assets/follow-audio/get-up.m4a";
import followGoToSchoolAudio from "@/assets/follow-audio/go-to-school.m4a";
import followWashFaceAudio from "@/assets/follow-audio/wash-face.m4a";
import timeFollowImage1 from "@/assets/time-follow-1.jpg";
import timeFollowImage2 from "@/assets/time-follow-2.jpg";
import timeFollowImage3 from "@/assets/time-follow-3.jpg";
import timeFollowImage4 from "@/assets/time-follow-4.jpg";
import timeMatchMorningImage from "@/assets/time-match-morning.jpg";
import timeReadMorningImage from "@/assets/time-read-morning.jpg";
import timeRolePlayImage from "@/assets/time-role-play.jpg";
import tryAgainSound from "@/assets/try-again.wav";
import victorySound from "@/assets/victory.mp3";

export const Route = createFileRoute("/")({
  component: Index,
});

type Pair = { id: string; label: string; answer: string };
type TimerSettings = { minutes: number; seconds: number };
type SpeechScoreTone = "great" | "pass" | "practice";
type SpeechScoreResult = {
  score: number;
  feedback: string;
  tone: SpeechScoreTone;
};
type SentenceWordTone = "correct" | "wrong" | "neutral";
type SentenceWordToken = {
  text: string;
  tone: SentenceWordTone;
};
type PointerDragPreview = {
  answer: string;
  x: number;
  y: number;
};
type PointerAnswerDrag = PointerDragPreview & {
  pointerId: number;
};
type RolePlayRoleOption = {
  label: string;
};
type RoleSelectionState = {
  leftRole: string;
  rightRole: string;
  setLeftRole: React.Dispatch<React.SetStateAction<string>>;
  setRightRole: React.Dispatch<React.SetStateAction<string>>;
};
type SpeechRecognitionAlternativeLike = {
  confidence?: number;
  transcript: string;
};
type SpeechRecognitionResultLike = {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};
type SpeechRecognitionErrorEventLike = {
  error?: string;
};
type SpeechRecognitionLike = {
  abort: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeakingPracticeController = {
  errorMessage: string;
  isListening: boolean;
  scoreResult: SpeechScoreResult | null;
  sentenceWordTokens: SentenceWordToken[];
  toggleScoring: () => void;
  transcript: string;
};
type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;
type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  };
type WorkspaceBaseConfig = {
  id: "follow-work" | "match-master" | "group-work" | "role-play-work";
  label: string;
  defaultTitle: string;
  view: "activity" | "placeholder";
};
type ActivityWorkspaceConfig = WorkspaceBaseConfig & {
  view: "activity";
  storageKey: string;
  imageKeys: readonly string[];
  imageLayout: "single" | "row4";
  sentenceColumns: 1 | 2;
  titleKey: string;
  timerKey: string;
  timerDefaultVersionKey: string;
  timerDefaultVersion: string;
  timerDefault: TimerSettings;
  legacyTimerDefaults: TimerSettings[];
  defaultPairs: Pair[];
  defaultImages?: readonly string[];
  fixedPairCount?: number;
  legacyTitleMap?: Record<string, string>;
  pairsDefaultVersionKey?: string;
  pairsDefaultVersion?: string;
  showDropTargets: boolean;
  showAnswerTiles: boolean;
  showGameReset: boolean;
  showPairBoard: boolean;
  showTargetSentence: boolean;
  labelBoxesClickable: boolean;
  sentenceEditorHelpText?: string;
};
type PlaceholderWorkspaceConfig = WorkspaceBaseConfig & {
  view: "placeholder";
  description: string;
};
type WorkspaceConfig = ActivityWorkspaceConfig | PlaceholderWorkspaceConfig;
type LearningUnit = {
  id: string;
  label: string;
};

const STORAGE_KEY = "tree-match-pairs-v1";
const IMAGE_KEY = "tree-match-image-v1";
const TITLE_KEY = "tree-match-title-v1";
const TIMER_KEY = "tree-match-timer-v1";
const TIMER_DEFAULT_VERSION_KEY = "tree-match-timer-default-version";
const FOLLOW_STORAGE_KEY = "follow-match-pairs-v1";
const FOLLOW_IMAGE_KEY = "follow-match-image-v1";
const FOLLOW_IMAGE_KEYS = [
  FOLLOW_IMAGE_KEY,
  "follow-match-image-2-v1",
  "follow-match-image-3-v1",
  "follow-match-image-4-v1",
] as const;
const FOLLOW_TITLE_KEY = "follow-match-title-v1";
const FOLLOW_TIMER_KEY = "follow-match-timer-v1";
const FOLLOW_TIMER_DEFAULT_VERSION_KEY = "follow-match-timer-default-version";
const FOLLOW_PAIRS_DEFAULT_VERSION_KEY = "follow-match-pairs-default-version";
const ROLE_PLAY_STORAGE_KEY = "role-play-pairs-v1";
const ROLE_PLAY_IMAGE_KEY = "role-play-image-v1";
const ROLE_PLAY_TITLE_KEY = "role-play-title-v1";
const ROLE_PLAY_TIMER_KEY = "role-play-timer-v1";
const ROLE_PLAY_TIMER_DEFAULT_VERSION_KEY = "role-play-timer-default-version";
const ROLE_PLAY_PAIRS_DEFAULT_VERSION_KEY = "role-play-pairs-default-version";
const ROLE_PLAY_LEFT_ROLE_KEY = "role-play-left-role-v1";
const ROLE_PLAY_RIGHT_ROLE_KEY = "role-play-right-role-v1";
const WORKSPACE_STORAGE_KEY = "active-workspace-v1";
const UNIT_STORAGE_KEY = "active-learning-unit-v1";
const MATCH_TIMER_DEFAULT_VERSION = "2";
const SPEAK_TIMER_DEFAULT_VERSION = "3";
const FOLLOW_PAIRS_DEFAULT_VERSION = "1";
const ROLE_PLAY_PAIRS_DEFAULT_VERSION = "2";
const DEFAULT_TITLE = "Match";
const FOLLOW_DEFAULT_TITLE = "Follow";
const READ_DEFAULT_TITLE = "Read";
const ROLE_PLAY_DEFAULT_TITLE = "Role play";
const LEARNING_UNITS: LearningUnit[] = [
  { id: "4b-m3u2-time", label: "4B M3U2 Time" },
  { id: "4b-m4u2-festivals-in-china", label: "4B M4U2 Festivals in China" },
];
const LEARNING_UNIT_IDS = LEARNING_UNITS.map((unit) => unit.id);
const DEFAULT_LEARNING_UNIT_ID = LEARNING_UNITS[0].id;

function createRoleAvatar(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const ROLE_PLAY_NEUTRAL_AVATAR_LEFT = createRoleAvatar(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <rect width="160" height="160" rx="34" fill="#fffefa"/>
    <circle cx="80" cy="80" r="63" fill="#e4f5fb"/>
    <circle cx="80" cy="80" r="55" fill="#fff8df"/>
    <path d="M42 135c8-26 27-40 58-40 21 7 34 20 39 40H42z" fill="#d8f3e7"/>
    <path d="M56 119c12 10 39 10 52 0" fill="none" stroke="#72c9ad" stroke-width="8" stroke-linecap="round"/>
    <circle cx="80" cy="72" r="37" fill="#ffd9c7"/>
    <circle cx="46" cy="74" r="10" fill="#ffd9c7"/>
    <circle cx="114" cy="74" r="10" fill="#ffd9c7"/>
    <path d="M47 61c4-24 23-38 50-32 17 4 28 18 31 37-17 1-32-4-45-16-10 10-23 16-36 11z" fill="#455a74"/>
    <path d="M50 64c11 3 26-2 38-14 9 10 20 15 32 15" fill="none" stroke="#3f526a" stroke-width="5" stroke-linecap="round"/>
    <circle cx="66" cy="76" r="5" fill="#263447"/>
    <circle cx="96" cy="76" r="5" fill="#263447"/>
    <path d="M72 94c7 7 18 7 25 0" fill="none" stroke="#cf6f65" stroke-width="5" stroke-linecap="round"/>
    <circle cx="58" cy="88" r="7" fill="#f7a6a0" opacity=".45"/>
    <circle cx="104" cy="88" r="7" fill="#f7a6a0" opacity=".45"/>
    <circle cx="58" cy="122" r="6" fill="#78d4bd"/>
    <circle cx="78" cy="128" r="6" fill="#f4d875"/>
    <circle cx="99" cy="122" r="6" fill="#91c9ee"/>
  </svg>
`);

const ROLE_PLAY_NEUTRAL_AVATAR_RIGHT = createRoleAvatar(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <rect width="160" height="160" rx="34" fill="#fffefa"/>
    <circle cx="80" cy="80" r="63" fill="#e9e6ff"/>
    <circle cx="80" cy="80" r="55" fill="#fff8df"/>
    <path d="M41 135c8-25 27-39 58-39 21 7 34 20 39 39H41z" fill="#e6e2ff"/>
    <path d="M56 119c12 10 39 10 52 0" fill="none" stroke="#9a91ef" stroke-width="8" stroke-linecap="round"/>
    <circle cx="80" cy="72" r="37" fill="#ffd9c7"/>
    <circle cx="46" cy="74" r="10" fill="#ffd9c7"/>
    <circle cx="114" cy="74" r="10" fill="#ffd9c7"/>
    <path d="M43 65c3-25 22-39 50-37 20 2 32 15 35 38-13 0-25-3-35-10-13 8-28 12-50 9z" fill="#5d557b"/>
    <path d="M48 62c16 3 33-2 48-14 7 8 16 12 26 13" fill="none" stroke="#4d4668" stroke-width="5" stroke-linecap="round"/>
    <circle cx="66" cy="76" r="5" fill="#2f2b42"/>
    <circle cx="96" cy="76" r="5" fill="#2f2b42"/>
    <path d="M72 94c7 7 18 7 25 0" fill="none" stroke="#cf6f65" stroke-width="5" stroke-linecap="round"/>
    <circle cx="58" cy="88" r="7" fill="#f7a6a0" opacity=".45"/>
    <circle cx="104" cy="88" r="7" fill="#f7a6a0" opacity=".45"/>
    <circle cx="58" cy="122" r="6" fill="#91c9ee"/>
    <circle cx="78" cy="128" r="6" fill="#f4d875"/>
    <circle cx="99" cy="122" r="6" fill="#b2a8ff"/>
  </svg>
`);

const ROLE_PLAY_ROLE_OPTIONS: RolePlayRoleOption[] = [
  {
    label: "Kitty",
  },
  {
    label: "Kitty's Mum",
  },
  {
    label: "Mum",
  },
  {
    label: "Lily老师",
  },
];
const ROLE_PLAY_ROLE_NAMES = ROLE_PLAY_ROLE_OPTIONS.map((option) => option.label);
const ROLE_PLAY_DEFAULT_LEFT_ROLE = ROLE_PLAY_ROLE_OPTIONS[0].label;
const ROLE_PLAY_DEFAULT_RIGHT_ROLE = ROLE_PLAY_ROLE_OPTIONS[1].label;
const DEFAULT_WORKSPACE_ID: WorkspaceConfig["id"] = "follow-work";
const MATCH_TIMER_DEFAULT: TimerSettings = { minutes: 2, seconds: 0 };
const SPEAK_TIMER_DEFAULT: TimerSettings = { minutes: 4, seconds: 0 };
const LEGACY_ONE_MINUTE_TIMER: TimerSettings = { minutes: 1, seconds: 0 };
const DEFAULT_IMAGE = defaultTreeImage;
const EMPTY_TITLE_MAP: Record<string, string> = {};
const CELEBRATION_EXTRA_SECONDS = 0.5;
const CELEBRATION_BASE_SECONDS =
  (confettiAnimation.op - confettiAnimation.ip) / confettiAnimation.fr;
const CELEBRATION_PLAYBACK_SPEED =
  CELEBRATION_BASE_SECONDS / (CELEBRATION_BASE_SECONDS + CELEBRATION_EXTRA_SECONDS);
const ROLE_SPEAKER_MIN_VISIBLE_MS = 700;
const ROLE_RESPONSE_PLAY_DELAY_MS = 480;
const APP_FRAME_MAX_WIDTH_CLASS = "max-w-[1124px]";
const MATCH_BOX_WIDTH_CLASS = "w-[196px] shrink-0";
const READ_SENTENCE_BOX_WIDTH_CLASS = "w-[360px] xl:w-[460px] max-w-full";

const DEFAULT_PAIRS: Pair[] = [
  { id: "1", label: "flowers", answer: "pink" },
  { id: "2", label: "leaves", answer: "green" },
  { id: "3", label: "branches", answer: "long" },
  { id: "4", label: "trunk", answer: "strong" },
  { id: "5", label: "roots", answer: "deep" },
];
const MATCH_IMAGE_KEYS = [IMAGE_KEY] as const;
const FOLLOW_DEFAULT_PAIRS: Pair[] = [
  { id: "1", label: "Get up", answer: "get up" },
  { id: "2", label: "Wash face", answer: "wash face" },
  { id: "3", label: "Brush teeth", answer: "brush teeth" },
  { id: "4", label: "Go to school", answer: "go to school" },
];
const TIME_UNIT_FOLLOW_DEFAULT_PAIRS: Pair[] = [
  { id: "1", label: "seven o’clock", answer: "seven o’clock" },
  { id: "2", label: "a quarter past seven", answer: "a quarter past seven" },
  { id: "3", label: "half past seven", answer: "half past seven" },
  { id: "4", label: "a quarter to eight", answer: "a quarter to eight" },
];
const TIME_UNIT_FOLLOW_DEFAULT_IMAGES = [
  timeFollowImage1,
  timeFollowImage2,
  timeFollowImage3,
  timeFollowImage4,
] as const;
const FESTIVALS_UNIT_FOLLOW_DEFAULT_IMAGES = [
  festivalsFollowImage1,
  festivalsFollowImage2,
  festivalsFollowImage3,
  festivalsFollowImage4,
] as const;
const FOLLOW_AUDIO_BY_LABEL: Record<string, string> = {
  "get up": followGetUpAudio,
  "wash face": followWashFaceAudio,
  "brush teeth": followBrushTeethAudio,
  "go to school": followGoToSchoolAudio,
};
const GROUP_WORK_PAIRS_DEFAULT_VERSION = "3";
const GROUP_WORK_DEFAULT_PAIRS: Pair[] = [
  {
    id: "1",
    label: "Look at the tree.",
    answer: "tree",
  },
  {
    id: "2",
    label: "The roots are deep.",
    answer: "roots",
  },
  {
    id: "3",
    label: "The trunk is strong.",
    answer: "trunk",
  },
  {
    id: "4",
    label: "The branches are green.",
    answer: "branches",
  },
];
const ROLE_PLAY_DEFAULT_PAIRS: Pair[] = [
  {
    id: "1",
    label: "Look at the tree.",
    answer: "tree",
  },
  {
    id: "2",
    label: "The roots are deep.",
    answer: "roots",
  },
  {
    id: "3",
    label: "The trunk is strong.",
    answer: "trunk",
  },
  {
    id: "4",
    label: "The branches are green.",
    answer: "branches",
  },
  {
    id: "5",
    label: "The leaves are green.",
    answer: "leaves",
  },
  {
    id: "6",
    label: "The flowers are pink.",
    answer: "flowers",
  },
];
const TIME_UNIT_MATCH_DEFAULT_PAIRS: Pair[] = [
  { id: "1", label: "seven o’clock", answer: "get up" },
  { id: "2", label: "a quarter past seven", answer: "brush my teeth" },
  { id: "3", label: "half past seven", answer: "wash my face" },
  { id: "4", label: "a quarter to seven", answer: "have breakfast" },
];
const TIME_UNIT_READ_DEFAULT_PAIRS: Pair[] = [
  { id: "1", label: "It’s seven o’clock.", answer: "seven" },
  { id: "2", label: "I’m getting up.", answer: "getting up" },
  { id: "3", label: "It’s half past seven.", answer: "half past seven" },
  { id: "4", label: "I’m washing my face.", answer: "washing my face" },
];
const TIME_UNIT_ROLE_PLAY_DEFAULT_PAIRS: Pair[] = [
  { id: "1", label: "What time is it?", answer: "time" },
  { id: "2", label: "What are you doing?", answer: "doing" },
  { id: "3", label: "It’s a quarter to eight.", answer: "quarter to eight" },
  { id: "4", label: "I’m having breakfast.", answer: "having breakfast" },
];
const FESTIVALS_UNIT_FOLLOW_DEFAULT_PAIRS: Pair[] = [
  { id: "1", label: "the Spring Festival", answer: "the Spring Festival" },
  { id: "2", label: "the Dragon Boat Festival", answer: "the Dragon Boat Festival" },
  { id: "3", label: "the Mid-Autumn Festival", answer: "the Mid-Autumn Festival" },
  { id: "4", label: "the Double Ninth Festival", answer: "the Double Ninth Festival" },
];
const FESTIVALS_UNIT_MATCH_DEFAULT_PAIRS: Pair[] = [
  { id: "1", label: "the Spring Festival", answer: "dumplings" },
  { id: "2", label: "the Dragon Boat Festival", answer: "rice dumplings" },
  { id: "3", label: "the Mid-Autumn Festival", answer: "mooncakes" },
  { id: "4", label: "the Double Ninth Festival", answer: "Double Ninth cakes" },
];
const FESTIVALS_UNIT_READ_DEFAULT_PAIRS: Pair[] = [
  { id: "1", label: "The Spring Festival is in January or February.", answer: "Spring Festival" },
  { id: "2", label: "People have a big dinner.", answer: "big dinner" },
  { id: "3", label: "People eat dumplings.", answer: "dumplings" },
];
const FESTIVALS_UNIT_ROLE_PLAY_DEFAULT_PAIRS: Pair[] = [
  { id: "1", label: "What festivals do you like?", answer: "festivals" },
  { id: "2", label: "What do you eat?", answer: "eat" },
  { id: "3", label: "I like the the Spring Festival.", answer: "Spring Festival" },
  { id: "4", label: "I eat dumplings.", answer: "dumplings" },
];
const GROUP_WORK_LEGACY_SENTENCES = new Set([
  "These green branches have some beautiful red apples.",
  "The clever monkey jumps over the river branches.",
  "We must brush our teeth every morning.",
]);
const GENERIC_DEFAULT_LABELS = new Set([
  ...FOLLOW_DEFAULT_PAIRS.map((pair) => pair.label),
  ...DEFAULT_PAIRS.map((pair) => pair.label),
  ...GROUP_WORK_DEFAULT_PAIRS.map((pair) => pair.label),
  ...ROLE_PLAY_DEFAULT_PAIRS.map((pair) => pair.label),
]);
const REMOVED_STORAGE_KEYS = ["match-master-stars-v1", "group-work-stars-v1"] as const;
const UNIT_STAR_COUNTS_KEY = "unit-star-counts-v1";

const WORKSPACES: WorkspaceConfig[] = [
  {
    id: "follow-work",
    label: "Follow",
    defaultTitle: FOLLOW_DEFAULT_TITLE,
    view: "activity",
    storageKey: FOLLOW_STORAGE_KEY,
    imageKeys: FOLLOW_IMAGE_KEYS,
    imageLayout: "row4",
    sentenceColumns: 1,
    titleKey: FOLLOW_TITLE_KEY,
    timerKey: FOLLOW_TIMER_KEY,
    timerDefaultVersionKey: FOLLOW_TIMER_DEFAULT_VERSION_KEY,
    timerDefaultVersion: MATCH_TIMER_DEFAULT_VERSION,
    timerDefault: MATCH_TIMER_DEFAULT,
    legacyTimerDefaults: [LEGACY_ONE_MINUTE_TIMER],
    defaultPairs: FOLLOW_DEFAULT_PAIRS,
    legacyTitleMap: {
      "Group Work": "Follow",
      Speak: "Follow",
      "Let's speak": "Follow",
      "Let's speak.": "Follow",
    },
    pairsDefaultVersionKey: FOLLOW_PAIRS_DEFAULT_VERSION_KEY,
    pairsDefaultVersion: FOLLOW_PAIRS_DEFAULT_VERSION,
    showDropTargets: true,
    showAnswerTiles: false,
    showGameReset: false,
    showPairBoard: false,
    showTargetSentence: false,
    labelBoxesClickable: false,
  },
  {
    id: "match-master",
    label: "Match",
    defaultTitle: DEFAULT_TITLE,
    view: "activity",
    storageKey: STORAGE_KEY,
    imageKeys: MATCH_IMAGE_KEYS,
    imageLayout: "single",
    sentenceColumns: 1,
    titleKey: TITLE_KEY,
    timerKey: TIMER_KEY,
    timerDefaultVersionKey: TIMER_DEFAULT_VERSION_KEY,
    timerDefaultVersion: MATCH_TIMER_DEFAULT_VERSION,
    timerDefault: MATCH_TIMER_DEFAULT,
    legacyTimerDefaults: [LEGACY_ONE_MINUTE_TIMER],
    defaultPairs: DEFAULT_PAIRS,
    legacyTitleMap: { "Tree Match Master": "Match" },
    showDropTargets: true,
    showAnswerTiles: true,
    showGameReset: true,
    showPairBoard: true,
    showTargetSentence: false,
    labelBoxesClickable: false,
  },
  {
    id: "group-work",
    label: "Read",
    defaultTitle: READ_DEFAULT_TITLE,
    view: "activity",
    storageKey: "group-work-pairs-v1",
    imageKeys: ["group-work-image-v1"],
    imageLayout: "single",
    sentenceColumns: 1,
    titleKey: "group-work-title-v1",
    timerKey: "group-work-timer-v1",
    timerDefaultVersionKey: "group-work-timer-default-version",
    timerDefaultVersion: SPEAK_TIMER_DEFAULT_VERSION,
    timerDefault: SPEAK_TIMER_DEFAULT,
    legacyTimerDefaults: [LEGACY_ONE_MINUTE_TIMER, MATCH_TIMER_DEFAULT],
    defaultPairs: GROUP_WORK_DEFAULT_PAIRS,
    legacyTitleMap: {
      "Group Work": READ_DEFAULT_TITLE,
      Speak: READ_DEFAULT_TITLE,
      "Let's speak": READ_DEFAULT_TITLE,
      "Let's speak.": READ_DEFAULT_TITLE,
      Read: READ_DEFAULT_TITLE,
    },
    pairsDefaultVersionKey: "group-work-pairs-default-version",
    pairsDefaultVersion: GROUP_WORK_PAIRS_DEFAULT_VERSION,
    showDropTargets: false,
    showAnswerTiles: false,
    showGameReset: false,
    showPairBoard: true,
    showTargetSentence: true,
    labelBoxesClickable: true,
    sentenceEditorHelpText: "Edit the sentence buttons shown on the Read page.",
  },
  {
    id: "role-play-work",
    label: "Role play",
    defaultTitle: ROLE_PLAY_DEFAULT_TITLE,
    view: "activity",
    storageKey: ROLE_PLAY_STORAGE_KEY,
    imageKeys: [ROLE_PLAY_IMAGE_KEY],
    imageLayout: "single",
    sentenceColumns: 2,
    titleKey: ROLE_PLAY_TITLE_KEY,
    timerKey: ROLE_PLAY_TIMER_KEY,
    timerDefaultVersionKey: ROLE_PLAY_TIMER_DEFAULT_VERSION_KEY,
    timerDefaultVersion: SPEAK_TIMER_DEFAULT_VERSION,
    timerDefault: SPEAK_TIMER_DEFAULT,
    legacyTimerDefaults: [LEGACY_ONE_MINUTE_TIMER, MATCH_TIMER_DEFAULT],
    defaultPairs: ROLE_PLAY_DEFAULT_PAIRS,
    fixedPairCount: 6,
    legacyTitleMap: {
      "Role Play": ROLE_PLAY_DEFAULT_TITLE,
      "Role play.": ROLE_PLAY_DEFAULT_TITLE,
    },
    pairsDefaultVersionKey: ROLE_PLAY_PAIRS_DEFAULT_VERSION_KEY,
    pairsDefaultVersion: ROLE_PLAY_PAIRS_DEFAULT_VERSION,
    showDropTargets: false,
    showAnswerTiles: false,
    showGameReset: false,
    showPairBoard: true,
    showTargetSentence: true,
    labelBoxesClickable: true,
    sentenceEditorHelpText: "Edit the left and right sentence columns shown on the Role play page.",
  },
];

function getUnitScopedStorageKey(unitId: string, storageKey: string) {
  return `${unitId}:${storageKey}`;
}

function getUnitWorkspaceOverrides(
  workspaceId: WorkspaceConfig["id"],
  unitId: string,
): Partial<ActivityWorkspaceConfig> {
  const isTimeUnit = unitId === "4b-m3u2-time";
  const isFestivalsUnit = unitId === "4b-m4u2-festivals-in-china";
  const version = isTimeUnit ? "time-unit-5" : isFestivalsUnit ? "festivals-unit-6" : undefined;
  if (!version) return {};

  if (workspaceId === "follow-work") {
    return {
      defaultPairs: isTimeUnit
        ? TIME_UNIT_FOLLOW_DEFAULT_PAIRS
        : FESTIVALS_UNIT_FOLLOW_DEFAULT_PAIRS,
      defaultImages: isTimeUnit
        ? TIME_UNIT_FOLLOW_DEFAULT_IMAGES
        : FESTIVALS_UNIT_FOLLOW_DEFAULT_IMAGES,
      pairsDefaultVersionKey: FOLLOW_PAIRS_DEFAULT_VERSION_KEY,
      pairsDefaultVersion: version,
    };
  }

  if (workspaceId === "match-master") {
    return {
      defaultPairs: isTimeUnit ? TIME_UNIT_MATCH_DEFAULT_PAIRS : FESTIVALS_UNIT_MATCH_DEFAULT_PAIRS,
      defaultImages: isTimeUnit ? [timeMatchMorningImage] : [festivalsMatchImage],
      pairsDefaultVersionKey: "tree-match-pairs-default-version",
      pairsDefaultVersion: version,
    };
  }

  if (workspaceId === "group-work") {
    return {
      defaultPairs: isTimeUnit ? TIME_UNIT_READ_DEFAULT_PAIRS : FESTIVALS_UNIT_READ_DEFAULT_PAIRS,
      defaultImages: isTimeUnit ? [timeReadMorningImage] : [festivalsReadImage],
      pairsDefaultVersionKey: "group-work-pairs-default-version",
      pairsDefaultVersion: version,
    };
  }

  if (workspaceId === "role-play-work") {
    return {
      defaultPairs: isTimeUnit
        ? TIME_UNIT_ROLE_PLAY_DEFAULT_PAIRS
        : FESTIVALS_UNIT_ROLE_PLAY_DEFAULT_PAIRS,
      defaultImages: isTimeUnit ? [timeRolePlayImage] : [festivalsRolePlayImage],
      fixedPairCount: 4,
      pairsDefaultVersionKey: ROLE_PLAY_PAIRS_DEFAULT_VERSION_KEY,
      pairsDefaultVersion: version,
    };
  }

  return {};
}

function scopeWorkspaceForUnit(workspace: WorkspaceConfig, unitId: string): WorkspaceConfig {
  if (workspace.view !== "activity") return workspace;

  const unitOverrides = getUnitWorkspaceOverrides(workspace.id, unitId);

  return {
    ...workspace,
    ...unitOverrides,
    storageKey: getUnitScopedStorageKey(unitId, workspace.storageKey),
    imageKeys: workspace.imageKeys.map((imageKey) => getUnitScopedStorageKey(unitId, imageKey)),
    titleKey: getUnitScopedStorageKey(unitId, workspace.titleKey),
    timerKey: getUnitScopedStorageKey(unitId, workspace.timerKey),
    timerDefaultVersionKey: getUnitScopedStorageKey(unitId, workspace.timerDefaultVersionKey),
    pairsDefaultVersionKey:
      (unitOverrides.pairsDefaultVersionKey ?? workspace.pairsDefaultVersionKey)
        ? getUnitScopedStorageKey(
            unitId,
            unitOverrides.pairsDefaultVersionKey ?? workspace.pairsDefaultVersionKey ?? "",
          )
        : undefined,
  };
}

type AudioContextWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function normalizeTimerSettings(value: unknown): TimerSettings {
  const settings = value && typeof value === "object" ? (value as Partial<TimerSettings>) : {};
  return {
    minutes: Math.max(0, Math.min(99, Math.trunc(Number(settings.minutes) || 0))),
    seconds: Math.max(0, Math.min(59, Math.trunc(Number(settings.seconds) || 0))),
  };
}

function useTitle(
  storageKey: string,
  defaultTitle: string,
  legacyTitleMap: Record<string, string> = EMPTY_TITLE_MAP,
) {
  const [title, setTitle] = useState<string>(defaultTitle);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(false);
    try {
      const raw = localStorage.getItem(storageKey);
      const migratedTitle = raw ? (legacyTitleMap[raw] ?? raw) : defaultTitle;
      setTitle(migratedTitle);
      if (raw && migratedTitle !== raw) {
        localStorage.setItem(storageKey, migratedTitle);
      }
    } catch (error) {
      void error;
    }
    setIsLoaded(true);
  }, [defaultTitle, legacyTitleMap, storageKey]);
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(storageKey, title);
    } catch (error) {
      void error;
    }
  }, [isLoaded, storageKey, title]);
  return [title, setTitle] as const;
}

function useStoredChoice(storageKey: string, defaultValue: string, validValues: readonly string[]) {
  const [value, setValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    try {
      const raw = localStorage.getItem(storageKey);
      setValue(raw && validValues.includes(raw) ? raw : defaultValue);
    } catch (error) {
      void error;
      setValue(defaultValue);
    }
    setIsLoaded(true);
  }, [defaultValue, storageKey, validValues]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(storageKey, value);
    } catch (error) {
      void error;
    }
  }, [isLoaded, storageKey, value]);

  return [value, setValue] as const;
}

function useImages(storageKeys: readonly string[], defaultImages?: readonly string[]) {
  const getDefaultImageAt = useCallback(
    (index: number) => defaultImages?.[index] ?? DEFAULT_IMAGE,
    [defaultImages],
  );
  const [images, setImages] = useState<string[]>(() =>
    storageKeys.map((_, index) => getDefaultImageAt(index)),
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    try {
      setImages(
        storageKeys.map((storageKey, index) => {
          const storedImage = localStorage.getItem(storageKey);
          return storedImage && storedImage !== DEFAULT_IMAGE
            ? storedImage
            : getDefaultImageAt(index);
        }),
      );
    } catch (error) {
      void error;
      setImages(storageKeys.map((_, index) => getDefaultImageAt(index)));
    }
    setIsLoaded(true);
  }, [getDefaultImageAt, storageKeys]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      storageKeys.forEach((storageKey, index) => {
        const defaultImage = getDefaultImageAt(index);
        const image = images[index] || defaultImage;
        if (image && image !== defaultImage) localStorage.setItem(storageKey, image);
        else localStorage.removeItem(storageKey);
      });
    } catch (error) {
      void error;
    }
  }, [getDefaultImageAt, images, isLoaded, storageKeys]);

  return [images, setImages] as const;
}

function isSameTimer(a: TimerSettings, b: TimerSettings) {
  return a.minutes === b.minutes && a.seconds === b.seconds;
}

function useTimerSettings(
  storageKey: string,
  defaultVersionKey: string,
  defaultVersion: string,
  defaultTimer: TimerSettings,
  legacyDefaults: TimerSettings[],
) {
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(defaultTimer);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(false);
    try {
      const raw = localStorage.getItem(storageKey);
      const savedDefaultVersion = localStorage.getItem(defaultVersionKey);
      if (raw) {
        const saved = normalizeTimerSettings(JSON.parse(raw));
        const isOldDefault =
          savedDefaultVersion !== defaultVersion &&
          legacyDefaults.some((legacyTimer) => isSameTimer(saved, legacyTimer));
        setTimerSettings(isOldDefault ? defaultTimer : saved);
      } else {
        setTimerSettings(defaultTimer);
      }
      localStorage.setItem(defaultVersionKey, defaultVersion);
    } catch (error) {
      void error;
    }
    setIsLoaded(true);
  }, [defaultTimer, defaultVersion, defaultVersionKey, legacyDefaults, storageKey]);
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(timerSettings));
      localStorage.setItem(defaultVersionKey, defaultVersion);
    } catch (error) {
      void error;
    }
  }, [defaultVersion, defaultVersionKey, isLoaded, storageKey, timerSettings]);
  return [timerSettings, setTimerSettings] as const;
}

function playTone(ok: boolean) {
  try {
    const audioWindow = window as AudioContextWindow;
    const AC = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    if (ok) {
      o.frequency.setValueAtTime(523, ctx.currentTime);
      o.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      o.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      g.gain.setValueAtTime(0.25, ctx.currentTime);
    } else {
      o.type = "sawtooth";
      o.frequency.setValueAtTime(220, ctx.currentTime);
      o.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
    }
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start();
    o.stop(ctx.currentTime + 0.4);
  } catch (error) {
    void error;
  }
}

function usePairs(
  storageKey: string,
  defaultPairs: Pair[],
  defaultVersionKey?: string,
  defaultVersion?: string,
) {
  const [pairs, setPairs] = useState<Pair[]>(defaultPairs);
  const [isLoaded, setIsLoaded] = useState(false);
  const loadedStorageKeyRef = useRef<string | null>(null);
  useEffect(() => {
    setIsLoaded(false);
    loadedStorageKeyRef.current = null;
    try {
      const raw = localStorage.getItem(storageKey);
      const savedVersion = defaultVersionKey ? localStorage.getItem(defaultVersionKey) : undefined;
      const savedPairs = raw ? (JSON.parse(raw) as Pair[]) : undefined;
      const hasLegacyPairs = savedPairs?.some((pair) =>
        GROUP_WORK_LEGACY_SENTENCES.has(pair.label),
      );
      const hasGenericDefaultPairs =
        defaultVersion?.includes("unit") &&
        savedPairs?.some((pair) => GENERIC_DEFAULT_LABELS.has(pair.label));
      const shouldUseDefaultPairs =
        Boolean(defaultVersionKey && defaultVersion) &&
        (savedVersion !== defaultVersion ||
          Boolean(hasLegacyPairs) ||
          Boolean(hasGenericDefaultPairs));
      setPairs(shouldUseDefaultPairs ? defaultPairs : savedPairs || defaultPairs);
      if (defaultVersionKey && defaultVersion) {
        localStorage.setItem(defaultVersionKey, defaultVersion);
      }
    } catch (error) {
      void error;
    }
    loadedStorageKeyRef.current = storageKey;
    setIsLoaded(true);
  }, [defaultPairs, defaultVersion, defaultVersionKey, storageKey]);
  useEffect(() => {
    if (!isLoaded || loadedStorageKeyRef.current !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(pairs));
    } catch (error) {
      void error;
    }
  }, [isLoaded, pairs, storageKey]);
  return [pairs, setPairs] as const;
}

function Index() {
  const [tab, setTab] = useState<"home" | "settings">("home");
  const [workspaceId, setWorkspaceId] = useState<WorkspaceConfig["id"]>(DEFAULT_WORKSPACE_ID);
  const [unitStarCounts, setUnitStarCounts] = useState<Record<string, number>>({});
  const [unitId, setUnitId] = useStoredChoice(
    UNIT_STORAGE_KEY,
    DEFAULT_LEARNING_UNIT_ID,
    LEARNING_UNIT_IDS,
  );
  const selectedUnit = LEARNING_UNITS.find((unit) => unit.id === unitId) ?? LEARNING_UNITS[0];
  const baseWorkspace = WORKSPACES.find((item) => item.id === workspaceId) ?? WORKSPACES[0];
  const workspace = useMemo(
    () => scopeWorkspaceForUnit(baseWorkspace, selectedUnit.id),
    [baseWorkspace, selectedUnit.id],
  );

  useEffect(() => {
    try {
      REMOVED_STORAGE_KEYS.forEach((storageKey) => localStorage.removeItem(storageKey));
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    } catch (error) {
      void error;
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(UNIT_STAR_COUNTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, number>;
      setUnitStarCounts(
        Object.fromEntries(
          Object.entries(parsed).map(([key, value]) => [
            key,
            Math.max(0, Math.min(WORKSPACES.length, Math.trunc(Number(value) || 0))),
          ]),
        ),
      );
    } catch (error) {
      void error;
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(UNIT_STAR_COUNTS_KEY, JSON.stringify(unitStarCounts));
    } catch (error) {
      void error;
    }
  }, [unitStarCounts]);

  useEffect(() => {
    let cancelled = false;

    const requestMicrophonePermission = async () => {
      if (typeof window === "undefined") return;
      if (!navigator.mediaDevices?.getUserMedia) return;

      const permissionsApi = (
        navigator as Navigator & {
          permissions?: {
            query: (descriptor: { name: string }) => Promise<{ state: string }>;
          };
        }
      ).permissions;

      try {
        const permissionStatus = permissionsApi
          ? await permissionsApi.query({ name: "microphone" })
          : null;

        if (permissionStatus?.state === "granted" || permissionStatus?.state === "denied") {
          return;
        }
      } catch (error) {
        void error;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        void error;
      }
    };

    void requestMicrophonePermission();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectWorkspace = (id: WorkspaceConfig["id"]) => {
    setWorkspaceId(id);
    setTab("home");
  };

  const adjustCurrentUnitStars = useCallback(
    (delta: number) => {
      setUnitStarCounts((current) => {
        const currentCount = current[selectedUnit.id] ?? 0;
        const nextCount = Math.max(0, Math.min(WORKSPACES.length, currentCount + delta));
        return { ...current, [selectedUnit.id]: nextCount };
      });
    },
    [selectedUnit.id],
  );

  return (
    <div className="min-h-screen lg:flex bg-[#FFF8E7] font-[Fredoka,system-ui]">
      {/* Cute top banner decoration */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF8A65] via-[#4FC3F7] via-[#81C784] to-[#FFD54F] z-50" />
      <WorkspaceMenu activeWorkspaceId={workspace.id} onSelectWorkspace={selectWorkspace} />
      <div className="min-w-0 flex-1">
        <WorkspacePage
          key={`${selectedUnit.id}:${workspace.id}`}
          workspace={workspace}
          unitId={selectedUnit.id}
          onSelectUnit={setUnitId}
          starCount={unitStarCounts[selectedUnit.id] ?? 0}
          onAddStar={() => adjustCurrentUnitStars(1)}
          onRemoveStar={() => adjustCurrentUnitStars(-1)}
          tab={tab}
          setTab={setTab}
        />
      </div>
    </div>
  );
}

function WorkspacePage({
  workspace,
  unitId,
  onSelectUnit,
  starCount,
  onAddStar,
  onRemoveStar,
  tab,
  setTab,
}: {
  workspace: WorkspaceConfig;
  unitId: string;
  onSelectUnit: React.Dispatch<React.SetStateAction<string>>;
  starCount: number;
  onAddStar: () => void;
  onRemoveStar: () => void;
  tab: "home" | "settings";
  setTab: React.Dispatch<React.SetStateAction<"home" | "settings">>;
}) {
  if (workspace.view === "placeholder") {
    return (
      <WorkspaceShell
        title={workspace.defaultTitle}
        defaultTitle={workspace.defaultTitle}
        selectedUnitId={unitId}
        onSelectUnit={onSelectUnit}
        starCount={starCount}
        onAddStar={onAddStar}
        onRemoveStar={onRemoveStar}
        tab={tab}
        setTab={setTab}
      >
        {tab === "home" ? (
          <PlaceholderWorkspaceView
            title={workspace.defaultTitle}
            description={workspace.description}
          />
        ) : (
          <PlaceholderSettingsView title={workspace.defaultTitle} />
        )}
      </WorkspaceShell>
    );
  }

  const unitOverrides = getUnitWorkspaceOverrides(workspace.id, unitId);
  const effectiveDefaultPairs = unitOverrides.defaultPairs ?? workspace.defaultPairs;
  const effectiveDefaultImages = unitOverrides.defaultImages ?? workspace.defaultImages;
  const effectiveFixedPairCount = unitOverrides.fixedPairCount ?? workspace.fixedPairCount;
  const effectivePairsDefaultVersionKey = unitOverrides.pairsDefaultVersionKey
    ? getUnitScopedStorageKey(unitId, unitOverrides.pairsDefaultVersionKey)
    : workspace.pairsDefaultVersionKey;
  const effectivePairsDefaultVersion =
    unitOverrides.pairsDefaultVersion ?? workspace.pairsDefaultVersion;

  const [pairs, setPairs] = usePairs(
    workspace.storageKey,
    effectiveDefaultPairs,
    effectivePairsDefaultVersionKey,
    effectivePairsDefaultVersion,
  );
  const [images, setImages] = useImages(workspace.imageKeys, effectiveDefaultImages);
  const [title, setTitle] = useTitle(
    workspace.titleKey,
    workspace.defaultTitle,
    workspace.legacyTitleMap,
  );
  const [timerSettings, setTimerSettings] = useTimerSettings(
    workspace.timerKey,
    workspace.timerDefaultVersionKey,
    workspace.timerDefaultVersion,
    workspace.timerDefault,
    workspace.legacyTimerDefaults,
  );
  const [leftRole, setLeftRole] = useStoredChoice(
    getUnitScopedStorageKey(unitId, ROLE_PLAY_LEFT_ROLE_KEY),
    ROLE_PLAY_DEFAULT_LEFT_ROLE,
    ROLE_PLAY_ROLE_NAMES,
  );
  const [rightRole, setRightRole] = useStoredChoice(
    getUnitScopedStorageKey(unitId, ROLE_PLAY_RIGHT_ROLE_KEY),
    ROLE_PLAY_DEFAULT_RIGHT_ROLE,
    ROLE_PLAY_ROLE_NAMES,
  );

  useEffect(() => {
    const targetCount =
      workspace.imageLayout === "row4" ? workspace.imageKeys.length : effectiveFixedPairCount;
    if (!targetCount) return;

    setPairs((current) => {
      const trimmed = current.slice(0, targetCount);
      if (trimmed.length === targetCount) {
        return current.length === targetCount ? current : trimmed;
      }

      const additions = Array.from({ length: targetCount - trimmed.length }, (_, index) => {
        const fallbackPair = effectiveDefaultPairs[trimmed.length + index];
        return fallbackPair
          ? { ...fallbackPair }
          : {
              id: `${workspace.id}-label-${trimmed.length + index + 1}`,
              label: "",
              answer: "",
            };
      });

      return [...trimmed, ...additions];
    });
  }, [
    setPairs,
    effectiveDefaultPairs,
    effectiveFixedPairCount,
    workspace.id,
    workspace.imageKeys.length,
    workspace.imageLayout,
  ]);

  return (
    <WorkspaceShell
      title={title}
      defaultTitle={workspace.defaultTitle}
      selectedUnitId={unitId}
      onSelectUnit={onSelectUnit}
      starCount={starCount}
      onAddStar={onAddStar}
      onRemoveStar={onRemoveStar}
      tab={tab}
      setTab={setTab}
    >
      <>
        {tab === "home" ? (
          <GameView
            key={workspace.id}
            pairs={pairs}
            images={images}
            imageLayout={workspace.imageLayout}
            sentenceColumns={workspace.sentenceColumns}
            timerSettings={timerSettings}
            showDropTargets={workspace.showDropTargets}
            showAnswerTiles={workspace.showAnswerTiles}
            showGameReset={workspace.showGameReset}
            showPairBoard={workspace.showPairBoard}
            showTargetSentence={workspace.showTargetSentence}
            labelBoxesClickable={workspace.labelBoxesClickable}
            roleSelection={
              workspace.id === "role-play-work"
                ? {
                    leftRole,
                    rightRole,
                    setLeftRole,
                    setRightRole,
                  }
                : undefined
            }
          />
        ) : (
          <SettingsView
            key={workspace.id}
            pairs={pairs}
            setPairs={setPairs}
            images={images}
            setImages={setImages}
            defaultImages={effectiveDefaultImages}
            imageLayout={workspace.imageLayout}
            title={title}
            setTitle={setTitle}
            defaultTitle={workspace.defaultTitle}
            timerSettings={timerSettings}
            setTimerSettings={setTimerSettings}
            sentenceColumns={workspace.sentenceColumns}
            fixedPairCount={effectiveFixedPairCount}
            showAnswerFields={workspace.showAnswerTiles}
            sentenceEditorHelpText={workspace.sentenceEditorHelpText}
          />
        )}
      </>
    </WorkspaceShell>
  );
}

function WorkspaceShell({
  title,
  defaultTitle,
  selectedUnitId,
  onSelectUnit,
  starCount,
  onAddStar,
  onRemoveStar,
  tab,
  setTab,
  children,
}: {
  title: string;
  defaultTitle: string;
  selectedUnitId: string;
  onSelectUnit: React.Dispatch<React.SetStateAction<string>>;
  starCount: number;
  onAddStar: () => void;
  onRemoveStar: () => void;
  tab: "home" | "settings";
  setTab: React.Dispatch<React.SetStateAction<"home" | "settings">>;
  children: React.ReactNode;
}) {
  const clampedStarCount = Math.max(0, Math.min(WORKSPACES.length, starCount));

  return (
    <>
      <header className="border-b-4 border-[#FFCC80] bg-white/95 backdrop-blur-xl lg:fixed lg:inset-x-0 lg:top-0 lg:z-40 shadow-[0_4px_0_#FFE082]">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
            {/* Fun unit selector - looks like a school badge */}
            <label className="min-w-[210px] max-w-[320px] flex-1 sm:flex-none">
              <div className="relative">
                <div className="absolute -left-1 -top-1 text-2xl">📘</div>
                <select
                  value={selectedUnitId}
                  onChange={(event) => onSelectUnit(event.currentTarget.value)}
                  className="cartoon-button h-12 w-full truncate border-4 border-[#FFCC80] bg-[#FFF3D9] pl-8 pr-10 text-base font-bold text-[#3E2A1F] shadow-inner outline-none transition hover:border-[#FF8A65] focus:border-[#4FC3F7] focus:ring-4 focus:ring-[#4FC3F7]/30"
                >
                  {LEARNING_UNITS.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <div className="flex items-center gap-3">
              <h1>
                <button
                  type="button"
                  onClick={() => setTab("home")}
                  className="cartoon-title text-left text-4xl font-extrabold text-[#3E2A1F] tracking-tight transition hover:text-[#FF8A65] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4FC3F7]/40 active:scale-[0.985]"
                >
                  {title || defaultTitle}
                </button>
              </h1>
            </div>

          </div>

          {/* Fun Home / Settings tabs */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 rounded-full border-4 border-[#FFCC80] bg-[#FFF3D9] px-2 py-1 shadow-inner"
              aria-label={`Unit stars: ${clampedStarCount} of ${WORKSPACES.length}`}
            >
              <button
                type="button"
                onClick={onRemoveStar}
                disabled={clampedStarCount === 0}
                className="cartoon-button inline-flex h-8 w-8 items-center justify-center border-[#FFCC80] bg-white text-[#5C4A35] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Remove one star"
              >
                <Minus size={15} strokeWidth={3} />
              </button>
              <div className="flex min-w-[92px] justify-center gap-0.5 text-xl leading-none">
                {WORKSPACES.map((workspace) => (
                  <span
                    key={workspace.id}
                    className={
                      WORKSPACES.findIndex((item) => item.id === workspace.id) < clampedStarCount
                        ? "text-[#FFD54F] drop-shadow-[0_1px_0_#C47E00]"
                        : "text-[#D8C7A8]"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={onAddStar}
                disabled={clampedStarCount === WORKSPACES.length}
                className="cartoon-button inline-flex h-8 w-8 items-center justify-center border-[#FFCC80] bg-white text-[#5C4A35] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Add one star"
              >
                <Plus size={15} strokeWidth={3} />
              </button>
            </div>

            <nav className="flex gap-2 rounded-full bg-[#FFF3D9] p-1.5 border-4 border-[#FFCC80] shadow-inner">
            <button
              onClick={() => setTab("home")}
              className={`cartoon-button flex items-center gap-2 px-6 py-2.5 text-base font-bold transition ${
                tab === "home"
                  ? "bg-[#4FC3F7] text-white shadow-[0_4px_0_#2BA3D4] border-[#2BA3D4]"
                  : "bg-white text-[#3E2A1F] hover:bg-white border-[#FFCC80] hover:border-[#FFD54F]"
              }`}
            >
              <HomeIcon size={18} /> Home
            </button>
            <button
              onClick={() => setTab("settings")}
              className={`cartoon-button flex items-center gap-2 px-6 py-2.5 text-base font-bold transition ${
                tab === "settings"
                  ? "bg-[#FF8A65] text-white shadow-[0_4px_0_#E36A4E] border-[#E36A4E]"
                  : "bg-white text-[#3E2A1F] hover:bg-white border-[#FFCC80] hover:border-[#FFD54F]"
              }`}
            >
              <SettingsIcon size={18} /> Settings
            </button>
            </nav>
          </div>
        </div>
      </header>
      <main className={`${APP_FRAME_MAX_WIDTH_CLASS} mx-auto px-6 py-5 lg:pt-[110px]`}>
        {children}
      </main>
    </>
  );
}

function RolePlayRoleSelector({
  selectedRole,
  avatarSrc,
  isActive,
  onActivate,
}: {
  selectedRole: string;
  avatarSrc: string;
  isActive: boolean;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      aria-label={`Role panel for ${selectedRole}`}
      onClick={onActivate}
      className={`relative w-[220px] max-w-full shrink-0 overflow-hidden rounded-3xl border-4 px-4 py-3 text-left transition-all xl:w-[300px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4FC3F7]/40 ${
        isActive
          ? "z-10 -translate-y-0.5 border-[#FF8A65] bg-gradient-to-br from-[#FFF3D9] via-[#FFE082] to-[#FFCC80] shadow-[0_0_0_6px_rgba(255,138,101,0.25),0_14px_28px_rgba(0,0,0,0.12)]"
          : "border-[#FFCC80] bg-white/90 opacity-75 grayscale-[0.2] hover:-translate-y-0.5 hover:border-[#FFD54F] hover:opacity-100 hover:grayscale-0 shadow-sm"
      }`}
    >
      {isActive && (
        <span className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FF8A65] text-white shadow-[0_4px_0_#E36A4E] ring-4 ring-white/60">
          <Check size={18} strokeWidth={4} />
        </span>
      )}
      <div
        className={`pointer-events-none absolute inset-x-10 top-0 h-16 rounded-full blur-3xl ${
          isActive ? "bg-amber-100/80" : "bg-amber-100/20"
        }`}
      />
      <div
        className={`pointer-events-none absolute -right-5 top-8 h-20 w-20 rounded-full blur-2xl ${
          isActive ? "bg-orange-200/45" : "bg-orange-100/15"
        }`}
      />
      <div className="relative z-10 flex justify-center">
        <span
          className={`relative flex h-16 w-16 overflow-hidden rounded-full border-[4px] bg-white transition ${
            isActive
              ? "border-white shadow-[0_0_0_7px_rgba(255,255,255,0.56),0_16px_30px_rgba(146,90,16,0.24)]"
              : "border-amber-50 shadow-[0_0_0_4px_rgba(252,225,170,0.22),0_10px_18px_rgba(170,126,54,0.1)]"
          }`}
        >
          <img src={avatarSrc} alt="Role avatar" className="h-full w-full object-cover" />
        </span>
      </div>
    </button>
  );
}

function WorkspaceMenu({
  activeWorkspaceId,
  onSelectWorkspace,
}: {
  activeWorkspaceId: WorkspaceConfig["id"];
  onSelectWorkspace: (id: WorkspaceConfig["id"]) => void;
}) {
  // Fun cartoon icons for each activity
  const workspaceEmojis: Record<string, string> = {
    "follow-work": "👂",
    "match-master": "🧩",
    "group-work": "📖",
    "role-play-work": "🎭",
  };

  const workspaceColors: Record<string, string> = {
    "follow-work": "from-[#A5D6A7] to-[#81C784] border-[#66BB6A]",
    "match-master": "from-[#FFCC80] to-[#FFB74D] border-[#FFA726]",
    "group-work": "from-[#90CAF9] to-[#64B5F6] border-[#42A5F5]",
    "role-play-work": "from-[#CE93D8] to-[#BA68C8] border-[#AB47BC]",
  };

  return (
    <aside className="border-b-4 border-[#FFCC80] bg-[#FFF3D9]/80 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-[224px] lg:shrink-0 lg:border-b-0 lg:border-r-4">
      <div className="px-4 py-5 lg:px-4 lg:pb-8 lg:pt-[108px]">
        <div className="rounded-3xl border-4 border-[#FFCC80] bg-white p-3 shadow-[0_8px_0_#FFE082] fun-shadow">
          <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {WORKSPACES.map((workspace, index) => {
              const active = workspace.id === activeWorkspaceId;
              const emoji = workspaceEmojis[workspace.id] || "⭐";
              const colorClass = workspaceColors[workspace.id] || "from-yellow-200 to-orange-200";

              return (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => onSelectWorkspace(workspace.id)}
                  className={`group relative flex min-h-[82px] items-center gap-2.5 rounded-2xl border-4 px-3 py-3.5 text-left text-base font-extrabold transition-all active:scale-[0.985] ${active
                    ? `border-[#FF8A65] bg-gradient-to-br ${colorClass} text-[#2F2A1F] shadow-[0_6px_0_#E67E22] scale-[1.01]`
                    : "border-[#FFCC80] bg-white text-[#5C4A35] hover:border-[#FFD54F] hover:bg-[#FFF8E7] hover:scale-[1.02] shadow-sm"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-3xl transition ${active ? "bg-white/70" : "bg-[#FFF3D9] group-hover:bg-white"}`}>
                    {emoji}
                  </div>
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="text-[10px] font-bold uppercase tracking-[2px] opacity-60">0{index + 1}</div>
                    <div className="mt-0.5 text-lg leading-tight [overflow-wrap:anywhere]">{workspace.label}</div>
                  </div>
                  {active && <div className="pointer-events-none absolute bottom-2 right-2 text-lg">👟</div>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}

function PlaceholderWorkspaceView({ title, description }: { title: string; description: string }) {
  return (
    <section className="cartoon-card border-[#FFCC80] bg-white p-10">
      <div className="max-w-2xl">
        <div className="inline-block rounded-full bg-[#FFE082] px-4 py-1 text-xs font-extrabold tracking-[2px] text-[#3E2A1F]">⭐ ACTIVITY ⭐</div>
        <h2 className="mt-4 text-4xl font-extrabold text-[#3E2A1F]">{title}</h2>
        <p className="mt-4 text-lg leading-relaxed text-[#6B5C4A]">{description}</p>
        <div className="mt-6 text-5xl">🦊📚</div>
      </div>
    </section>
  );
}

function PlaceholderSettingsView({ title }: { title: string }) {
  return (
    <section className="cartoon-card mx-auto max-w-2xl border-[#FFCC80] bg-white p-10 text-center">
      <div className="text-6xl mb-4">⚙️</div>
      <h2 className="text-3xl font-extrabold text-[#3E2A1F]">{title} settings</h2>
      <p className="mt-4 text-lg text-[#6B5C4A]">
        This workspace is available in the menu, but it does not have editable settings yet.
      </p>
      <div className="mt-8 text-4xl opacity-70">🖍️</div>
    </section>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getDropZonePairIdAtPoint(x: number, y: number) {
  const element = document.elementFromPoint(x, y);
  const dropZone = element?.closest<HTMLElement>("[data-drop-zone-pair-id]");
  return dropZone?.dataset.dropZonePairId ?? null;
}

function shuffleAnswers(pairs: Pair[]) {
  const answers = pairs.map((p) => p.answer);
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }
  return answers;
}

function normalizeSpeechText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSpeechWords(value: string) {
  const normalized = normalizeSpeechText(value);
  return normalized ? normalized.split(" ") : [];
}

function getSentenceWordTokens(targetSentence: string, transcript: string): SentenceWordToken[] {
  const targetTokens = targetSentence
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((text) => ({
      normalized: normalizeSpeechText(text),
      text,
    }));
  const transcriptWords = getSpeechWords(transcript);

  if (targetTokens.length === 0) return [];
  if (transcriptWords.length === 0) {
    return targetTokens.map((token) => ({
      text: token.text,
      tone: token.normalized ? "wrong" : "neutral",
    }));
  }

  const rowCount = targetTokens.length + 1;
  const columnCount = transcriptWords.length + 1;
  const distance = Array.from({ length: rowCount }, () => Array<number>(columnCount).fill(0));

  for (let row = 0; row < rowCount; row++) distance[row][0] = row;
  for (let column = 0; column < columnCount; column++) distance[0][column] = column;

  for (let row = 1; row < rowCount; row++) {
    for (let column = 1; column < columnCount; column++) {
      const cost = targetTokens[row - 1].normalized === transcriptWords[column - 1] ? 0 : 1;
      distance[row][column] = Math.min(
        distance[row - 1][column] + 1,
        distance[row][column - 1] + 1,
        distance[row - 1][column - 1] + cost,
      );
    }
  }

  const tones: SentenceWordTone[] = targetTokens.map((token) =>
    token.normalized ? "wrong" : "neutral",
  );
  let row = targetTokens.length;
  let column = transcriptWords.length;

  while (row > 0 || column > 0) {
    if (row > 0 && column > 0) {
      const isMatch = targetTokens[row - 1].normalized === transcriptWords[column - 1];
      const substitutionCost = isMatch ? 0 : 1;
      if (distance[row][column] === distance[row - 1][column - 1] + substitutionCost) {
        tones[row - 1] = targetTokens[row - 1].normalized
          ? isMatch
            ? "correct"
            : "wrong"
          : "neutral";
        row--;
        column--;
        continue;
      }
    }
    if (column > 0 && distance[row][column] === distance[row][column - 1] + 1) {
      column--;
      continue;
    }
    row--;
  }

  return targetTokens.map((token, index) => ({ text: token.text, tone: tones[index] }));
}

function wordEditDistance(source: string[], target: string[]) {
  const previous = Array.from({ length: target.length + 1 }, (_, index) => index);
  const current = new Array<number>(target.length + 1);

  for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex++) {
    current[0] = sourceIndex;
    for (let targetIndex = 1; targetIndex <= target.length; targetIndex++) {
      const cost = source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1;
      current[targetIndex] = Math.min(
        current[targetIndex - 1] + 1,
        previous[targetIndex] + 1,
        previous[targetIndex - 1] + cost,
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[target.length];
}

function scoreSpeech(targetSentence: string, transcript: string): SpeechScoreResult {
  const targetWords = getSpeechWords(targetSentence);
  const transcriptWords = getSpeechWords(transcript);
  if (targetWords.length === 0 || transcriptWords.length === 0) {
    return {
      feedback: "没有识别到有效朗读，请再试一次。",
      score: 0,
      tone: "practice",
    };
  }

  const distance = wordEditDistance(targetWords, transcriptWords);
  const denominator = Math.max(targetWords.length, transcriptWords.length);
  const score = Math.max(0, Math.min(100, Math.round((1 - distance / denominator) * 100)));

  if (score >= 90) {
    return {
      feedback: "读得很完整，发音和目标句子非常接近。",
      score,
      tone: "great",
    };
  }
  if (score >= 75) {
    return {
      feedback: "整体不错，再注意单词清晰度和完整度。",
      score,
      tone: "pass",
    };
  }
  return {
    feedback: "再试一次，放慢速度，把每个单词读完整。",
    score,
    tone: "practice",
  };
}

function getSpeechRecognitionConstructor() {
  const speechWindow = window as SpeechRecognitionWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function useSpeakingPractice(
  targetSentence: string,
  onResult?: (tone: SpeechScoreTone) => void,
  resetSignal = 0,
): SpeakingPracticeController {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);
  const tryAgainAudioRef = useRef<HTMLAudioElement | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [scoreResult, setScoreResult] = useState<SpeechScoreResult | null>(null);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setErrorMessage("");
    setIsListening(false);
    setScoreResult(null);
    setTranscript("");
  }, [resetSignal, targetSentence]);

  useEffect(() => {
    correctAudioRef.current = new Audio(correctSound);
    tryAgainAudioRef.current = new Audio(tryAgainSound);
    correctAudioRef.current.preload = "auto";
    tryAgainAudioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      correctAudioRef.current?.pause();
      tryAgainAudioRef.current?.pause();
    };
  }, []);

  const resetAudio = useCallback((audio: HTMLAudioElement) => {
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch (error) {
      void error;
    }
  }, []);

  const primeResultAudio = useCallback(() => {
    const audios = [correctAudioRef.current, tryAgainAudioRef.current].filter(
      (audio): audio is HTMLAudioElement => Boolean(audio),
    );

    audios.forEach((audio) => {
      audio.muted = true;
      void audio
        .play()
        .then(() => {
          resetAudio(audio);
          audio.muted = false;
        })
        .catch(() => {
          audio.muted = false;
        });
    });
  }, [resetAudio]);

  const playResultAudio = useCallback(
    (tone: SpeechScoreTone) => {
      const audio =
        tone === "great" || tone === "pass" ? correctAudioRef.current : tryAgainAudioRef.current;
      if (!audio) return;

      resultAudioRef.current?.pause();
      resultAudioRef.current = audio;
      resetAudio(audio);
      audio.muted = false;
      audio.play().catch(() => {});
    },
    [resetAudio],
  );

  useEffect(() => {
    if (scoreResult) playResultAudio(scoreResult.tone);
  }, [playResultAudio, scoreResult]);

  const applyScore = useCallback(
    (spokenText: string) => {
      const cleanTranscript = spokenText.trim();
      setTranscript(cleanTranscript);
      const nextScoreResult = scoreSpeech(targetSentence, cleanTranscript);
      setScoreResult(nextScoreResult);
      onResult?.(nextScoreResult.tone);
    },
    [onResult, targetSentence],
  );

  const toggleScoring = useCallback(() => {
    if (!targetSentence.trim()) {
      setErrorMessage("请先选择一句要朗读的句子。");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    primeResultAudio();

    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setErrorMessage("当前浏览器不支持语音识别。请使用 Chrome 后再试。");
      setScoreResult(null);
      setTranscript("");
      return;
    }

    const recognition = new Recognition();
    let latestTranscript = "";
    let hadError = false;
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const parts: string[] = [];
      for (let index = 0; index < event.results.length; index++) {
        const transcriptPart = event.results[index][0]?.transcript;
        if (transcriptPart) parts.push(transcriptPart);
      }
      latestTranscript = parts.join(" ").trim();
      setTranscript(latestTranscript);
    };
    recognition.onerror = (event) => {
      hadError = true;
      setIsListening(false);
      const isPermissionError =
        event.error === "not-allowed" || event.error === "service-not-allowed";
      setErrorMessage(
        isPermissionError
          ? "麦克风权限未开启。请允许浏览器使用麦克风后再试。"
          : "语音识别失败，请确认麦克风可用后再试。",
      );
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (hadError) return;
      if (!latestTranscript) {
        setErrorMessage("没有识别到朗读内容，请靠近麦克风再试一次。");
        setScoreResult(null);
        return;
      }
      setErrorMessage("");
      applyScore(latestTranscript);
    };

    setErrorMessage("");
    setScoreResult(null);
    setTranscript("");
    setIsListening(true);
    try {
      recognition.start();
    } catch (error) {
      void error;
      setIsListening(false);
      setErrorMessage("语音识别无法启动，请稍后再试。");
    }
  }, [applyScore, isListening, primeResultAudio, targetSentence]);

  return {
    errorMessage,
    isListening,
    scoreResult,
    sentenceWordTokens: getSentenceWordTokens(targetSentence, transcript),
    toggleScoring,
    transcript,
  };
}

function GameView({
  pairs,
  images,
  imageLayout,
  sentenceColumns,
  timerSettings,
  showDropTargets,
  showAnswerTiles,
  showGameReset,
  showPairBoard,
  showTargetSentence,
  labelBoxesClickable,
  roleSelection,
}: {
  pairs: Pair[];
  images: string[];
  imageLayout: "single" | "row4";
  sentenceColumns: 1 | 2;
  timerSettings: TimerSettings;
  showDropTargets: boolean;
  showAnswerTiles: boolean;
  showGameReset: boolean;
  showPairBoard: boolean;
  showTargetSentence: boolean;
  labelBoxesClickable: boolean;
  roleSelection?: RoleSelectionState;
}) {
  const [status, setStatus] = useState<Record<string, "correct" | "wrong" | undefined>>({});
  const [speakSequenceIndex, setSpeakSequenceIndex] = useState(0);
  const [speakCelebrating, setSpeakCelebrating] = useState(false);
  const [used, setUsed] = useState<Record<string, boolean>>({});
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selectedPairId, setSelectedPairId] = useState<string | null>(() =>
    showTargetSentence ? (pairs[0]?.id ?? null) : null,
  );
  const [draggingAnswer, setDraggingAnswer] = useState<string | null>(null);
  const [pointerDragPreview, setPointerDragPreview] = useState<PointerDragPreview | null>(null);
  const [activeDropZoneId, setActiveDropZoneId] = useState<string | null>(null);
  const pointerDragRef = useRef<PointerAnswerDrag | null>(null);
  const [shuffled, setShuffled] = useState(() => pairs.map((p) => p.answer));
  const timerDurationSeconds = timerSettings.minutes * 60 + timerSettings.seconds;
  const [remainingSeconds, setRemainingSeconds] = useState(timerDurationSeconds);
  const [timerRunning, setTimerRunning] = useState(false);
  const speakCelebrationTimerRef = useRef<number | null>(null);
  const [practiceResetKey, setPracticeResetKey] = useState(0);
  const followAudioRef = useRef<HTMLAudioElement | null>(null);
  const followSpeechTokenRef = useRef(0);
  const [speakingCardIndex, setSpeakingCardIndex] = useState<number | null>(null);
  const [activeRoleColumn, setActiveRoleColumn] = useState<number | null>(null);
  const [speakingRoleColumn, setSpeakingRoleColumn] = useState<number | null>(null);
  const [speakingRolePairId, setSpeakingRolePairId] = useState<string | null>(null);
  const roleAudioRef = useRef<HTMLAudioElement | null>(null);
  const roleSpeechTokenRef = useRef(0);
  const roleSpeakerTimeoutRef = useRef<number | null>(null);
  const roleResponseTimeoutRef = useRef<number | null>(null);
  const pendingRolePracticePairIdRef = useRef<string | null>(null);
  const isMultiImageRow = imageLayout === "row4" && !showPairBoard;

  const allCorrect = pairs.length > 0 && pairs.every((p) => status[p.id] === "correct");

  useEffect(() => {
    setShuffled(shuffleAnswers(pairs));
    setSpeakSequenceIndex(0);
    setSpeakCelebrating(false);
    setSelectedPairId((current) => {
      const pairIds = new Set(pairs.map((pair) => pair.id));
      if (current && pairIds.has(current)) return current;
      return showTargetSentence ? (pairs[0]?.id ?? null) : null;
    });
  }, [pairs, showTargetSentence]);

  useEffect(() => {
    setTimerRunning(false);
    setRemainingSeconds(timerDurationSeconds);
  }, [timerDurationSeconds]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (timerRunning && remainingSeconds === 0) {
      setTimerRunning(false);
    }
  }, [remainingSeconds, timerRunning]);

  useEffect(() => {
    return () => {
      if (speakCelebrationTimerRef.current) {
        window.clearTimeout(speakCelebrationTimerRef.current);
      }
      if (roleSpeakerTimeoutRef.current) {
        window.clearTimeout(roleSpeakerTimeoutRef.current);
      }
      if (roleResponseTimeoutRef.current) {
        window.clearTimeout(roleResponseTimeoutRef.current);
      }
      followSpeechTokenRef.current += 1;
      roleSpeechTokenRef.current += 1;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      followAudioRef.current?.pause();
      followAudioRef.current = null;
      roleAudioRef.current?.pause();
      roleAudioRef.current = null;
      setSpeakingRoleColumn(null);
      setSpeakingRolePairId(null);
    };
  }, []);

  const clearAnswerDrag = useCallback(() => {
    pointerDragRef.current = null;
    setDraggingAnswer(null);
    setPointerDragPreview(null);
    setActiveDropZoneId(null);
  }, []);

  const reset = () => {
    setStatus({});
    setUsed({});
    setPlaced({});
    setSelectedPairId(showTargetSentence ? (pairs[0]?.id ?? null) : null);
    clearAnswerDrag();
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setRemainingSeconds(timerDurationSeconds);
  };

  const onDrop = useCallback(
    (pairId: string, answer: string) => {
      const pair = pairs.find((p) => p.id === pairId);
      if (!pair || status[pairId] === "correct") return;
      const ok = pair.answer.trim().toLowerCase() === answer.trim().toLowerCase();
      setPlaced((current) => ({ ...current, [pairId]: answer }));
      setStatus((s) => ({ ...s, [pairId]: ok ? "correct" : "wrong" }));
      if (ok) setUsed((u) => ({ ...u, [answer]: true }));
      playTone(ok);
      if (!ok) {
        setTimeout(() => {
          setStatus((s) => ({ ...s, [pairId]: undefined }));
          setPlaced((current) => {
            const next = { ...current };
            delete next[pairId];
            return next;
          });
        }, 900);
      }
    },
    [pairs, status],
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const pointerDrag = pointerDragRef.current;
      if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
      const nextPreview = {
        answer: pointerDrag.answer,
        x: event.clientX,
        y: event.clientY,
      };
      pointerDragRef.current = { ...nextPreview, pointerId: event.pointerId };
      setPointerDragPreview(nextPreview);
      setActiveDropZoneId(getDropZonePairIdAtPoint(event.clientX, event.clientY));
      event.preventDefault();
    };

    const handlePointerUp = (event: PointerEvent) => {
      const pointerDrag = pointerDragRef.current;
      if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
      const pairId = getDropZonePairIdAtPoint(event.clientX, event.clientY);
      if (pairId) onDrop(pairId, pointerDrag.answer);
      clearAnswerDrag();
      event.preventDefault();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", clearAnswerDrag);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", clearAnswerDrag);
    };
  }, [clearAnswerDrag, onDrop]);

  const startPointerAnswerDrag = (answer: string, event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const pointerDrag = {
      answer,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    pointerDragRef.current = pointerDrag;
    setDraggingAnswer(answer);
    setPointerDragPreview(pointerDrag);
    setActiveDropZoneId(null);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
    event.preventDefault();
  };

  const handleNativeAnswerDragChange = (answer: string | null) => {
    pointerDragRef.current = null;
    setPointerDragPreview(null);
    setActiveDropZoneId(null);
    setDraggingAnswer(answer);
  };

  const toggleLabelBox = (pairId: string, columnIndex?: number) => {
    if (!labelBoxesClickable) return;
    if (showRoleSelectors) {
      if (activeRoleColumn == null) return;
      if (typeof columnIndex !== "number" || columnIndex !== activeRoleColumn) return;
    }
    setSelectedPairId(pairId);
  };

  const triggerSpeakCelebration = useCallback(() => {
    if (speakCelebrationTimerRef.current) {
      window.clearTimeout(speakCelebrationTimerRef.current);
    }
    const audio = new Audio(victorySound);
    audio.play().catch(() => {});
    setSpeakCelebrating(false);
    window.setTimeout(() => setSpeakCelebrating(true), 0);
    speakCelebrationTimerRef.current = window.setTimeout(
      () => {
        setSpeakCelebrating(false);
        speakCelebrationTimerRef.current = null;
      },
      (CELEBRATION_BASE_SECONDS + CELEBRATION_EXTRA_SECONDS) * 1000,
    );
  }, []);

  const updateSpeakResult = (pairId: string, passed: boolean) => {
    if (!passed) {
      setSpeakSequenceIndex(0);
      return;
    }

    const expectedPair = pairs[speakSequenceIndex];
    if (!expectedPair || expectedPair.id !== pairId) {
      setSpeakSequenceIndex(pairs[0]?.id === pairId ? 1 : 0);
      return;
    }

    const nextIndex = speakSequenceIndex + 1;
    if (nextIndex >= pairs.length) {
      setSpeakSequenceIndex(0);
      triggerSpeakCelebration();
      return;
    }

    setSpeakSequenceIndex(nextIndex);
  };

  const stopFollowAudio = useCallback(() => {
    if (!followAudioRef.current) return;
    followAudioRef.current.onended = null;
    followAudioRef.current.onerror = null;
    followAudioRef.current.pause();
    followAudioRef.current = null;
  }, []);

  const stopRoleAudio = useCallback(() => {
    if (!roleAudioRef.current) return;
    roleAudioRef.current.onended = null;
    roleAudioRef.current.onerror = null;
    roleAudioRef.current.pause();
    roleAudioRef.current = null;
  }, []);

  const speakFollowLabel = useCallback(
    (text: string, index: number) => {
      const phrase = text.trim();
      if (!phrase) return;
      if (typeof window === "undefined") {
        return;
      }

      followSpeechTokenRef.current += 1;
      const token = followSpeechTokenRef.current;
      stopFollowAudio();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      setSpeakingCardIndex(index);
      if (typeof SpeechSynthesisUtterance !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = "en-US";
        utterance.pitch = 1;
        utterance.rate = 0.82;
        utterance.onend = () => {
          if (followSpeechTokenRef.current !== token) return;
          setSpeakingCardIndex(null);
        };
        utterance.onerror = () => {
          if (followSpeechTokenRef.current !== token) return;
          setSpeakingCardIndex(null);
        };
        window.speechSynthesis.speak(utterance);
        return;
      }

      const fallbackAudioSrc = FOLLOW_AUDIO_BY_LABEL[phrase.toLowerCase()];
      if (!fallbackAudioSrc) {
        setSpeakingCardIndex(null);
        return;
      }

      const audio = new Audio(fallbackAudioSrc);
      audio.preload = "auto";
      audio.onended = () => {
        if (followSpeechTokenRef.current !== token) return;
        followAudioRef.current = null;
        setSpeakingCardIndex(null);
      };
      audio.onerror = () => {
        if (followSpeechTokenRef.current !== token) return;
        followAudioRef.current = null;
        setSpeakingCardIndex(null);
      };
      followAudioRef.current = audio;
      audio.play().catch(() => {
        if (followSpeechTokenRef.current !== token) return;
        followAudioRef.current = null;
        setSpeakingCardIndex(null);
      });
    },
    [stopFollowAudio],
  );

  const speakRoleSentence = useCallback(
    (text: string, columnIndex: number, pairId: string, onComplete?: () => void) => {
      const phrase = text.trim();
      if (!phrase || typeof window === "undefined") return;

      roleSpeechTokenRef.current += 1;
      const token = roleSpeechTokenRef.current;
      const startedAt = Date.now();
      stopRoleAudio();
      if (roleSpeakerTimeoutRef.current) {
        window.clearTimeout(roleSpeakerTimeoutRef.current);
        roleSpeakerTimeoutRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      setSpeakingRoleColumn(columnIndex);
      setSpeakingRolePairId(pairId);
      const clearRoleSpeaker = () => {
        if (roleSpeechTokenRef.current !== token) return;
        const remainingMs = Math.max(0, ROLE_SPEAKER_MIN_VISIBLE_MS - (Date.now() - startedAt));
        if (remainingMs > 0) {
          roleSpeakerTimeoutRef.current = window.setTimeout(() => {
            if (roleSpeechTokenRef.current !== token) return;
            roleSpeakerTimeoutRef.current = null;
            setSpeakingRoleColumn(null);
            setSpeakingRolePairId(null);
            onComplete?.();
          }, remainingMs);
          return;
        }
        setSpeakingRoleColumn(null);
        setSpeakingRolePairId(null);
        onComplete?.();
      };

      if (typeof SpeechSynthesisUtterance !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = "en-US";
        utterance.pitch = 1;
        utterance.rate = 0.84;
        utterance.onend = () => {
          clearRoleSpeaker();
        };
        utterance.onerror = () => {
          clearRoleSpeaker();
        };
        window.speechSynthesis.speak(utterance);
        return;
      }

      clearRoleSpeaker();
    },
    [stopRoleAudio],
  );

  const selectedSentence = pairs.find((pair) => pair.id === selectedPairId)?.label;
  const followCardLabels = images.map(
    (_, index) => pairs[index]?.label.trim() || `Name ${index + 1}`,
  );
  const sentenceColumnSize =
    sentenceColumns === 2 ? Math.ceil(pairs.length / sentenceColumns) : pairs.length;
  const sentencePairsByColumn =
    sentenceColumns === 2
      ? [
          pairs.slice(0, sentenceColumnSize),
          pairs.slice(sentenceColumnSize, sentenceColumnSize * 2),
        ]
      : [pairs];
  const showRoleSelectors = sentenceColumns === 2 && Boolean(roleSelection);
  const rolePlaySentenceRows = showRoleSelectors
    ? Array.from({
        length: Math.max(
          sentencePairsByColumn[0]?.length ?? 0,
          sentencePairsByColumn[1]?.length ?? 0,
        ),
      }).flatMap((_, rowIndex) =>
        [0, 1]
          .map((columnIndex) => {
            const pair = sentencePairsByColumn[columnIndex]?.[rowIndex];
            return pair ? { columnIndex, pair } : null;
          })
          .filter((item): item is { columnIndex: number; pair: Pair } => Boolean(item)),
      )
    : [];
  const resolvedRoleColumnIndex = activeRoleColumn;
  const activeRolePairs =
    showRoleSelectors && resolvedRoleColumnIndex != null
      ? (sentencePairsByColumn[resolvedRoleColumnIndex] ?? [])
      : [];
  const roleRoundComplete =
    activeRolePairs.length > 0 && activeRolePairs.every((pair) => status[pair.id] === "correct");

  useEffect(() => {
    if (!allCorrect && !roleRoundComplete) return;
    triggerSpeakCelebration();
  }, [allCorrect, roleRoundComplete, triggerSpeakCelebration]);

  const playRoleResponseAndAdvance = useCallback(() => {
    const currentColumnIndex = resolvedRoleColumnIndex;
    if (currentColumnIndex == null || !selectedPairId) return;

    const currentColumnPairs = sentencePairsByColumn[currentColumnIndex] ?? [];
    if (!currentColumnPairs.length) return;

    const currentIndex = currentColumnPairs.findIndex((pair) => pair.id === selectedPairId);
    if (currentIndex < 0) return;

    const responseColumnIndex =
      sentencePairsByColumn.length === 2 ? (currentColumnIndex === 0 ? 1 : 0) : currentColumnIndex;
    const responsePair = sentencePairsByColumn[responseColumnIndex]?.[currentIndex];
    const nextPair = currentColumnPairs[currentIndex + 1] ?? null;
    const advanceToNextPair = () => {
      if (!nextPair) return;
      pendingRolePracticePairIdRef.current = null;
      setSelectedPairId(nextPair.id);
    };

    if (roleResponseTimeoutRef.current) {
      window.clearTimeout(roleResponseTimeoutRef.current);
      roleResponseTimeoutRef.current = null;
    }

    if (sentencePairsByColumn.length === 2 && currentColumnIndex === 1) {
      roleResponseTimeoutRef.current = window.setTimeout(() => {
        roleResponseTimeoutRef.current = null;
        if (!nextPair?.id) return;

        pendingRolePracticePairIdRef.current = null;
        setSelectedPairId(nextPair.id);

        const nextPreviewPair = sentencePairsByColumn[0]?.[currentIndex + 1];
        if (nextPreviewPair?.label && nextPreviewPair.id) {
          speakRoleSentence(nextPreviewPair.label, 0, nextPreviewPair.id);
        }
      }, ROLE_RESPONSE_PLAY_DELAY_MS);
      return;
    }

    if (responsePair?.label && responsePair.id) {
      roleResponseTimeoutRef.current = window.setTimeout(() => {
        roleResponseTimeoutRef.current = null;
        speakRoleSentence(
          responsePair.label,
          responseColumnIndex,
          responsePair.id,
          advanceToNextPair,
        );
      }, ROLE_RESPONSE_PLAY_DELAY_MS);
      return;
    }

    roleResponseTimeoutRef.current = window.setTimeout(() => {
      roleResponseTimeoutRef.current = null;
      advanceToNextPair();
    }, ROLE_RESPONSE_PLAY_DELAY_MS);
  }, [resolvedRoleColumnIndex, selectedPairId, sentencePairsByColumn, speakRoleSentence]);

  const handleSpeakingResult = useCallback(
    (tone: SpeechScoreTone) => {
      if (!selectedPairId) return;
      const passed = tone === "great" || tone === "pass";

      if (showRoleSelectors) {
        setStatus((current) => ({ ...current, [selectedPairId]: passed ? "correct" : "wrong" }));
        if (passed) {
          pendingRolePracticePairIdRef.current = null;
          playRoleResponseAndAdvance();
        }
        return;
      }

      updateSpeakResult(selectedPairId, passed);
    },
    [playRoleResponseAndAdvance, selectedPairId, showRoleSelectors, updateSpeakResult],
  );
  const speakingPractice = useSpeakingPractice(
    showTargetSentence ? (selectedSentence ?? "") : "",
    handleSpeakingResult,
    practiceResetKey,
  );

  const activateRoleColumn = useCallback(
    (columnIndex: number) => {
      setActiveRoleColumn(columnIndex);
      pendingRolePracticePairIdRef.current = null;
      if (roleResponseTimeoutRef.current) {
        window.clearTimeout(roleResponseTimeoutRef.current);
        roleResponseTimeoutRef.current = null;
      }
      if (speakCelebrationTimerRef.current) {
        window.clearTimeout(speakCelebrationTimerRef.current);
        speakCelebrationTimerRef.current = null;
      }
      stopRoleAudio();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakCelebrating(false);
      setStatus({});
      setPracticeResetKey((current) => current + 1);
      setSpeakingRoleColumn(null);
      setSpeakingRolePairId(null);

      const previewColumnIndex =
        sentencePairsByColumn.length === 2 ? (columnIndex === 0 ? 1 : 0) : columnIndex;
      const previewColumnPairs = sentencePairsByColumn[previewColumnIndex] ?? [];

      const previewPair = previewColumnPairs[0];
      if (
        showRoleSelectors &&
        sentencePairsByColumn.length === 2 &&
        columnIndex === 1 &&
        previewPair?.label &&
        previewPair.id
      ) {
        speakRoleSentence(previewPair.label, previewColumnIndex, previewPair.id);
      }
    },
    [sentencePairsByColumn, showRoleSelectors, speakRoleSentence, stopRoleAudio],
  );

  const startRolePractice = useCallback(
    (pairId: string, columnIndex: number) => {
      setActiveRoleColumn(columnIndex);
      if (roleResponseTimeoutRef.current) {
        window.clearTimeout(roleResponseTimeoutRef.current);
        roleResponseTimeoutRef.current = null;
      }
      setStatus((current) => (current[pairId] ? { ...current, [pairId]: undefined } : current));

      if (selectedPairId === pairId) {
        speakingPractice.toggleScoring();
        return;
      }

      pendingRolePracticePairIdRef.current = pairId;
      setSelectedPairId(pairId);
    },
    [selectedPairId, speakingPractice.toggleScoring],
  );

  const replayRoleSentence = useCallback(() => {
    if (!selectedPairId || !selectedSentence) return;
    speakRoleSentence(selectedSentence, resolvedRoleColumnIndex ?? 0, selectedPairId);
  }, [resolvedRoleColumnIndex, selectedPairId, selectedSentence, speakRoleSentence]);

  const goToNextRoleSentence = useCallback(() => {
    playRoleResponseAndAdvance();
  }, [playRoleResponseAndAdvance]);

  useEffect(() => {
    if (!showRoleSelectors) return;
    if (!selectedPairId) return;
    if (pendingRolePracticePairIdRef.current !== selectedPairId) return;

    pendingRolePracticePairIdRef.current = null;
    speakingPractice.toggleScoring();
  }, [selectedPairId, showRoleSelectors, speakingPractice.toggleScoring]);

  if (pairs.length === 0) {
    return (
      <div className="cartoon-card border-[#FFCC80] bg-white p-10 text-center">
        <div className="text-6xl mb-4">🧸</div>
        <div className="text-2xl font-extrabold text-[#3E2A1F]">No pairs yet!</div>
        <p className="mt-2 text-[#8D6E63]">Add some fun words and pictures in Settings.</p>
      </div>
    );
  }

  return (
    <div className="font-[Fredoka,system-ui]">
      <CelebrationAnimation play={allCorrect || roleRoundComplete || speakCelebrating} />

      {/* Big friendly timer bar */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 rounded-3xl border-4 border-[#FFCC80] bg-white px-5 py-2 shadow-[0_4px_0_#FFE082]">
          <span className="text-2xl">⏰</span>
          <span className="tabular-nums text-3xl font-extrabold text-[#E36A4E] tracking-tighter">
            {formatTime(remainingSeconds)}
          </span>
        </div>
        <TimerControls
          timerRunning={timerRunning}
          canStart={timerDurationSeconds > 0 && remainingSeconds > 0}
          onStart={() => setTimerRunning(true)}
          onStop={() => setTimerRunning(false)}
          onReset={resetTimer}
        />
      </div>

      {/* Main cartoon play area */}
      <div
        className={`cartoon-card flex border-[#FFCC80] bg-white/90 p-7 ${
          showPairBoard ? "min-h-[380px] items-stretch gap-6" : "items-center justify-center"
        }`}
      >
        <div
          className={
            showPairBoard && showDropTargets
              ? "flex h-[260px] w-[32%] max-w-[300px] min-w-0 shrink-0 items-stretch justify-center overflow-hidden"
              : `flex shrink-0 items-stretch justify-center ${
                  isMultiImageRow
                    ? "w-full"
                    : showPairBoard
                      ? showTargetSentence && !showRoleSelectors
                        ? "w-[250px] xl:w-[320px]"
                        : showRoleSelectors
                          ? "w-[300px]"
                          : "w-56"
                      : "w-full max-w-[320px] md:max-w-[420px]"
                }`
          }
        >
          {isMultiImageRow ? (
            <div className="grid w-full gap-5 md:grid-cols-4">
              {images.map((image, index) => (
                <div
                  key={`follow-image-${index}`}
                  className="cartoon-card border-[#FFCC80] bg-[#FFF9E6] p-3.5 shadow-md"
                >
                  <div className="flex h-full flex-col gap-3">
                    {image ? (
                      <div className="relative overflow-hidden rounded-2xl border-4 border-white shadow-inner">
                        <img
                          src={image}
                          alt={`Reference ${index + 1}`}
                          className="h-[200px] w-full select-none object-contain bg-white"
                        />
                      </div>
                    ) : (
                      <div className="flex h-[200px] items-center justify-center rounded-2xl border-4 border-dashed border-[#FFCC80] bg-white px-4 text-center text-sm font-bold text-[#C9A26B]">
                        📷 Image {index + 1}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => speakFollowLabel(followCardLabels[index], index)}
                      className={`cartoon-button inline-flex min-h-12 w-full items-center justify-center gap-1 border-4 px-1.5 py-2 text-[11px] font-extrabold text-[#2F2A1F] shadow-[0_4px_0_#2BA3D4] active:translate-y-0.5 transition xl:px-2.5 xl:text-sm ${
                        speakingCardIndex === index
                          ? "border-[#4FC3F7] bg-white shadow-[0_0_0_2px_rgba(79,195,247,0.18)]"
                          : "border-[#FFE082] bg-[#FFFDE7] hover:border-[#4FC3F7] hover:bg-white"
                      }`}
                    >
                      <span className="block min-w-0 whitespace-nowrap leading-none tracking-[-0.01em]">
                        {followCardLabels[index]}
                      </span>
                      {speakingCardIndex === index && (
                        <span
                          aria-hidden="true"
                          className="relative inline-flex h-5 w-5 items-center justify-center"
                        >
                          <span className="absolute inset-0 rounded-full bg-amber-300/60 animate-ping" />
                          <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-amber-600">
                            <Volume2 size={14} />
                          </span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : images[0] ? (
            <img
              src={images[0]}
              alt="Reference"
              className={`select-none pointer-events-none rounded-md ${
                showPairBoard && showDropTargets
                  ? "h-auto max-h-full w-full object-contain"
                  : showRoleSelectors
                    ? "h-full w-full object-contain"
                    : "max-h-[420px] w-full object-contain"
              }`}
            />
          ) : (
            <div className="flex h-full w-56 items-center justify-center rounded-md border-2 border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
              Upload an image in Settings to display it here.
            </div>
          )}
        </div>

        {showPairBoard &&
          (showRoleSelectors && roleSelection ? (
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="mb-4 flex min-w-0 items-center justify-between gap-4 overflow-hidden">
                {[0, 1].map((columnIndex) => (
                  <RolePlayRoleSelector
                    key={`role-selector-${columnIndex}`}
                    selectedRole={
                      columnIndex === 0 ? roleSelection.leftRole : roleSelection.rightRole
                    }
                    avatarSrc={
                      columnIndex === 0
                        ? ROLE_PLAY_NEUTRAL_AVATAR_LEFT
                        : ROLE_PLAY_NEUTRAL_AVATAR_RIGHT
                    }
                    isActive={activeRoleColumn === columnIndex}
                    onActivate={() => activateRoleColumn(columnIndex)}
                  />
                ))}
              </div>
              <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
                {rolePlaySentenceRows.map(({ pair: p, columnIndex }) => {
                  const labelSelected = selectedPairId === p.id;
                  const isRoleSentenceSpeaking = speakingRolePairId === p.id;
                  const roleSentenceStatus = status[p.id];
                  const showRoleMicButton =
                    resolvedRoleColumnIndex === columnIndex && labelSelected;
                  const isSentenceListening =
                    showRoleMicButton && labelSelected && speakingPractice.isListening;
                  const labelColorClass =
                    roleSentenceStatus === "correct"
                      ? "border-green-500 bg-green-50 text-green-800 shadow-sm"
                      : roleSentenceStatus === "wrong"
                        ? "border-red-400 bg-red-50 text-red-700 shadow-sm"
                        : labelSelected
                          ? "border-amber-500 bg-amber-100 text-slate-800 shadow-sm"
                          : "border-slate-700 bg-white text-slate-800";
                  const labelBoxClassName = `inline-flex min-h-14 w-[260px] max-w-full shrink-0 items-center rounded-md border-2 px-4 py-3 text-left text-base font-bold leading-snug transition xl:w-[300px] xl:text-lg ${labelColorClass} cursor-pointer hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`;

                  return (
                    <div
                      key={p.id}
                      className={`flex min-h-[64px] min-w-0 items-center ${
                        columnIndex === 0
                          ? "justify-start pr-[28%] xl:pr-[42%]"
                          : "justify-end pl-[28%] xl:pl-[42%]"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <button
                          type="button"
                          aria-pressed={labelSelected}
                          onClick={() => toggleLabelBox(p.id, columnIndex)}
                          className={labelBoxClassName}
                        >
                          <span className="block max-w-full whitespace-normal break-words leading-snug">
                            {p.label}
                            {isRoleSentenceSpeaking && (
                              <span
                                aria-hidden="true"
                                className="relative ml-2 inline-flex h-5 w-5 items-center justify-center align-middle"
                              >
                                <span className="absolute inset-0 rounded-full bg-amber-300/60 animate-ping" />
                                <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-amber-600">
                                  <Volume2 size={14} />
                                </span>
                              </span>
                            )}
                          </span>
                        </button>
                        {showRoleMicButton && (
                          <button
                            type="button"
                            aria-label={`Start pronunciation check for ${p.label}`}
                            onClick={() => startRolePractice(p.id, columnIndex)}
                            className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                              isSentenceListening
                                ? "border-rose-300 bg-rose-500 text-white shadow-[0_10px_20px_rgba(244,63,94,0.2)]"
                                : "border-amber-200 bg-white text-amber-600 shadow-sm hover:border-amber-300 hover:bg-amber-50"
                            }`}
                          >
                            {isSentenceListening ? <Square size={16} /> : <Mic size={18} />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              className={`min-w-0 flex-1 ${
                showDropTargets
                  ? "flex h-[260px] items-start justify-start"
                  : ""
              } ${
                showTargetSentence && !showDropTargets && !showRoleSelectors
                  ? "items-end"
                  : ""
              } ${sentenceColumns === 2 ? "grid grid-cols-2 gap-4" : "flex flex-col gap-3"}`}
            >
              {sentencePairsByColumn.map((columnPairs, columnIndex) => (
                <div
                  key={`sentence-column-${columnIndex}`}
                  className={
                    sentenceColumns === 2
                      ? "flex flex-col gap-3"
                      : `flex flex-col gap-3 ${showDropTargets ? "justify-center" : ""}`
                  }
                >
                  <div
                    className={
                      sentenceColumns === 2 ? "grid auto-rows-fr gap-3" : "flex flex-col gap-3"
                    }
                  >
                    {columnPairs.map((p) => {
                      const labelSelected = selectedPairId === p.id;
                      const isRoleSentenceSpeaking =
                        showRoleSelectors && speakingRolePairId === p.id;
                      const roleSentenceStatus = showRoleSelectors ? status[p.id] : undefined;
                      const showRoleMicButton =
                        showRoleSelectors &&
                        resolvedRoleColumnIndex === columnIndex &&
                        labelSelected;
                      const isSentenceListening =
                        showRoleMicButton && labelSelected && speakingPractice.isListening;
                      const labelColorClass =
                        roleSentenceStatus === "correct"
                          ? "border-green-500 bg-green-50 text-green-800 shadow-sm"
                          : roleSentenceStatus === "wrong"
                            ? "border-red-400 bg-red-50 text-red-700 shadow-sm"
                            : labelSelected
                              ? "border-amber-500 bg-amber-100 text-slate-800 shadow-sm"
                              : "border-slate-700 bg-white text-slate-800";
                      const labelBoxClassName = `border-2 rounded-md px-4 font-bold flex items-center transition ${labelColorClass} ${
                        showDropTargets
                          ? "h-full w-[196px] shrink-0 whitespace-nowrap"
                          : `min-h-16 py-3 text-left leading-snug ${
                              showTargetSentence
                                ? `h-full ${READ_SENTENCE_BOX_WIDTH_CLASS} text-xl xl:text-2xl whitespace-normal break-words`
                                : "w-full max-w-[560px]"
                            }`
                      } ${
                        labelBoxesClickable
                          ? "cursor-pointer hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                          : ""
                      }`;

                      return (
                        <div
                          key={p.id}
                          className={
                            showDropTargets
                              ? "grid grid-cols-[196px_24px_196px] items-center gap-2"
                              : `flex min-w-0 items-center gap-3 ${
                                  showTargetSentence ? "w-full justify-end" : ""
                                }`
                          }
                        >
                          {labelBoxesClickable ? (
                            <button
                              type="button"
                              aria-pressed={labelSelected}
                              onClick={() => toggleLabelBox(p.id, columnIndex)}
                              className={labelBoxClassName}
                            >
                              <span className="block w-full leading-snug">
                                {p.label}
                                {isRoleSentenceSpeaking && (
                                  <span
                                    aria-hidden="true"
                                    className="relative ml-2 inline-flex h-5 w-5 items-center justify-center align-middle"
                                  >
                                    <span className="absolute inset-0 rounded-full bg-amber-300/60 animate-ping" />
                                    <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-amber-600">
                                      <Volume2 size={14} />
                                    </span>
                                  </span>
                                )}
                              </span>
                            </button>
                          ) : (
                            <div className={labelBoxClassName}>{p.label}</div>
                          )}
                          {showRoleMicButton && (
                            <button
                              type="button"
                              aria-label={`Start pronunciation check for ${p.label}`}
                              onClick={() => startRolePractice(p.id, columnIndex)}
                              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                                isSentenceListening
                                  ? "border-rose-300 bg-rose-500 text-white shadow-[0_10px_20px_rgba(244,63,94,0.2)]"
                                  : "border-amber-200 bg-white text-amber-600 shadow-sm hover:border-amber-300 hover:bg-amber-50"
                              }`}
                            >
                              {isSentenceListening ? <Square size={16} /> : <Mic size={18} />}
                            </button>
                          )}
                          {showDropTargets && (
                            <>
                              <div className="w-full border-t-2 border-dashed border-slate-400" />
                              <DropZone
                                pairId={p.id}
                                status={status[p.id]}
                                value={placed[p.id]}
                                isPointerOver={activeDropZoneId === p.id}
                                onDrop={(ans) => onDrop(p.id, ans)}
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>

      {showTargetSentence && selectedSentence && !showRoleSelectors && (
        <SpeakingPracticePanel targetSentence={selectedSentence} practice={speakingPractice} />
      )}

      {showTargetSentence &&
        showRoleSelectors &&
        (selectedSentence && resolvedRoleColumnIndex != null ? (
          <SpeakingPracticePanel
            targetSentence={selectedSentence}
            practice={speakingPractice}
            showPrimaryButton={false}
            auxiliaryActions={
              speakingPractice.scoreResult?.tone === "practice" ? (
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={replayRoleSentence}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                  >
                    <Volume2 size={16} />
                    整句重读
                  </button>
                  <button
                    type="button"
                    onClick={goToNextRoleSentence}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    下一题
                  </button>
                </div>
              ) : null
            }
            emptyHint=""
          />
        ) : (
          <section className="mt-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-8 py-5 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                先选择左侧或右侧角色，再点击对应句子后面的麦克风开始识别。
              </p>
            </div>
          </section>
        ))}

      {showAnswerTiles && (
        <div className="flex flex-wrap gap-3 mt-8 justify-center">
          {shuffled.map((ans, i) => (
            <Draggable
              key={ans + i}
              value={ans}
              used={!!used[ans]}
              onNativeDragChange={handleNativeAnswerDragChange}
              onPointerDragStart={startPointerAnswerDrag}
            />
          ))}
        </div>
      )}

      {pointerDragPreview && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-md bg-amber-300 px-5 py-3 text-lg font-semibold text-amber-950 shadow-lg ring-2 ring-amber-500/40"
          style={{ left: pointerDragPreview.x, top: pointerDragPreview.y }}
        >
          {pointerDragPreview.answer}
        </div>
      )}

      {(allCorrect || roleRoundComplete) && (
        <p className="mt-6 text-center text-2xl font-bold text-green-600">🎉 Great job!</p>
      )}

      {showGameReset && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 rounded-lg bg-amber-500 text-white font-bold shadow hover:bg-amber-600 active:scale-95 transition"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

function SpeakingPracticePanel({
  targetSentence,
  practice,
  showPrimaryButton = true,
  auxiliaryActions,
  emptyHint = "点击按钮开始语音识别。",
}: {
  targetSentence: string;
  practice: SpeakingPracticeController;
  showPrimaryButton?: boolean;
  auxiliaryActions?: React.ReactNode;
  emptyHint?: string;
}) {
  const resultColorClass =
    practice.scoreResult?.tone === "great"
      ? "border-green-200 bg-green-50 text-green-700"
      : practice.scoreResult?.tone === "pass"
        ? "border-yellow-200 bg-yellow-50 text-yellow-700"
        : "border-red-200 bg-red-50 text-red-700";
  const resultLabel =
    practice.scoreResult?.tone === "great"
      ? "Excellent!"
      : practice.scoreResult?.tone === "pass"
        ? "Good!"
        : practice.scoreResult
          ? "Try again."
          : "";

  return (
    <section className="mt-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-8 py-3 shadow-sm">
        <div
          className={`grid items-center gap-4 ${
            showPrimaryButton
              ? "md:grid-cols-[1fr_auto_1fr]"
              : emptyHint
                ? "md:grid-cols-[1fr_auto]"
                : "md:grid-cols-1"
          }`}
        >
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              TARGET SENTENCE / 目标句子
            </p>
            <p className="mt-1 text-2xl font-bold leading-tight text-slate-900">{targetSentence}</p>
          </div>
          {(showPrimaryButton || emptyHint) && (
            <div
              className={showPrimaryButton ? "justify-self-center text-center" : "justify-self-end"}
            >
              {showPrimaryButton ? (
                <button
                  type="button"
                  onClick={practice.toggleScoring}
                  className={`inline-flex min-h-14 items-center justify-center gap-4 rounded-2xl px-10 text-xl font-bold text-white shadow-xl transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 ${
                    practice.isListening
                      ? "bg-gradient-to-r from-red-500 to-pink-500"
                      : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                  }`}
                >
                  <Mic size={28} />
                  {practice.isListening ? "正在听...点击结束" : "I can read"}
                </button>
              ) : (
                <p className="text-sm font-semibold text-slate-500">{emptyHint}</p>
              )}
            </div>
          )}
          {showPrimaryButton && <div aria-hidden="true" />}
        </div>
        {(practice.transcript ||
          practice.scoreResult ||
          practice.errorMessage ||
          auxiliaryActions) && (
          <div className="mx-auto mt-6 max-w-3xl space-y-3 text-left">
            {practice.transcript && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">识别结果</p>
                <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-base font-semibold">
                  {practice.sentenceWordTokens.map((token, index) => (
                    <span
                      key={`${token.text}-${index}`}
                      className={
                        token.tone === "correct"
                          ? "rounded bg-green-50 px-1.5 py-0.5 text-green-700"
                          : token.tone === "wrong"
                            ? "rounded bg-red-50 px-1.5 py-0.5 text-red-600"
                            : "rounded bg-slate-100 px-1.5 py-0.5 text-slate-600"
                      }
                    >
                      {token.text}
                    </span>
                  ))}
                </p>
              </div>
            )}
            {practice.scoreResult && (
              <div className={`rounded-xl border px-4 py-3 ${resultColorClass}`}>
                <p className="text-2xl font-bold">{resultLabel}</p>
                <p className="mt-1 text-sm font-semibold">{practice.scoreResult.feedback}</p>
              </div>
            )}
            {practice.errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {practice.errorMessage}
              </div>
            )}
            {auxiliaryActions}
          </div>
        )}
      </div>
      <div className="mt-5 px-8 text-center">
        <p className="inline-flex items-center gap-2 text-base font-extrabold text-[#8D6E63]">
          <Lock size={18} />
          Tip: Voice scoring uses your browser. Speak clearly!
        </p>
        <p className="mt-2 text-xs font-bold text-[#FF8A65]">
          ⭐ Teacher guidance is always best! ⭐
        </p>
      </div>
    </section>
  );
}

function CelebrationAnimation({ play }: { play: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!play || !containerRef.current) return;

    const animation = lottie.loadAnimation({
      animationData: confettiAnimation,
      autoplay: false,
      container: containerRef.current,
      loop: false,
      renderer: "svg",
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    });
    animation.setSpeed(CELEBRATION_PLAYBACK_SPEED);
    animation.play();

    return () => animation.destroy();
  }, [play]);

  if (!play) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

function TimerControls({
  timerRunning,
  canStart,
  onStart,
  onStop,
  onReset,
}: {
  timerRunning: boolean;
  canStart: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 rounded-2xl border-4 border-[#FFCC80] bg-white px-3 py-2.5 shadow-[0_3px_0_#FFE082]">
      <button
        type="button"
        onClick={onStart}
        disabled={!canStart || timerRunning}
        className="cartoon-button inline-flex h-9 items-center gap-1.5 border-[#66BB6A] bg-[#81C784] px-5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] disabled:text-[#999] disabled:border-[#CCC] active:translate-y-px"
      >
        <Play size={15} /> Start
      </button>
      <button
        type="button"
        onClick={onStop}
        disabled={!timerRunning}
        className="cartoon-button inline-flex h-9 items-center gap-1.5 border-[#E67E22] bg-[#FF9F43] px-5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] disabled:text-[#999] disabled:border-[#CCC] active:translate-y-px"
      >
        <Square size={15} /> Stop
      </button>
      <button
        type="button"
        onClick={onReset}
        className="cartoon-button inline-flex h-9 items-center gap-1.5 border-[#BDBDBD] bg-white px-4 text-sm font-extrabold text-[#5C4A35] hover:bg-[#FFF8E7] active:translate-y-px"
      >
        <RotateCcw size={15} /> Reset
      </button>
    </div>
  );
}

function Draggable({
  value,
  used,
  onNativeDragChange,
  onPointerDragStart,
}: {
  value: string;
  used: boolean;
  onNativeDragChange: (value: string | null) => void;
  onPointerDragStart: (value: string, event: React.PointerEvent<HTMLElement>) => void;
}) {
  return (
    <div
      draggable={!used}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", value);
        onNativeDragChange(value);
      }}
      onDragEnd={() => onNativeDragChange(null)}
      onPointerDown={(event) => {
        if (!used) onPointerDragStart(value, event);
      }}
      className={`cartoon-button touch-none px-7 py-3.5 text-xl font-extrabold select-none border-4 transition active:scale-[0.97] ${
        used
          ? "bg-[#F5F5F5] text-[#BDBDBD] border-[#E0E0E0] cursor-not-allowed line-through"
          : "bg-[#FFE082] text-[#3E2A1F] border-[#FFCC80] cursor-grab active:cursor-grabbing hover:border-[#FF8A65] hover:bg-[#FFF59D]"
      }`}
    >
      {value}
    </div>
  );
}

function DropZone({
  pairId,
  status,
  value,
  isPointerOver,
  onDrop,
}: {
  pairId: string;
  status?: "correct" | "wrong";
  value?: string;
  isPointerOver: boolean;
  onDrop: (val: string) => void;
}) {
  const [over, setOver] = useState(false);
  const dropAnswer = (answer: string) => {
    setOver(false);
    if (answer) onDrop(answer);
  };
  return (
    <div className="relative">
      <div
        data-drop-zone-pair-id={pairId}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          const v = e.dataTransfer.getData("text/plain");
          dropAnswer(v);
        }}
        className={`${MATCH_BOX_WIDTH_CLASS} h-full min-h-[60px] border-4 border-dashed rounded-2xl px-5 text-lg font-extrabold flex items-center justify-center whitespace-nowrap transition-all ${ 
          status === "correct"
            ? "border-[#66BB6A] bg-[#E8F5E9] text-[#2E7D32] shadow-inner"
            : status === "wrong"
              ? "border-[#EF5350] bg-[#FFEBEE] text-[#C62828] animate-pulse"
              : over || isPointerOver
                ? "border-[#4FC3F7] bg-[#E3F2FD] text-[#1565C0] scale-[1.02]"
                : "border-[#FFCC80] bg-[#FFFDE7] text-[#5C4A35]"
        }`}
      >
        {value}
      </div>
      {status === "correct" && (
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center">
          <Check size={16} />
        </div>
      )}
      {status === "wrong" && (
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center">
          <X size={16} />
        </div>
      )}
    </div>
  );
}

function SettingsView({
  pairs,
  setPairs,
  images,
  setImages,
  defaultImages,
  imageLayout,
  title,
  setTitle,
  defaultTitle,
  timerSettings,
  setTimerSettings,
  sentenceColumns,
  fixedPairCount,
  showAnswerFields,
  sentenceEditorHelpText,
}: {
  pairs: Pair[];
  setPairs: React.Dispatch<React.SetStateAction<Pair[]>>;
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  defaultImages?: readonly string[];
  imageLayout: "single" | "row4";
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  defaultTitle: string;
  timerSettings: TimerSettings;
  setTimerSettings: React.Dispatch<React.SetStateAction<TimerSettings>>;
  sentenceColumns: 1 | 2;
  fixedPairCount?: number;
  showAnswerFields: boolean;
  sentenceEditorHelpText?: string;
}) {
  const usesFixedButtonNames = imageLayout === "row4" && !showAnswerFields;
  const usesRolePlayColumns =
    imageLayout === "single" && sentenceColumns === 2 && !showAnswerFields;
  const rolePlaySplitIndex = Math.ceil((fixedPairCount ?? pairs.length) / 2);
  const rolePlayLeftPairs = pairs.slice(0, rolePlaySplitIndex);
  const rolePlayRightPairs = pairs.slice(rolePlaySplitIndex, rolePlaySplitIndex * 2);
  const getDefaultImageAt = (index: number) => defaultImages?.[index] ?? DEFAULT_IMAGE;

  const update = (id: string, field: "label" | "answer", value: string) => {
    setPairs((ps) => ps.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };
  const add = () => setPairs((ps) => [...ps, { id: Date.now().toString(), label: "", answer: "" }]);
  const remove = (id: string) => setPairs((ps) => ps.filter((p) => p.id !== id));

  const updateImageAtIndex = (index: number, nextImage: string | null) => {
    setImages((current) =>
      current.map((image, imageIndex) => (imageIndex === index ? nextImage : image)),
    );
  };

  const onUpload = (file: File | null | undefined, index: number) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      updateImageAtIndex(index, typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const updateTimer = (field: keyof TimerSettings, value: string) => {
    const limit = field === "minutes" ? 99 : 59;
    const nextValue = Math.max(0, Math.min(limit, Math.trunc(Number(value) || 0)));
    setTimerSettings((current) => ({ ...current, [field]: nextValue }));
  };

  return (
    <div
      className={`mx-auto space-y-6 font-[Fredoka,system-ui] ${
        usesFixedButtonNames || usesRolePlayColumns ? "max-w-4xl" : "max-w-2xl"
      }`}
    >
      <div className="cartoon-card border-[#FFCC80] bg-white p-7">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📝</span>
          <h2 className="text-2xl font-extrabold text-[#3E2A1F]">Page title</h2>
        </div>
        <p className="mt-1 text-base text-[#8D6E63]">Shown in the big header. Make it fun!</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={defaultTitle}
          className="mt-4 w-full border-4 border-[#FFCC80] bg-[#FFF9E6] rounded-2xl px-5 py-3 text-xl font-bold text-[#3E2A1F] focus:outline-none focus:border-[#4FC3F7] focus:ring-4 focus:ring-[#4FC3F7]/20"
        />
      </div>
      <div className="cartoon-card border-[#FFCC80] bg-white p-7">
        {usesFixedButtonNames ? (
          <>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Follow cards</h2>
            <p className="text-sm text-slate-500 mb-4">
              Set each Follow card separately: its image and its button text.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {images.map((image, index) => (
                <div
                  key={`follow-setting-card-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Card {index + 1}
                  </p>
                  <div className="h-44 w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white">
                    {image ? (
                      <img
                        src={image}
                        alt={`Uploaded ${index + 1}`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-amber-600">
                      {image ? "Replace image" : "Upload image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onUpload(e.target.files?.[0], index)}
                      />
                    </label>
                    {image && image !== getDefaultImageAt(index) && (
                      <button
                        onClick={() => updateImageAtIndex(index, getDefaultImageAt(index))}
                        className="rounded-md px-3 py-2 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        Use default image
                      </button>
                    )}
                  </div>
                  <label className="mt-4 block text-sm font-medium text-slate-700">
                    Button text
                    <input
                      value={pairs[index]?.label ?? ""}
                      onChange={(e) => {
                        const pairId = pairs[index]?.id;
                        if (pairId) update(pairId, "label", e.target.value);
                      }}
                      placeholder="Get up"
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </label>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">
              {imageLayout === "row4" ? "Reference images" : "Reference image"}
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              {imageLayout === "row4"
                ? "Upload 4 images shown in one row on the home page."
                : "Upload the image shown on the home page. Recommended: 840×1080 px."}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-md flex items-center justify-center overflow-hidden bg-slate-50">
                {images[0] ? (
                  <img src={images[0]} alt="Uploaded" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">No image</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-md cursor-pointer hover:bg-amber-600 w-fit">
                  {images[0] ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onUpload(e.target.files?.[0], 0)}
                  />
                </label>
                {images[0] && images[0] !== getDefaultImageAt(0) && (
                  <button
                    onClick={() => updateImageAtIndex(0, getDefaultImageAt(0))}
                    className="text-xs text-slate-500 hover:text-red-600 w-fit"
                  >
                    Use default image
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Timer</h2>
        <p className="text-sm text-slate-500 mb-4">Set the countdown used on the home page.</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-slate-700">
            Minutes
            <input
              type="number"
              min={0}
              max={99}
              value={timerSettings.minutes}
              onChange={(e) => updateTimer("minutes", e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Seconds
            <input
              type="number"
              min={0}
              max={59}
              value={timerSettings.seconds}
              onChange={(e) => updateTimer("seconds", e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
        </div>
      </div>

      {!usesFixedButtonNames && !usesRolePlayColumns && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">
            {showAnswerFields ? "Match pairs" : "Sentences"}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {showAnswerFields
              ? "The label appears in the solid box on the left. The answer is the correct yellow tile to drag into its dashed box."
              : (sentenceEditorHelpText ?? "Edit the sentence buttons shown on the activity page.")}
          </p>
          <div
            className={`grid gap-3 text-xs font-medium text-slate-500 uppercase mb-2 px-1 ${
              showAnswerFields ? "grid-cols-[1fr_1fr_auto]" : "grid-cols-[1fr_auto]"
            }`}
          >
            <div>{showAnswerFields ? "Label (solid box)" : "Sentence"}</div>
            {showAnswerFields && <div>Answer (dashed box)</div>}
            <div></div>
          </div>
          <div className="space-y-2">
            {pairs.map((p) => (
              <div
                key={p.id}
                className={`grid gap-3 ${
                  showAnswerFields ? "grid-cols-[1fr_1fr_auto]" : "grid-cols-[1fr_auto]"
                }`}
              >
                <input
                  value={p.label}
                  onChange={(e) => update(p.id, "label", e.target.value)}
                  placeholder={showAnswerFields ? "flowers" : "Look at the tree."}
                  className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                {showAnswerFields && (
                  <input
                    value={p.answer}
                    onChange={(e) => update(p.id, "answer", e.target.value)}
                    placeholder="pink"
                    className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                )}
                <button
                  onClick={() => remove(p.id)}
                  className="px-3 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={add}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded-md hover:bg-slate-700"
          >
            <Plus size={16} /> {showAnswerFields ? "Add pair" : "Add sentence"}
          </button>
        </div>
      )}

      {usesRolePlayColumns && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Sentences</h2>
          <p className="text-sm text-slate-500 mb-6">
            {sentenceEditorHelpText ?? "Edit the sentence buttons shown on the activity page."}
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                Left column
              </div>
              {rolePlayLeftPairs.map((pair, index) => (
                <label key={pair.id} className="block text-sm font-medium text-slate-700">
                  Line {index + 1}
                  <input
                    value={pair.label}
                    onChange={(e) => update(pair.id, "label", e.target.value)}
                    placeholder="Look at the tree."
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </label>
              ))}
            </div>
            <div className="space-y-3">
              <div className="px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                Right column
              </div>
              {rolePlayRightPairs.map((pair, index) => (
                <label key={pair.id} className="block text-sm font-medium text-slate-700">
                  Line {index + 1}
                  <input
                    value={pair.label}
                    onChange={(e) => update(pair.id, "label", e.target.value)}
                    placeholder="The branches are green."
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
