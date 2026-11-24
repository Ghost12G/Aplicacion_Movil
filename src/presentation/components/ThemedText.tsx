import type { ComponentProps } from "react";
import { Text as NativeText } from "react-native";

type Props = ComponentProps<typeof NativeText> & {
  className?: string;
};

const darkTextColors: Record<string, string> = {
  "text-black": "dark:text-slate-100",
  "text-gray-300": "dark:text-slate-600",
  "text-gray-400": "dark:text-slate-500",
  "text-gray-500": "dark:text-slate-400",
  "text-gray-600": "dark:text-slate-300",
  "text-gray-700": "dark:text-slate-200",
  "text-gray-800": "dark:text-slate-100",
  "text-gray-900": "dark:text-slate-100",
  "text-slate-600": "dark:text-slate-300",
  "text-slate-700": "dark:text-slate-300",
  "text-slate-900": "dark:text-slate-100",
  "text-sky-600": "dark:text-sky-300",
  "text-sky-700": "dark:text-sky-300",
  "text-sky-800": "dark:text-sky-300",
  "text-sky-900": "dark:text-sky-200",
  "text-red-600": "dark:text-red-300",
  "text-red-700": "dark:text-red-300",
  "text-amber-900": "dark:text-amber-200",
};

export default function ThemedText({ className, ...props }: Props) {
  const darkColorClasses = (className ?? "")
    .split(/\s+/)
    .map((token) => darkTextColors[token])
    .filter((token): token is string => Boolean(token));
  const hasTextColor = /\btext-(?:white|black|(?:gray|slate|sky|red|amber)-\d{2,3})\b/.test(
    className ?? "",
  );
  const defaults = hasTextColor ? darkColorClasses.join(" ") : "dark:text-slate-100";
  const resolvedClassName = `${className ?? ""} ${defaults}`.trim();

  return <NativeText {...props} className={resolvedClassName} />;
}
