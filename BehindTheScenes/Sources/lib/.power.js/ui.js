// CLJ UI Components - Complete Exports
// This file re-exports all UI components from the global CLJ object

export const Modal = () => window.CLJ?.Modal;
export const Slider = () => window.CLJ?.Slider;
export const Tabs = () => window.CLJ?.Tabs;
export const Tooltip = () => window.CLJ?.Tooltip;
export const Toast = () => window.CLJ?.Toast;
export const Accordion = () => window.CLJ?.Accordion;
export const Carousel = () => window.CLJ?.Carousel;
export const ProgressBar = () => window.CLJ?.ProgressBar;
export const Switch = () => window.CLJ?.Switch;
export const Rating = () => window.CLJ?.Rating;
export const DatePicker = () => window.CLJ?.DatePicker;
export const ColorPicker = () => window.CLJ?.ColorPicker;
export const Audio = () => window.CLJ?.Audio;
export const VideoPlayer = () => window.CLJ?.VideoPlayer;
export const CodeEditor = () => window.CLJ?.CodeEditor;
export const VirtualList = () => window.CLJ?.VirtualList;
export const Form = () => window.CLJ?.Form;
export const DragDrop = () => window.CLJ?.DragDrop;
export const Chart = () => window.CLJ?.Chart;
export const Router = () => window.CLJ?.Router;
export const DOM = () => window.CLJ?.DOM;

// Default export of all components
export default {
  Modal,
  Slider,
  Tabs,
  Tooltip,
  Toast,
  Accordion,
  Carousel,
  ProgressBar,
  Switch,
  Rating,
  DatePicker,
  ColorPicker,
  Audio,
  VideoPlayer,
  CodeEditor,
  VirtualList,
  Form,
  DragDrop,
  Chart,
  Router,
  DOM
};