import React from "react";
import { cva } from "class-variance-authority";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  BetweenHorizonalEnd,
  BetweenHorizonalStart,
  Bold,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Code2,
  Columns2,
  Columns3,
  Combine,
  Edit2,
  ExternalLink,
  Eye,
  FileCode,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Image,
  Indent,
  Italic,
  Keyboard,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  LucideProps,
  MessageSquare,
  MessageSquarePlus,
  Minus,
  Moon,
  MoreHorizontal,
  MoveHorizontal,
  Outdent,
  PaintBucket,
  Pilcrow,
  Plus,
  Quote,
  RectangleHorizontal,
  RectangleVertical,
  RotateCcw,
  Search,
  Settings,
  Smile,
  Strikethrough,
  Subscript,
  SunMedium,
  Superscript,
  Table,
  Text,
  Trash,
  Twitter,
  Underline,
  Ungroup,
  WrapText,
  X,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type Icon = LucideIcon;

const borderAll = (props: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    height="48"
    width="48"
    focusable="false"
    role="img"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm10 13h5a1 1 0 0 0 1-1v-5h-6v6zm-2-6H5v5a1 1 0 0 0 1 1h5v-6zm2-2h6V6a1 1 0 0 0-1-1h-5v6zm-2-6H6a1 1 0 0 0-1 1v5h6V5z" />
  </svg>
);

const borderBottom = (props: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    height="48"
    width="48"
    focusable="false"
    role="img"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M13 5a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm-8 6a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm-2 7a1 1 0 1 1 2 0 1 1 0 0 0 1 1h12a1 1 0 0 0 1-1 1 1 0 1 1 2 0 3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zm17-8a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1zM7 4a1 1 0 0 0-1-1 3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1 1 1 0 0 0 1-1zm11-1a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3z" />
  </svg>
);

const borderLeft = (props: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    height="48"
    width="48"
    focusable="false"
    role="img"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M6 21a1 1 0 1 0 0-2 1 1 0 0 1-1-1V6a1 1 0 0 1 1-1 1 1 0 0 0 0-2 3 3 0 0 0-3 3v12a3 3 0 0 0 3 3zm7-16a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm6 6a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-5 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm4-17a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3zm-1 17a1 1 0 0 0 1 1 3 3 0 0 0 3-3 1 1 0 1 0-2 0 1 1 0 0 1-1 1 1 1 0 0 0-1 1z" />
  </svg>
);

const borderNone = (props: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    height="48"
    width="48"
    focusable="false"
    role="img"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M14 4a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm-9 7a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm14 0a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-6 10a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zM7 4a1 1 0 0 0-1-1 3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1 1 1 0 0 0 1-1zm11-1a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3zM7 20a1 1 0 0 1-1 1 3 3 0 0 1-3-3 1 1 0 1 1 2 0 1 1 0 0 0 1 1 1 1 0 0 1 1 1zm11 1a1 1 0 1 1 0-2 1 1 0 0 0 1-1 1 1 0 1 1 2 0 3 3 0 0 1-3 3z" />
  </svg>
);

const borderRight = (props: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    height="48"
    width="48"
    focusable="false"
    role="img"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M13 5a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm-8 6a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm9 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zM6 3a1 1 0 0 1 0 2 1 1 0 0 0-1 1 1 1 0 0 1-2 0 3 3 0 0 1 3-3zm1 17a1 1 0 0 1-1 1 3 3 0 0 1-3-3 1 1 0 1 1 2 0 1 1 0 0 0 1 1 1 1 0 0 1 1 1zm11 1a1 1 0 1 1 0-2 1 1 0 0 0 1-1V6a1 1 0 0 0-1-1 1 1 0 1 1 0-2 3 3 0 0 1 3 3v12a3 3 0 0 1-3 3z" />
  </svg>
);

const borderTop = (props: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    height="48"
    width="48"
    focusable="false"
    role="img"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M3 6a1 1 0 0 0 2 0 1 1 0 0 1 1-1h12a1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3zm2 5a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm14 0a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-5 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm-8 1a1 1 0 1 0 0-2 1 1 0 0 1-1-1 1 1 0 1 0-2 0 3 3 0 0 0 3 3zm11-1a1 1 0 0 0 1 1 3 3 0 0 0 3-3 1 1 0 1 0-2 0 1 1 0 0 1-1 1 1 1 0 0 0-1 1z" />
  </svg>
);

export const Icons = {
  add: Plus,
  alignCenter: AlignCenter,
  alignJustify: AlignJustify,
  alignLeft: AlignLeft,
  alignRight: AlignRight,
  arrowDown: ChevronDown,
  bg: PaintBucket,
  blockquote: Quote,
  bold: Bold,
  borderAll,
  borderBottom,
  borderLeft,
  borderNone,
  borderRight,
  borderTop,
  check: Check,
  chevronRight: ChevronRight,
  chevronsUpDown: ChevronsUpDown,
  clear: X,
  close: X,
  code: Code2,
  codeblock: FileCode,
  color: Baseline,
  column: RectangleVertical,
  combine: Combine,
  ungroup: Ungroup,
  comment: MessageSquare,
  commentAdd: MessageSquarePlus,
  delete: Trash,
  dragHandle: GripVertical,
  editing: Edit2,
  emoji: Smile,
  externalLink: ExternalLink,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  image: Image,
  indent: Indent,
  italic: Italic,
  kbd: Keyboard,
  lineHeight: WrapText,
  link: Link2,
  minus: Minus,
  more: MoreHorizontal,
  ol: ListOrdered,
  outdent: Outdent,
  paragraph: Pilcrow,
  refresh: RotateCcw,
  row: RectangleHorizontal,
  search: Search,
  settings: Settings,
  strikethrough: Strikethrough,
  subscript: Subscript,
  superscript: Superscript,
  table: Table,
  text: Text,
  trash: Trash,
  ul: List,
  underline: Underline,
  unlink: Link2Off,
  viewing: Eye,
  Share: (props: LucideProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.9289 8.28572V4L21 11.071L13.9289 18.1421V13.3102M13.9289 8.29408C13.2857 8.14812 12.6163 8.07106 11.9289 8.07106C6.9584 8.07106 2.92896 12.1005 2.92896 17.071C2.92896 17.9385 3.05169 18.7773 3.28073 19.571C4.36407 15.8167 7.82587 13.071 11.9289 13.071C12.6163 13.071 13.2857 13.1481 13.9289 13.294"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  ),

  google: (props: LucideProps) => (
    <svg
      width={props.width}
      height={props.height}
      className={props.className}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
    >
      <path
        fill="#fbc02d"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
      <path
        fill="#e53935"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      ></path>
      <path
        fill="#4caf50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      ></path>
      <path
        fill="#1565c0"
        d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
    </svg>
  ),

  outlook: (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
      <path
        fill="#103262"
        d="M43.255,23.547l-6.81-3.967v11.594H44v-6.331C44,24.309,43.716,23.816,43.255,23.547z"
      ></path>
      <path fill="#0084d7" d="M13,10h10v9H13V10z"></path>
      <path fill="#33afec" d="M23,10h10v9H23V10z"></path>
      <path fill="#54daff" d="M33,10h10v9H33V10z"></path>
      <path fill="#027ad4" d="M23,19h10v9H23V19z"></path>
      <path fill="#0553a4" d="M23,28h10v9H23V28z"></path>
      <path fill="#25a2e5" d="M33,19h10v9H33V19z"></path>
      <path fill="#0262b8" d="M33,28h10v9H33V28z"></path>
      <polygon
        points="13,37 43,37 43,24.238 28.99,32.238 13,24.238"
        opacity=".019"
      ></polygon>
      <polygon
        points="13,37 43,37 43,24.476 28.99,32.476 13,24.476"
        opacity=".038"
      ></polygon>
      <polygon
        points="13,37 43,37 43,24.714 28.99,32.714 13,24.714"
        opacity=".057"
      ></polygon>
      <polygon
        points="13,37 43,37 43,24.952 28.99,32.952 13,24.952"
        opacity=".076"
      ></polygon>
      <polygon
        points="13,37 43,37 43,25.19 28.99,33.19 13,25.19"
        opacity=".095"
      ></polygon>
      <polygon
        points="13,37 43,37 43,25.429 28.99,33.429 13,25.429"
        opacity=".114"
      ></polygon>
      <polygon
        points="13,37 43,37 43,25.667 28.99,33.667 13,25.667"
        opacity=".133"
      ></polygon>
      <polygon
        points="13,37 43,37 43,25.905 28.99,33.905 13,25.905"
        opacity=".152"
      ></polygon>
      <polygon
        points="13,37 43,37 43,26.143 28.99,34.143 13,26.143"
        opacity=".171"
      ></polygon>
      <polygon
        points="13,37 43,37 43,26.381 28.99,34.381 13,26.381"
        opacity=".191"
      ></polygon>
      <polygon
        points="13,37 43,37 43,26.619 28.99,34.619 13,26.619"
        opacity=".209"
      ></polygon>
      <polygon
        points="13,37 43,37 43,26.857 28.99,34.857 13,26.857"
        opacity=".229"
      ></polygon>
      <polygon
        points="13,37 43,37 43,27.095 28.99,35.095 13,27.095"
        opacity=".248"
      ></polygon>
      <polygon
        points="13,37 43,37 43,27.333 28.99,35.333 13,27.333"
        opacity=".267"
      ></polygon>
      <polygon
        points="13,37 43,37 43,27.571 28.99,35.571 13,27.571"
        opacity=".286"
      ></polygon>
      <polygon
        points="13,37 43,37 43,27.81 28.99,35.81 13,27.81"
        opacity=".305"
      ></polygon>
      <polygon
        points="13,37 43,37 43,28.048 28.99,36.048 13,28.048"
        opacity=".324"
      ></polygon>
      <polygon
        points="13,37 43,37 43,28.286 28.99,36.286 13,28.286"
        opacity=".343"
      ></polygon>
      <polygon
        points="13,37 43,37 43,28.524 28.99,36.524 13,28.524"
        opacity=".362"
      ></polygon>
      <polygon
        points="13,37 43,37 43,28.762 28.99,36.762 13,28.762"
        opacity=".381"
      ></polygon>
      <polygon points="13,37 43,37 43,29 28.99,37 13,29" opacity=".4"></polygon>
      <linearGradient
        id="Qf7015RosYe_HpjKeG0QTa_ut6gQeo5pNqf_gr1"
        x1="38.925"
        x2="32.286"
        y1="24.557"
        y2="36.024"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#31abec"></stop>
        <stop offset="1" stop-color="#1582d5"></stop>
      </linearGradient>
      <path
        fill="url(#Qf7015RosYe_HpjKeG0QTa_ut6gQeo5pNqf_gr1)"
        d="M15.441,42h26.563c1.104,0,1.999-0.889,2-1.994C44.007,35.485,44,24.843,44,24.843	s-0.007,0.222-1.751,1.212S14.744,41.566,14.744,41.566S14.978,42,15.441,42z"
      ></path>
      <linearGradient
        id="Qf7015RosYe_HpjKeG0QTb_ut6gQeo5pNqf_gr2"
        x1="13.665"
        x2="41.285"
        y1="6.992"
        y2="9.074"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset=".042" stop-color="#076db4"></stop>
        <stop offset=".85" stop-color="#0461af"></stop>
      </linearGradient>
      <path
        fill="url(#Qf7015RosYe_HpjKeG0QTb_ut6gQeo5pNqf_gr2)"
        d="M43,10H13V8c0-1.105,0.895-2,2-2h26c1.105,0,2,0.895,2,2V10z"
      ></path>
      <linearGradient
        id="Qf7015RosYe_HpjKeG0QTc_ut6gQeo5pNqf_gr3"
        x1="28.153"
        x2="23.638"
        y1="33.218"
        y2="41.1"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#33acee"></stop>
        <stop offset="1" stop-color="#1b8edf"></stop>
      </linearGradient>
      <path
        fill="url(#Qf7015RosYe_HpjKeG0QTc_ut6gQeo5pNqf_gr3)"
        d="M13,25v15c0,1.105,0.895,2,2,2h15h12.004c0.462,0,0.883-0.162,1.221-0.425L13,25z"
      ></path>
      <path
        d="M21.319,13H13v24h8.319C23.352,37,25,35.352,25,33.319V16.681C25,14.648,23.352,13,21.319,13z"
        opacity=".05"
      ></path>
      <path
        d="M21.213,36H13V13.333h8.213c1.724,0,3.121,1.397,3.121,3.121v16.425	C24.333,34.603,22.936,36,21.213,36z"
        opacity=".07"
      ></path>
      <path
        d="M21.106,35H13V13.667h8.106c1.414,0,2.56,1.146,2.56,2.56V32.44C23.667,33.854,22.52,35,21.106,35z"
        opacity=".09"
      ></path>
      <linearGradient
        id="Qf7015RosYe_HpjKeG0QTd_ut6gQeo5pNqf_gr4"
        x1="3.53"
        x2="22.41"
        y1="14.53"
        y2="33.41"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#1784d8"></stop>
        <stop offset="1" stop-color="#0864c5"></stop>
      </linearGradient>
      <path
        fill="url(#Qf7015RosYe_HpjKeG0QTd_ut6gQeo5pNqf_gr4)"
        d="M21,34H5c-1.105,0-2-0.895-2-2V16c0-1.105,0.895-2,2-2h16c1.105,0,2,0.895,2,2v16	C23,33.105,22.105,34,21,34z"
      ></path>
      <path
        fill="#fff"
        d="M13,18.691c-3.111,0-4.985,2.377-4.985,5.309S9.882,29.309,13,29.309	c3.119,0,4.985-2.377,4.985-5.308C17.985,21.068,16.111,18.691,13,18.691z M13,27.517c-1.765,0-2.82-1.574-2.82-3.516	s1.06-3.516,2.82-3.516s2.821,1.575,2.821,3.516S14.764,27.517,13,27.517z"
      ></path>
    </svg>
  ),
  // www
  gitHub: (props: LucideProps) => (
    <svg viewBox="0 0 438.549 438.549" {...props}>
      <path
        fill="currentColor"
        d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
      ></path>
    </svg>
  ),
  logo: (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"
      />
    </svg>
  ),
  moon: Moon,
  sun: SunMedium,
  twitter: Twitter,
  doubleColumn: Columns2,
  threeColumn: Columns3,
  rightSideDoubleColumn: BetweenHorizonalStart,
  leftSideDoubleColumn: BetweenHorizonalEnd,
  doubleSideDoubleColumn: MoveHorizontal,
  chevronDown: ChevronDown,
  whatsapp: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill="#25d366"
      className="bi bi-whatsapp w-fit inline"
      viewBox="0 0 16 16"
    >
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  ),
  twitterX: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill="currentColor"
      className="bi bi-twitter-x w-fit inline"
      viewBox="0 0 16 16"
    >
      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
    </svg>
  ),
};

export const iconVariants = cva("", {
  variants: {
    variant: {
      toolbar: "size-5",
      menuItem: "mr-2 size-5",
    },
    size: {
      sm: "mr-2 size-4",
      md: "mr-2 size-6",
    },
  },
  defaultVariants: {},
});
